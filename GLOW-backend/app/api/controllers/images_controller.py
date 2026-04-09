from fastapi import APIRouter
from app.persistence.repositories.images_repository import ImagesRepository

router = APIRouter()
repo = ImagesRepository()

@router.post("/images")
def create_image(collage_id: int, image_url: str):
    return repo.save_image(collage_id, image_url)

@router.get("/images/{collage_id}")
def get_images(collage_id: int):
    return {
        "collage_id": collage_id,
        "images": repo.get_images(collage_id)
    }
