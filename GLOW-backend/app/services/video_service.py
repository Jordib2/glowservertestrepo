
class Videoservice:
    async def create_video_from_collage(self, collage_id: int) -> dict:
        return {"message": f"Video created successfully for collage {collage_id}"}