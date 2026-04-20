from fastapi import APIRouter
from app.persistence.repositories.collages_repository import CollagesRepository

router = APIRouter()
repo = CollagesRepository()

@router.get("/collages")
def get_collages():
    return repo.get_collages()