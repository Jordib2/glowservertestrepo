import os
from fastapi import APIRouter, UploadFile, File, Form
from app.persistence.repositories.images_repository import ImagesRepository
import requests
import os
import shutil
import uuid

router = APIRouter()
repo = ImagesRepository()

UPLOADS_DIR = "uploads/images"

@router.post("/images")
async def create_image(collage_id: int = Form(...), file: UploadFile = File(...)):
    # Ensure uploads directory exists
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    
    # Save file to disk
    filename = f"{collage_id}_{file.filename}"
    filepath = os.path.join(UPLOADS_DIR, filename)
    
    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)
    
    # Store only filename in database
    return repo.save_image(collage_id, filename)
USE_REMOTE = os.getenv("USE_REMOTE_STORAGE", "false") == "true"
REMOTE_API = os.getenv("REMOTE_API_URL", "")


BASE_DIR = os.getenv("MEDIA_DIR", "media")
UPLOAD_DIR = os.path.join(BASE_DIR, "images")


@router.post("/upload/image")
async def upload_image(
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
            f"{REMOTE_API}/api/upload/image",
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
    file_url = f"{BASE_URL}/media/images/{filename}"

    repo.save_image(collage_id, file_url)

    return {
        "message": "Image uploaded (local)",
        "url": file_url
    }