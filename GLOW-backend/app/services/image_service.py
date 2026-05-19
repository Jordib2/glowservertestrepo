import os
import uuid
import asyncio
from typing import List
from fastapi import UploadFile

from app.persistence.repositories.collage_repository import CollageRepository
from app.persistence.repositories.images_repository import ImagesRepository

from app.services.image_processor import global_image_processor

# Grab the same MEDIA_DIR you defined in main.py
MEDIA_DIR = os.getenv("MEDIA_DIR", "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

# Optional SVG directory
SVG_DIR = os.path.join(MEDIA_DIR, "svg")
os.makedirs(SVG_DIR, exist_ok=True)

class ImageService:
    def __init__(self):
        self.collage_repo = CollageRepository()
        self.images_repo = ImagesRepository()
        self.processor = global_image_processor

    async def process_images(
        self,
        images: List[UploadFile],
        apply_cutout: bool = True,
        threshold: int = 50
    ) -> dict:
        collage_id = self.collage_repo.create_collage()
        image_paths = []

        for image in images:
            image_bytes = await image.read()
            
            # Generate a unique, safe filename
            unique_filename = f"{uuid.uuid4().hex}.png"
            save_path = os.path.join(MEDIA_DIR, unique_filename)

            if apply_cutout:
                # IMPORTANT: Push the heavy AI task to a separate thread
                processed_bytes = await asyncio.to_thread(
                    self.processor.cutout_and_invert_black_to_white,
                    image_bytes,
                    threshold
                )
                
                # Save directly to the media directory
                with open(save_path, "wb") as f:
                    f.write(processed_bytes)
                
                # Optional: Also generate SVG
                try:
                    svg_string = await asyncio.to_thread(
                        self.processor.generate_svg,
                        image_bytes,
                        threshold
                    )
                    
                    svg_filename = f"{uuid.uuid4().hex}.svg"
                    svg_path = os.path.join(SVG_DIR, svg_filename)
                    
                    with open(svg_path, "w", encoding="utf-8") as f:
                        f.write(svg_string)
                except Exception as e:
                    print(f"SVG generation failed (non-critical): {e}")
            else:
                with open(save_path, "wb") as f:
                    f.write(image_bytes)

            # Save to database
            result = self.images_repo.save_image(collage_id, save_path)
            image_paths.append(result["url"])

        return {"collage_id": collage_id, "image_paths": image_paths}