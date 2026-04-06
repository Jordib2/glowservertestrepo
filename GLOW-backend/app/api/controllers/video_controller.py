from fastapi import APIRouter
from app.persistence.repositories.images_repository import ImagesRepository

router = APIRouter()
repo = ImagesRepository()

@router.get("/collage/{collage_id}")
def get_collage(collage_id: int):
    images = repo.get_images(collage_id)
    return {
        "collage_id": collage_id,
        "images": images
    }