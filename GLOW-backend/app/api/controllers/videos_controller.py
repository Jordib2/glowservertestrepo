from fastapi import APIRouter, UploadFile, File
from typing import List
from app.services.image_service import ImageService
from app.services.collage_service import CollageService
from app.services.video_service import VideoService

router = APIRouter()

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