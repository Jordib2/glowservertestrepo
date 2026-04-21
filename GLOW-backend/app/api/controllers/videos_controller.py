from fastapi import APIRouter, UploadFile, File, Form
from typing import List
from app.services.image_service import ImageService
from app.services.collage_service import CollageService
from app.services.video_service import VideoService
import requests
import os
import shutil
import uuid

router = APIRouter()

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
async def generate_video(images: List[UploadFile] = File(...)):
    # Step 1: Call image service to process images, create collage row, save images
    try:
        image_service = ImageService()
        result = await image_service.process_images(images)
        collage_id = result["collage_id"]
        image_paths = result["image_paths"]
    except Exception as e:
        print(f"Error processing images: {e}")
        raise

    # Step 2: Call collage service to generate collage and return path
    try:
        collage_service = CollageService()
        collage_url = collage_service.generate_collage(collage_id, image_paths)
    except Exception as e:
        print(f"Error generating collage: {e}")
        raise

    # Step 3: Call video service to create video from collage path
    try:
        video_service = VideoService()
        video_result = video_service.generate_video(collage_url, collage_id)
    except Exception as e:
        print(f"Error generating video: {e}")
        raise

    return {"video_url": video_result["video_url"]}