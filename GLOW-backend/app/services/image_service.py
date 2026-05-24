import os
import uuid
import asyncio
import traceback
from typing import List, Optional
from fastapi import UploadFile

from app.persistence.repositories.collage_repository import CollageRepository
from app.persistence.repositories.images_repository import ImagesRepository
from app.services.image_processor import global_image_processor

BASE_URL = os.getenv("BASE_URL", "https://glow2026.duckdns.org")
MEDIA_DIR = os.getenv("MEDIA_DIR", "/var/www/media")
IMAGES_DIR = os.path.join(MEDIA_DIR, "images")
SVG_DIR = os.path.join(MEDIA_DIR, "svg")

os.makedirs(IMAGES_DIR, exist_ok=True)
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
        threshold: Optional[int] = 50
    ) -> dict:
        try:
            if threshold is None:
                threshold = 50
            elif not isinstance(threshold, int):
                try:
                    threshold = int(threshold)
                except (TypeError, ValueError):
                    threshold = 50

            print(f"[DEBUG] threshold={threshold} type={type(threshold)}")

            # Try to create collage
            try:
                collage_id = self.collage_repo.create_collage()
                print(f"[DEBUG] collage_id={collage_id} type={type(collage_id)}")
            except Exception as e:
                print(f"[ERROR] create_collage failed: {e}")
                print(traceback.format_exc())
                raise

            image_urls = []

            for image in images:
                image_bytes = await image.read()
                unique_filename = f"{uuid.uuid4().hex}.png"
                absolute_image_path = os.path.join(IMAGES_DIR, unique_filename)

                if apply_cutout:
                    try:
                        processed_bytes = await asyncio.to_thread(
                            self.processor.cutout_and_invert_black_to_white,
                            image_bytes,
                            threshold
                        )
                    except Exception as e:
                        print(f"[ERROR] cutout failed: {e}")
                        print(traceback.format_exc())
                        raise

                    with open(absolute_image_path, "wb") as f:
                        f.write(processed_bytes)
                else:
                    with open(absolute_image_path, "wb") as f:
                        f.write(image_bytes)

                image_url = f"{BASE_URL}/media/images/{unique_filename}"
                try:
                    result = self.images_repo.save_image(collage_id, image_url)
                    image_urls.append(result["url"])
                except Exception as e:
                    print(f"[ERROR] save_image failed: {e}")
                    print(traceback.format_exc())
                    raise

            return {
                "collage_id": collage_id,
                "image_paths": image_urls
            }
            
        except Exception as e:
            print(f"[ERROR] process_images failed: {e}")
            print(traceback.format_exc())
            raise
