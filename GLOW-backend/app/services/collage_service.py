
class CollageService:
    async def create_collage(self, collage_id: int) -> dict:
        images = await self.get_images_for_collage(collage_id)
        if not images["images"]:
            return {"message": f"No images found for collage {collage_id}"}
        return {"message": f"Collage {collage_id} created successfully"}

    async def get_images_for_collage(self, collage_id: int) -> dict:
        return {"collage_id": collage_id, "images": []}

