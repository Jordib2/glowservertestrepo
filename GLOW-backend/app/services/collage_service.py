import os
from typing import List
from PIL import Image
import uuid
import random

from app.persistence.repositories.collage_repository import CollageRepository


BASE_URL = os.getenv(
    "BASE_URL",
    "https://glow2026.duckdns.org"
)

MEDIA_DIR = os.getenv(
    "MEDIA_DIR",
    "/var/www/media"
)


class CollageService:

    def __init__(self):
        self.collage_repo = CollageRepository()

    def _resize_and_fit(self, img: Image.Image, size: tuple) -> Image.Image:
        img = img.copy()
        img.thumbnail(size, Image.LANCZOS)
        canvas = Image.new("RGBA", size, (255, 255, 255, 0))
        x = (size[0] - img.width) // 2
        y = (size[1] - img.height) // 2
        canvas.paste(img, (x, y), img if img.mode == "RGBA" else None)
        return canvas

    def generate_collage(
        self,
        collage_id: int,
        image_urls: List[str]
    ) -> str:
        # Safety check - filter out invalid URLs
        valid_urls = []
        for url in image_urls:
            if url and isinstance(url, str) and "/media/" in url:
                valid_urls.append(url)
            else:
                print(f"Skipping invalid URL: {url}")
        
        if not valid_urls:
            raise ValueError("No valid image URLs provided")
        
        image_paths = []
        for url in valid_urls:
            try:
                relative_path = url.split("/media/")[1]
                local_path = os.path.join(MEDIA_DIR, relative_path)
                image_paths.append(local_path)
            except Exception as e:
                print(f"Error parsing URL {url}: {e}")
                continue

        source_images = []
        for path in image_paths:
            if not os.path.exists(path):
                print(f"Missing file: {path}")
                continue
            try:
                img = Image.open(path).convert("RGBA")
                source_images.append(img)
                print(f"Loaded: {path}")
            except Exception as e:
                print(f"Error loading {path}: {e}")

        if not source_images:
            raise ValueError("No valid images found")

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        background_path = os.path.join(base_dir, "assets", "collage_background.png")
        
        if not os.path.exists(background_path):
            raise ValueError(f"Background image not found at {background_path}")

        background = Image.open(background_path).convert("RGBA")
        collage = background.copy()
        canvas_w, canvas_h = collage.size

        print(f"Canvas: {canvas_w}x{canvas_h}")

        COLS = 8
        GAP = 4
        aspect_ratio = canvas_w / canvas_h
        ROWS = round(COLS / aspect_ratio)
        ROWS = max(1, ROWS)
        TILE_W = canvas_w // COLS
        TILE_H = canvas_h // ROWS
        IMG_W = TILE_W - GAP * 2
        IMG_H = TILE_H - GAP * 2
        IMG_SIZE = min(IMG_W, IMG_H)
        IMG_SIZE = max(1, IMG_SIZE)
        ANGLE = 10

        img_cycle = 0
        random.shuffle(source_images)

        for row in range(ROWS):
            for col in range(COLS):
                if img_cycle % len(source_images) == 0:
                    random.shuffle(source_images)
                img = source_images[img_cycle % len(source_images)]
                img_cycle += 1
                tile = self._resize_and_fit(img, (IMG_SIZE, IMG_SIZE))
                angle = random.uniform(-ANGLE, ANGLE)
                tile = tile.rotate(angle, expand=False)
                cell_x = col * TILE_W
                cell_y = row * TILE_H
                offset_x = (TILE_W - tile.width) // 2
                offset_y = (TILE_H - tile.height) // 2
                x = cell_x + offset_x
                y = cell_y + offset_y
                collage.paste(tile, (x, y), tile)

        os.makedirs(os.path.join(MEDIA_DIR, "collages"), exist_ok=True)
        filename = f"{uuid.uuid4()}_collage_{collage_id}.png"
        absolute_path = os.path.join(MEDIA_DIR, "collages", filename)
        collage.save(absolute_path, "PNG")
        collage_url = f"{BASE_URL}/media/collages/{filename}"
        
        self.collage_repo.update_collage_path(collage_id, collage_url)
        
        return collage_url
