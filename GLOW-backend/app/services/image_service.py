
import os
import tempfile
from typing import List
from fastapi import UploadFile
from app.persistence.repositories.collage_repository import CollageRepository
from app.persistence.repositories.images_repository import ImagesRepository

class ImageService:
    def __init__(self):
        self.collage_repo = CollageRepository()
        self.images_repo = ImagesRepository()

    async def process_images(self, images: List[UploadFile]) -> dict:
        # First, create a collage row in DB
        collage_id = self.collage_repo.create_collage()

        # Then, save images to folder and DB with collage_id
        image_paths = []
        for image in images:
            # Save to temp first
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_file.write(await image.read())
                temp_path = temp_file.name

            # Save via repo
            result = self.images_repo.save_image(collage_id, temp_path)
            image_paths.append(result["url"])

        return {"collage_id": collage_id, "image_paths": image_paths}