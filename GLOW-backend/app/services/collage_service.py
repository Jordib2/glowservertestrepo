import os
import json
import math
import random
import uuid
from typing import List
from PIL import Image
from app.persistence.repositories.collage_repository import CollageRepository


ANIM_PARAMS = {
    "tilt":  {"amp": (2, 6),      "freq": (0.15, 0.5)},
    "tilt":  {"amp": (3, 7),      "freq": (0.15, 0.5)},
}

# Light randomness layered on top of each point's authored angle/size so
# repeated points (when images cycle) don't look perfectly identical.
ANGLE_JITTER = 5     # +/- degrees added to a point's hinted angle
SIZE_JITTER = 0.06   # +/- fraction added to a point's hinted size


def _random_anim() -> dict:
    t = random.choice(list(ANIM_PARAMS))
    p = ANIM_PARAMS[t]
    return {
        "type":  t,
        "amp":   random.uniform(*p["amp"]),
        "freq":  random.uniform(*p["freq"]),
        "phase": random.uniform(0, 2 * math.pi),
    }


class CollageService:
    def __init__(self):
        self.collage_repo = CollageRepository()

    def _resolve_local_path(self, url: str, base_media_dir: str) -> str:
        if '/media/' in url:
            return os.path.join(base_media_dir, url.split('/media/', 1)[1])
        if url.startswith('media/') or url.startswith(base_media_dir + '/'):
            return url
        return os.path.join(base_media_dir, url.lstrip('/'))

    def _load_placement_points(self, points_path: str, canvas_w: int, canvas_h: int) -> list:
        """Load hand-authored {x, y, size, angle} points for this background.

        If points were authored against a different canvas size than the
        background image currently in use, rescale them proportionally so
        they still line up with the artwork.
        """
        if not os.path.exists(points_path):
            raise ValueError(
                f"No placement points file found at {points_path}. "
                "Create one with a 'points' list of {x, y, size, angle} entries."
            )

        with open(points_path) as f:
            data = json.load(f)

        points = data.get("points", [])
        if not points:
            raise ValueError(f"Placement points file at {points_path} has no points")

        authored_canvas = data.get("canvas")
        if authored_canvas and tuple(authored_canvas) != (canvas_w, canvas_h):
            sx = canvas_w / authored_canvas[0]
            sy = canvas_h / authored_canvas[1]
            s_avg = (sx + sy) / 2
            print(f"Rescaling placement points from {authored_canvas} to {(canvas_w, canvas_h)}")
            points = [
                {
                    "x": p["x"] * sx,
                    "y": p["y"] * sy,
                    "size": p.get("size", 250) * s_avg,
                    "angle": p.get("angle", 0),
                }
                for p in points
            ]

        return points

    def generate_collage(self, collage_id: int, image_urls: List[str]) -> str:
        base_media_dir = os.getenv("MEDIA_DIR", "media")

        source_paths = []
        for url in image_urls:
            p = self._resolve_local_path(url, base_media_dir)
            if os.path.exists(p):
                source_paths.append(p)
            else:
                print(f"Missing file: {p}")

        if not source_paths:
            raise ValueError("No valid images found")

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        background_path = os.path.join(base_dir, "assets", "collage_background.png")
        points_path = os.path.join(base_dir, "assets", "collage_background_points.json")
        background = Image.open(background_path).convert("RGBA")
        canvas_w, canvas_h = background.size
        print(f"Canvas: {canvas_w}x{canvas_h}")

        points = self._load_placement_points(points_path, canvas_w, canvas_h)
        print(f"Loaded {len(points)} placement points")

        sprites = []
        cycle = 0
        for point in points:
            if cycle % len(source_paths) == 0:
                random.shuffle(source_paths)
            image_path = source_paths[cycle % len(source_paths)]
            cycle += 1

            base_angle = point.get("angle", 0)
            base_size = point.get("size", 250)

            sprites.append({
                "image_path": image_path,
                "center_x": point["x"],
                "center_y": point["y"],
                "size":     max(1, base_size * random.uniform(1 - SIZE_JITTER, 1 + SIZE_JITTER)),
                "angle":    base_angle + random.uniform(-ANGLE_JITTER, ANGLE_JITTER),
                "scale":    1.0,
                "anim":     _random_anim(),
            })

        print(f"Placed {len(sprites)} sprites total")

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
        background = Image.open(scene_data["background_path"]).convert("RGBA")
        collage = background.copy()
        for s in scene_data["sprites"]:
            img = Image.open(s["image_path"]).convert("RGBA")
            img.thumbnail((int(s["size"]), int(s["size"])), Image.LANCZOS)
            if s["angle"] != 0:
                img = img.rotate(s["angle"], expand=True, resample=Image.BICUBIC)
            px = int(s["center_x"] - img.width // 2)
            py = int(s["center_y"] - img.height // 2)
            collage.paste(img, (px, py), img)
        collage.save(output_path, "PNG")