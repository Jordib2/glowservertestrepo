from app.persistence.repositories.collage_repository import CollageRepository
from app.persistence.repositories.videos_repository import VideosRepository

import os
import uuid
from pathlib import Path
import subprocess

from PIL import Image
import numpy as np
import cv2


BASE_URL = os.getenv(
    "BASE_URL",
    "https://glow2026.duckdns.org"
)

MEDIA_DIR = os.getenv(
    "MEDIA_DIR",
    "/var/www/media"
)


class VideoService:

    def __init__(self):

        self.video_repo = VideosRepository()
        self.collage_repo = CollageRepository()

        self.video_dir = Path(MEDIA_DIR) / "videos"

    def generate_video(
        self,
        collage_url: str,
        collage_id: int
    ) -> dict:

        if "/media/" not in collage_url:
           raise ValueError(
        f"Invalid collage URL: {collage_url}"
    )

        relative_path = collage_url.split(
            "/media/",
             1
        )[1]

        collage_path = os.path.join(
            MEDIA_DIR,
            relative_path
        )

        if not os.path.exists(collage_path):
            raise ValueError(
                f"Collage file not found: {collage_path}"
            )

        self.video_dir.mkdir(
            parents=True,
            exist_ok=True
        )

        image = Image.open(collage_path).convert("RGB")

        image_width, image_height = image.size

        video_width = 1900
        video_height = 1200

        scale = video_height / image_height

        new_width = int(image_width * scale)

        if new_width <= video_width:
            raise ValueError(
                "Collage is not wide enough"
            )

        resized_image = image.resize(
            (new_width, video_height)
        )

        collage_array = np.array(resized_image)

        collage_array = cv2.cvtColor(
            collage_array,
            cv2.COLOR_RGB2BGR
        )

        fps = 30
        duration_seconds = 10

        total_frames = fps * duration_seconds

        max_x = new_width - video_width
        step_x = max_x / total_frames
        
        #create file path for video output
        filename = f"{uuid.uuid4()}_collage_{collage_id}.mp4"
        absolute_output_path = self.video_dir / filename
        temp_path = self.video_dir / f"temp_{filename}"

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')

        video_writer = cv2.VideoWriter(
            str(temp_path), 
            fourcc, 
            fps, 
            (video_width, video_height))
        
        if not video_writer.isOpened():
            raise RuntimeError(f"Failed to create video writer for path: {temp_path}")

        for i in range(total_frames):

            x = int(i * step_x)

            frame = collage_array[
                :,
                x:x + video_width
            ]

            if (
                frame.shape[1] != video_width
                or frame.shape[0] != video_height
            ):
                continue

            video_writer.write(frame)

        video_writer.release()

        #re-encoding with ffmpeg to ensure compatibility and reduce file size
        try:
            subprocess.run([
                "ffmpeg",
                "-y",
                "-i", str(temp_path),
                "-vcodec", "libx264",
                "-pix_fmt", "yuv420p",
                "-movflags", "+faststart",
                str(absolute_output_path)
            ], check=True)
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"FFmpeg failed: {e}")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        #save video path to db associated with collage_id
        relative_video_path = f"{self.videos_subdir}/{filename}"
        video_url = (
            f"{BASE_URL}/media/videos/{filename}"
        )

        saved_video = self.video_repo.save_video(
            collage_id,
            video_url
        )

        return {
            "message": "Video created successfully",
            "video_id": saved_video["id"],
            "collage_id": collage_id,
            "video_url": video_url
        }
