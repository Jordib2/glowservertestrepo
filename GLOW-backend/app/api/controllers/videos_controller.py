from fastapi import APIRouter, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from app.persistence.repositories.videos_repository import VideosRepository
import requests
import os
import shutil
import uuid

from app.services.video_service import VideoService
from app.services.image_service import ImageService
from app.services.collage_service import CollageService

router = APIRouter()
repo = VideosRepository()

#Not sure which directory for rendering videos from server folder
#app.mount("/media", StaticFiles(directory="media"), name="media")

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


@router.post("/generate-video")
def generate_video(
    images: list[UploadFile] = File(...),
):
    #next sprint - images validation

    try:
        saved_images_paths = ImageService.save_uploaded_images(images)
    except Exception as e:
        return {"error": f"Failed step 1 - save images: {str(e)}"}

    try:
        collage_path = CollageService.create_collage_from_images(saved_images_paths)
    except Exception as e:
        return {"error": f"Failed step 2 - create collage: {str(e)}"}

    try:
        video_url = VideoService.create_video_from_collage(collage_path)
    except Exception as e:
        return {"error": f"Failed step 3 - create video: {str(e)}"}

    return {"video_url": video_url}