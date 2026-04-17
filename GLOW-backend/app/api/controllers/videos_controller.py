from fastapi import APIRouter, UploadFile, File, Form
from app.persistence.repositories.videos_repository import VideosRepository
import requests
import os
import shutil
import uuid

router = APIRouter()
repo = VideosRepository()

USE_REMOTE = os.getenv("USE_REMOTE_STORAGE", "false") == "true"
REMOTE_API = os.getenv("REMOTE_API_URL", "")


BASE_DIR = os.getenv("MEDIA_DIR", "media")
UPLOAD_DIR = os.path.join(BASE_DIR, "videos")


@router.post("/upload/video")
async def upload_video(
    file: UploadFile = File(...),
    collage_id: int = Form(...)
):
    # 🔥 IF REMOTE → send to server
    if USE_REMOTE:
        files = {
            "file": (file.filename, file.file, file.content_type)
        }
        data = {
            "collage_id": collage_id
        }

        response = requests.post(
            f"{REMOTE_API}/api/upload/video",
            files=files,
            data=data
        )

        return response.json()

    # ✅ LOCAL fallback (for offline dev)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
    file_url = f"{BASE_URL}/media/videos/{filename}"

    repo.save_video(collage_id, file_url)

    return {
        "message": "Video uploaded (local)",
        "url": file_url
    }


@router.get("/videos/{collage_id}")
def get_videos(collage_id: int):
    return repo.get_videos(collage_id)