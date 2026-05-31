from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Depends
from typing import List
from app.services.image_service import ImageService
from app.services.collage_service import CollageService
from app.services.video_service import VideoService
from app.persistence.repositories.videos_repository import VideosRepository
from app.core.deps import get_current_user, require_roles

import asyncio
import threading
import queue
import json
from fastapi.responses import StreamingResponse
import requests
import os
import shutil
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()

# ✅ Needed for local save
repo = VideosRepository()
USE_REMOTE = os.getenv("USE_REMOTE_STORAGE", "false") == "true"
REMOTE_API = os.getenv("REMOTE_API_URL", "")
BASE_DIR = os.getenv("MEDIA_DIR", "media")
UPLOAD_DIR = os.path.join(BASE_DIR, "videos")
limiter = Limiter(key_func=get_remote_address)

_progress_queues: dict = {}


@router.post("/upload/video")
async def upload_video(
    file: UploadFile = File(...),
    collage_id: int = Form(...)
):
    try:
        if USE_REMOTE:
            files = {"file": (file.filename, file.file, file.content_type)}
            data = {"collage_id": collage_id}
            response = requests.post(f"{REMOTE_API}/api/upload/video", files=files, data=data)
            return response.json()

        os.makedirs(UPLOAD_DIR, exist_ok=True)
        filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
        file_url = f"{BASE_URL}/media/videos/{filename}"
        repo.save_video(collage_id, file_url)
        return {"message": "Video uploaded (local)", "url": file_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/generate-video/progress/{job_id}")
async def video_progress(job_id: str):
    """SSE endpoint — frontend listens here for real-time progress."""
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


@router.post("/generate-video")
@limiter.limit("5/minute")
async def generate_video(request: Request, user: dict = Depends(get_current_user), images: List[UploadFile] = File(...)):
    try:
        image_service = ImageService()
        result = await image_service.process_images(
            images=images,
            apply_cutout=True,
            threshold=50
        )
        collage_id = result["collage_id"]
        image_paths = result["image_paths"]
    except Exception as e:
        print(f"Error processing images: {e}")
        raise HTTPException(status_code=500, detail=str(e))

   
    try:
        collage_service = CollageService()
        collage_url = collage_service.generate_collage(collage_id, image_paths)
    except Exception as e:
        print(f"Error generating collage: {e}")
        raise HTTPException(status_code=500, detail=str(e))

  
    job_id = str(uuid.uuid4())
    q = queue.Queue()
    _progress_queues[job_id] = q

    def run_video_generation():
        try:
            def on_progress(current, total):
                q.put(json.dumps({"frame": current, "total": total}))

            video_service = VideoService()
            video_result = video_service.generate_video(
                collage_url, collage_id, progress_callback=on_progress
            )
            q.put(json.dumps({"done": True, "video_url": video_result["video_url"]}))
        except Exception as e:
            q.put(json.dumps({"error": str(e)}))

    threading.Thread(target=run_video_generation, daemon=True).start()

    
    return {"job_id": job_id}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return user