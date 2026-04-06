
class UploadService:
    async def save_uploaded_images(self, images: list[str], collage_id: int) -> dict:
        valid = self.validate_images(images)
        if not valid:
            return {"message": "Invalid images provided"}
        #Save images and associate with collage_id in db
        return {"message": "Images uploaded successfully"} 

    def validate_images(self, images: list[str]) -> bool:
        return True