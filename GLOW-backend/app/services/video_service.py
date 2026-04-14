
from app.persistence.repositories.collage_repository import CollageRepository

class VideoService:
    async def create_video_from_collage(self, collage_id: int) -> dict:

        collage = CollageRepository().get_collage(collage_id)

        #Animation logic to create video from collage goes here


        return {
            "message": f"Video created successfully for collage {collage_id}",
            "video": video
        }