import os
from fastapi import APIRouter, UploadFile, File, Form
from app.persistence.repositories.images_repository import ImagesRepository

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

@router.get("/images/{collage_id}")
def get_images(collage_id: int):
    return {
        "collage_id": collage_id,
        "images": repo.get_images(collage_id)
    }