import os
from typing import List, Tuple
from PIL import Image
import uuid
import random
from app.persistence.repositories.collage_repository import CollageRepository


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

    def _overlaps(self, x: int, y: int, w: int, h: int, placed: List[Tuple], gap: int) -> bool:
        for (px, py, pw, ph) in placed:
            if (x < px + pw + gap and
                x + w + gap > px and
                y < py + ph + gap and
                y + h + gap > py):
                return True
        return False

    def generate_collage(self, collage_id: int, image_urls: List[str]) -> str:
        base_media_dir = os.getenv("MEDIA_DIR", "media")
        image_paths = []
        for url in image_urls:
            relative_path = url.split('/media/')[1]
            local_path = os.path.join(base_media_dir, relative_path)
            image_paths.append(local_path)

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
        background = Image.open(background_path).convert("RGBA")
        collage = background.copy()
        canvas_w, canvas_h = collage.size
        print(f"Canvas: {canvas_w}x{canvas_h}")

        IMG_SIZE = 150        # All images same size
        GAP = 1               # 1px — just enough to not overlap
        ANGLE = 30            # Max rotation degrees
        MAX_ATTEMPTS = 1000
        TARGET_COUNT = (canvas_w * canvas_h) // ((IMG_SIZE + GAP) ** 2) + 20

        print(f"Targeting ~{TARGET_COUNT} images, img={IMG_SIZE}px, gap={GAP}px")

        placed = []
        img_cycle = 0
        random.shuffle(source_images)

        for _ in range(TARGET_COUNT):
            if img_cycle % len(source_images) == 0:
                random.shuffle(source_images)

            img = source_images[img_cycle % len(source_images)]
            img_cycle += 1

            tile = self._resize_and_fit(img, (IMG_SIZE, IMG_SIZE))
            angle = random.uniform(-ANGLE, ANGLE)
            expand=False 
            
            tile = tile.rotate(angle, expand=False)

            for _ in range(MAX_ATTEMPTS):
                x = random.randint(0, max(0, canvas_w - tile.width))
                y = random.randint(0, max(0, canvas_h - tile.height))

                if not self._overlaps(x, y, tile.width, tile.height, placed, GAP):
                    collage.paste(tile, (x, y), tile)
                    placed.append((x, y, tile.width, tile.height))
                    break
            else:
                print(f"Canvas full after {len(placed)} images")
                break

        print(f"Placed {len(placed)} images total")

        temp_path = f"/tmp/collage_{collage_id}_{uuid.uuid4().hex}.png"
        collage.save(temp_path, "PNG")
        print(f"Saved temp: {temp_path}")

        collage_url = self.collage_repo.save_collage_file(collage_id, temp_path)
        return collage_url

