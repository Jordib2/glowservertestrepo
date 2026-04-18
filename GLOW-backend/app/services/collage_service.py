import os
import math
from typing import List
from PIL import Image
import uuid

from app.persistence.repositories.images_repository import ImagesRepository
from app.persistence.repositories.collages_repository import CollagesRepository


class CollageService:

    def __init__(self):
        self.images_repo = ImagesRepository()
        self.collages_repo = CollagesRepository()

    def create_collage(self):
        collage = self.collages_repo.create_collage()
        collage_id = collage["id"]

        image_rows = self.images_repo.get_images(collage_id)
        image_paths = [img["url"] for img in image_rows]

        if not image_paths:
            return {"message": "No images found"}

        try:
            output_path = self._generate_tapestry(image_paths, collage_id)

            return {
                "message": f"Collage {collage_id} created successfully",
                "path": output_path
            }

        except Exception as e:
            return {"message": f"Error: {str(e)}"}

    def _resize_and_fit(self, img: Image.Image, size: tuple) -> Image.Image:
        img.thumbnail(size)

        background = Image.new("RGBA", size, (255, 255, 255, 0))

        x = (size[0] - img.width) // 2
        y = (size[1] - img.height) // 2

        background.paste(img, (x, y), img if img.mode == "RGBA" else None)

        return background

    def _generate_tapestry(
        self,
        image_paths: List[str],
        collage_id: int,
        tile_size=(250, 250),
        padding=10
    ) -> str:

        images = []

        for path in image_paths:
            if not os.path.exists(path):
                print(f"Missing file: {path}")
                continue

            try:
                img = Image.open(path).convert("RGBA")
                img = self._resize_and_fit(img, tile_size)
                images.append(img)

            except Exception as e:
                print(f"Error processing {path}: {e}")

        if not images:
            raise ValueError("No valid images found")

        cols = len(images)
        rows = 1

        width = cols * tile_size[0] + (cols - 1) * padding
        height = tile_size[1]

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        background_path = os.path.join(base_dir, "assets", "collage_background.png")

        if not os.path.exists(background_path):
            raise FileNotFoundError("Background template not found")

        background = Image.open(background_path).convert("RGBA")
        
        background = background.resize((width, height))
        collage = background

        for i, img in enumerate(images):
            x = (i % cols) * (tile_size[0] + padding)
            y = (i // cols) * (tile_size[1] + padding)

            collage.paste(img, (x, y), img)

        output_dir = os.path.join(base_dir, "../../collages")
        os.makedirs(output_dir, exist_ok=True)

        random_id = uuid.uuid4().hex

        output_path = f"{output_dir}/collage_{random_id}.png"
        collage.save(output_path, "PNG")

        return output_path