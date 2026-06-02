import os
import json
import math
import random
import uuid
from typing import List
from PIL import Image
from app.persistence.repositories.collage_repository import CollageRepository


ANIM_PARAMS = {
    "bob":   {"amp": (4, 12),      "freq": (0.15, 0.4)},   # pixels of vertical drift
    "tilt":  {"amp": (4, 12),       "freq": (0.15, 0.5)},   # degrees of rotation wobble
    "pulse": {"amp": (0.04, 0.09), "freq": (0.25, 0.6)},   # fraction of scale change
}


def _random_anim() -> dict:
    t = random.choice(list(ANIM_PARAMS))
    p = ANIM_PARAMS[t]
    return {
        "type":  t,
        "amp":   random.uniform(*p["amp"]),
        "freq":  random.uniform(*p["freq"]),
        "phase": random.uniform(0, 2 * math.pi),  # desync sprites
    }


class CollageService:
    def __init__(self):
        self.collage_repo = CollageRepository()

    def _overlaps(self, x, y, w, h, placed, gap):
        for (px, py, pw, ph) in placed:
            if (x < px + pw + gap and x + w + gap > px and
                y < py + ph + gap and y + h + gap > py):
                return True
        return False

    def _resolve_local_path(self, url: str, base_media_dir: str) -> str:
        if '/media/' in url:
            return os.path.join(base_media_dir, url.split('/media/', 1)[1])
        if url.startswith('media/') or url.startswith(base_media_dir + '/'):
            return url
        return os.path.join(base_media_dir, url.lstrip('/'))

    def generate_collage(self, collage_id: int, image_urls: List[str]) -> str:
        base_media_dir = os.getenv("MEDIA_DIR", "media")

        # Resolve and validate input image paths
        source_paths = []
        for url in image_urls:
            p = self._resolve_local_path(url, base_media_dir)
            if os.path.exists(p):
                source_paths.append(p)
            else:
                print(f"Missing file: {p}")

        if not source_paths:
            raise ValueError("No valid images found")

        # Background defines the canvas size
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        background_path = os.path.join(base_dir, "assets", "collage_background.png")
        background = Image.open(background_path).convert("RGBA")
        canvas_w, canvas_h = background.size
        print(f"Canvas: {canvas_w}x{canvas_h}")

        IMG_SIZE = 250
        GAP = -130
        ANGLE = 30
        MAX_ATTEMPTS = 1000
        TARGET_COUNT = 280
        print(f"Targeting ~{TARGET_COUNT} sprites, img={IMG_SIZE}px, gap={GAP}px")

        sprites = []
        placed_boxes = []
        random.shuffle(source_paths)
        cycle = 0

        for _ in range(TARGET_COUNT):
            if cycle % len(source_paths) == 0:
                random.shuffle(source_paths)
            image_path = source_paths[cycle % len(source_paths)]
            cycle += 1

            placed = False
            for _ in range(MAX_ATTEMPTS):
                x = random.randint(0, max(0, canvas_w - IMG_SIZE))
                y = random.randint(0, max(0, canvas_h - IMG_SIZE))
                if not self._overlaps(x, y, IMG_SIZE, IMG_SIZE, placed_boxes, GAP):
                    placed_boxes.append((x, y, IMG_SIZE, IMG_SIZE))
                    sprites.append({
                        "image_path": image_path,
                        "center_x": x + IMG_SIZE // 2,
                        "center_y": y + IMG_SIZE // 2,
                        "size":     IMG_SIZE,
                        "angle":    random.uniform(-ANGLE, ANGLE),
                        "scale":    1.0,
                        "anim":     _random_anim(),
                    })
                    placed = True
                    break
            if not placed:
                print(f"Canvas full after {len(sprites)} sprites")
                break

        print(f"Placed {len(sprites)} sprites total")

        # Save scene JSON + a static preview PNG side by side
        collages_subdir = "collages"
        collages_dir = os.path.join(base_media_dir, collages_subdir)
        os.makedirs(collages_dir, exist_ok=True)

        scene_id = uuid.uuid4().hex
        scene_path   = os.path.join(collages_dir, f"{scene_id}.json")
        preview_path = os.path.join(collages_dir, f"{scene_id}.png")

        scene_data = {
            "canvas": [canvas_w, canvas_h],
            "background_path": background_path,
            "sprites": sprites,
        }
        with open(scene_path, "w") as f:
            json.dump(scene_data, f)

        self._render_preview(scene_data, preview_path)
        print(f"Saved scene: {scene_path}")
        print(f"Saved preview: {preview_path}")

        collage_url = f"{base_media_dir}/{collages_subdir}/{scene_id}.png"
        self.collage_repo.update_collage_path(collage_id, collage_url)
        return collage_url

    def _render_preview(self, scene_data: dict, output_path: str):
        """Render a static still of the scene at t=0 — useful as a thumbnail."""
        background = Image.open(scene_data["background_path"]).convert("RGBA")
        collage = background.copy()
        for s in scene_data["sprites"]:
            img = Image.open(s["image_path"]).convert("RGBA")
            img.thumbnail((s["size"], s["size"]), Image.LANCZOS)
            if s["angle"] != 0:
                img = img.rotate(s["angle"], expand=True, resample=Image.BICUBIC)
            px = int(s["center_x"] - img.width // 2)
            py = int(s["center_y"] - img.height // 2)
            collage.paste(img, (px, py), img)
        collage.save(output_path, "PNG")