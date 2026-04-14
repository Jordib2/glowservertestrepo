from fastapi import APIRouter
from app.services.video_service.py import VideoService

router = APIRouter()
repo = VideosRepository()

@router.post("/videos")
def create_video(collage_id: int):
    return repo.save_video(collage_id)

@router.get("/videos/{collage_id}")
def get_videos(collage_id: int):
    return repo.get_videos(collage_id)
