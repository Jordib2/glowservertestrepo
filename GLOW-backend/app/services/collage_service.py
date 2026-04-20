import os
import math
from typing import List
from PIL import Image
import uuid
import random


class CollageService:

    def _resize_and_fit(self, img: Image.Image, size: tuple) -> Image.Image:
        img = img.copy()
        img.thumbnail(size, Image.LANCZOS)
        canvas = Image.new("RGBA", size, (255, 255, 255, 0))
        x = (size[0] - img.width) // 2
        y = (size[1] - img.height) // 2
        canvas.paste(img, (x, y), img if img.mode == "RGBA" else None)
        return canvas

    def _generate_tapestry(
        self,
        image_paths: List[str],
        collage_id: int,
    ) -> str:

        
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

        
        COLS = 8   
        GAP  = 4     

      
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

        print(f"Grid: {COLS} cols x {ROWS} rows, tile={TILE_W}x{TILE_H}, img={IMG_SIZE}x{IMG_SIZE}, gap={GAP}px")

       
        img_cycle = 0
        total_placed = 0
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
                total_placed += 1

        print(f"Placed {total_placed} tiles total")

      
        output_dir = os.path.join(base_dir, "../../collages")
        os.makedirs(output_dir, exist_ok=True)

        output_path = os.path.join(
            output_dir,
            f"collage_{uuid.uuid4().hex}.png"
        )

        collage.save(output_path, "PNG")
        print(f"Saved: {output_path}")
        return output_path