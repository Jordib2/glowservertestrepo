from fastapi import APIRouter, UploadFile, File
from app.persistence.repositories.collages_repository import CollagesRepository
import requests
import os
import shutil
import uuid

router = APIRouter()
repo = CollagesRepository()

USE_REMOTE = os.getenv("USE_REMOTE_STORAGE", "false") == "true"
REMOTE_API = os.getenv("REMOTE_API_URL", "")

BASE_DIR = os.getenv("MEDIA_DIR", "media")
UPLOAD_DIR = os.path.join(BASE_DIR, "collages")


@router.post("/upload/collage")
async def upload_collage(
    file: UploadFile = File(...)
):
    # 🔥 IF REMOTE → send to server
    if USE_REMOTE:
        files = {
            "file": (file.filename, file.file, file.content_type)
        }

        response = requests.post(
            f"{REMOTE_API}/api/upload/collage",
            files=files
        )

        return response.json()

    # ✅ LOCAL fallback (for offline dev)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
    file_url = f"{BASE_URL}/media/collages/{filename}"

    result = repo.create_collage(file_url)

    return {
        "message": "Collage uploaded (local)",
        "url": file_url,
        "id": result["id"]
    }


@router.get("/collages")
def get_collages():
    return repo.get_collages()