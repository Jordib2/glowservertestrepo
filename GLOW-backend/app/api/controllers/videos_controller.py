from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from app.services.image_service import ImageService
from app.services.collage_service import CollageService
from app.services.video_service import VideoService
from app.core.deps import get_current_user

import threading
import queue
import json
import os
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

_progress_queues: dict = {}


@router.post("/generate-video")
@limiter.limit("5/minute")
async def generate_video(
    request: Request,
    user: dict = Depends(get_current_user),
    images: List[UploadFile] = File(...)
):
    # 1. Process images
    try:
        image_service = ImageService()
        result = await image_service.process_images(
            images=images, apply_cutout=True, threshold=50
        )
        collage_id = result["collage_id"]
        image_paths = result["image_paths"]
    except Exception as e:
        print(f"Error processing images: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # 2. Generate collage
    try:
        collage_service = CollageService()
        collage_url = collage_service.generate_collage(collage_id, image_paths)
    except Exception as e:
        print(f"Error generating collage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # 3. Setup progress queue (for SSE)
    job_id = str(uuid.uuid4())
    q = queue.Queue()
    _progress_queues[job_id] = q

    # 4. Run video generation in background thread
    def run_video_generation():
        try:
            def on_progress(current, total):
                q.put(json.dumps({"frame": current, "total": total}))

            video_service = VideoService()
            video_result = video_service.generate_video(
                collage_url, collage_id, progress_callback=on_progress
            )
            q.put(json.dumps({
                "done": True,
                "video_url": video_result["video_url"],
                "video_id": video_result["video_id"]
            }))
        except Exception as e:
            q.put(json.dumps({"error": str(e)}))

    threading.Thread(target=run_video_generation, daemon=True).start()

    return {"job_id": job_id}


@router.get("/generate-video/progress/{job_id}")
async def video_progress(job_id: str):
    """SSE endpoint — frontend receives real-time frame updates."""
    if job_id not in _progress_queues:
        raise HTTPException(status_code=404, detail="Job not found")

    q = _progress_queues[job_id]

    def stream():
        try:
            while True:
                try:
                    msg = q.get(timeout=180)
                except queue.Empty:
                    yield "data: " + json.dumps({"error": "timeout"}) + "\n\n"
                    break
                yield f"data: {msg}\n\n"
                parsed = json.loads(msg)
                if parsed.get("done") or parsed.get("error"):
                    break
        finally:
            _progress_queues.pop(job_id, None)

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )


class ExportInfoRequest(BaseModel):
    video_id: int
    school_name: str
    class_name: str


@router.post("/export-info")
async def save_export_info(data: ExportInfoRequest, user: dict = Depends(get_current_user)):
    from app.core.db import get_db
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE videos SET school_name = %s, class_name = %s, user_id = %s WHERE id = %s",
        (data.school_name, data.class_name, user["id"], data.video_id)
    )
    db.commit()
    cursor.close()
    db.close()
    return {"message": "Export info saved"}


@router.get("/my-videos")
async def get_my_videos(user: dict = Depends(get_current_user)):
    from app.core.db import get_db
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM videos WHERE user_id = %s ORDER BY id DESC",
        (user["id"],)
    )
    videos = cursor.fetchall()
    cursor.close()
    db.close()

    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
    for v in videos:
        path = v.get("video_path", "")
        if path and not path.startswith("http"):
            v["video_path"] = f"{BASE_URL}/media/{path}" if not path.startswith("media/") else f"{BASE_URL}/{path}"

    return videos