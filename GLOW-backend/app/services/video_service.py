import os
import json
import math
import uuid
import subprocess
from pathlib import Path
from PIL import Image
import numpy as np
import cv2
from app.persistence.repositories.collage_repository import CollageRepository
from app.persistence.repositories.videos_repository import VideosRepository


class VideoService:
    def __init__(self):
        self.video_repo = VideosRepository()
        self.collage_repo = CollageRepository()
        self.base_media_dir = os.getenv("MEDIA_DIR", "media")
        self.videos_subdir = "videos"
        self.video_dir = Path(self.base_media_dir) / self.videos_subdir

    def _resolve_local_path(self, url: str) -> str:
        if '/media/' in url:
            return os.path.join(self.base_media_dir, url.split('/media/', 1)[1])
        if url.startswith(self.base_media_dir + '/'):
            return url
        return os.path.join(self.base_media_dir, url.lstrip('/'))

    def _animated(self, sprite: dict, t: float):
        """Return (cx, cy, angle, scale) for this sprite at time t."""
        a = sprite["anim"]
        cx = sprite["_cx"]
        cy = sprite["_cy"]
        angle = sprite["angle"]
        scale = 1.0
        w = 2 * math.pi * a["freq"] * t + a["phase"]
        if a["type"] == "bob":
            cy += a["amp"] * self._video_scale * math.sin(w)
        elif a["type"] == "tilt":
            angle += a["amp"] * math.sin(w)
        elif a["type"] == "pulse":
            scale *= 1.0 + a["amp"] * math.sin(w)
        return cx, cy, angle, scale

    def generate_video(self, collage_url: str, collage_id: int, progress_callback=None) -> dict:
        if not collage_url:
            raise ValueError(f"collage_url is empty for collage_id={collage_id}")

        preview_path = self._resolve_local_path(collage_url)
        scene_path = os.path.splitext(preview_path)[0] + ".json"
        if not os.path.exists(scene_path):
            raise ValueError(f"Scene JSON not found at {scene_path}")

        with open(scene_path) as f:
            scene = json.load(f)

        canvas_w, canvas_h = scene["canvas"]
        sprites = scene["sprites"]

        video_width = 1900
        video_height = 1200

        self._video_scale = video_height / canvas_h
        scaled_w = int(canvas_w * self._video_scale)
        if scaled_w <= video_width:
            raise ValueError("Collage is not wide enough for sliding animation")

        background = Image.open(scene["background_path"]).convert("RGBA")
        background_scaled = background.resize((scaled_w, video_height), Image.LANCZOS)

        for s in sprites:
            img = Image.open(s["image_path"]).convert("RGBA")
            img.thumbnail((s["size"], s["size"]), Image.LANCZOS)
            target = max(1, int(s["size"] * self._video_scale))
            scale = target / max(img.width, img.height)
            final_size = (max(1, int(img.width * scale)), max(1, int(img.height * scale)))
            
            s["_image"] = img.resize(final_size, Image.LANCZOS)
            s["_cx"] = s["center_x"] * self._video_scale
            s["_cy"] = s["center_y"] * self._video_scale

        self.video_dir.mkdir(parents=True, exist_ok=True)

        fps = 30
        duration_seconds = 10
        total_frames = fps * duration_seconds
        max_x = scaled_w - video_width
        step_x = max_x / total_frames

        filename = f"{uuid.uuid4()}_collage_{collage_id}.mp4"
        absolute_output_path = self.video_dir / filename
        temp_path = self.video_dir / f"temp_{filename}"

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(
            str(temp_path), fourcc, fps, (video_width, video_height)
        )
        if not video_writer.isOpened():
            raise RuntimeError(f"Failed to create video writer for path: {temp_path}")

        try:
            for i in range(total_frames):
                t = i / fps
                camera_x = int(i * step_x)
                pil_frame = self._render_frame(
                    background_scaled, sprites, camera_x, video_width, video_height, t
                )
                bgr = cv2.cvtColor(
                    np.array(pil_frame.convert("RGB")), cv2.COLOR_RGB2BGR
                )
                video_writer.write(bgr)
                if i % 30 == 0:
                    print(f"Rendered frame {i}/{total_frames}")
                    if progress_callback:
                        progress_callback(i, total_frames)
        finally:
            video_writer.release()

        try:
            subprocess.run([
                "ffmpeg", "-y", "-i", str(temp_path),
                "-vcodec", "libx264", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", str(absolute_output_path),
            ], check=True)
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"FFmpeg failed: {e}")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        relative_video_path = f"{self.videos_subdir}/{filename}"
        saved_video = self.video_repo.save_video(collage_id, str(relative_video_path))

        BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
        video_url = f"{BASE_URL}/media/{relative_video_path}"

        
        if progress_callback:
            progress_callback(total_frames, total_frames)

        return {
            "message":    f"Video created successfully for collage {collage_id}",
            "video_id":   saved_video["id"],
            "collage_id": collage_id,
            "video_url":  video_url,
        }

    def _render_frame(self, background_scaled, sprites, camera_x, view_w, view_h, t):
        """Composite one frame: viewport from background + all animated sprites."""
        frame = background_scaled.crop(
            (camera_x, 0, camera_x + view_w, view_h)
        ).convert("RGBA")

        for s in sprites:
            cx, cy, angle, dyn_scale = self._animated(s, t)

            tile = s["_image"]
            if abs(dyn_scale - 1.0) > 1e-3:
                tile = tile.resize(
                    (max(1, int(tile.width  * dyn_scale)),
                     max(1, int(tile.height * dyn_scale))),
                    Image.LANCZOS,
                )
            if angle != 0:
                tile = tile.rotate(angle, expand=True, resample=Image.BICUBIC)

            screen_x = int(cx - camera_x)
            screen_y = int(cy)
            half_w = tile.width  // 2
            half_h = tile.height // 2

            if (screen_x + half_w < 0 or screen_x - half_w > view_w or
                screen_y + half_h < 0 or screen_y - half_h > view_h):
                continue

            frame.paste(tile, (screen_x - half_w, screen_y - half_h), tile)

        return frame