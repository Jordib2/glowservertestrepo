
from app.persistence.repositories.collage_repository import CollageRepository
from app.persistence.repositories.videos_repository import VideosRepository

import os
import uuid
from pathlib import Path

from PIL import Image
import numpy as np
import cv2

class VideoService:
    def __init__(self):
        self.video_repo = VideosRepository()
        self.collage_repo = CollageRepository()

        self.base_media_dir = os.getenv("MEDIA_DIR", "media")
        self.videos_subdir = "videos"
        self.video_dir = Path(self.base_media_dir) / self.videos_subdir

    def generate_video(self, collage_url: str, collage_id: int) -> dict:
        # Convert URL to local path
        relative_path = collage_url.split('/media/')[1]  # e.g., collages/filename
        collage_path = os.path.join(self.base_media_dir, relative_path)

        if not os.path.exists(collage_path):
            raise ValueError(f"Collage file not found at path: {collage_path}")

        self.video_dir.mkdir(parents=True, exist_ok=True)

        image = Image.open(collage_path).convert("RGB")
        image_width, image_height = image.size
        print(f"Collage dimensions: {image_width}x{image_height}")

        video_width = 1920
        video_height = 1080

        #resize collage to fit video height while maintaining aspect ratio
        scale = video_height / image_height
        new_width = int(image_width * scale)
        if new_width <= video_width:
            raise ValueError("Collage is not wide enough for sliding animation")

        resized_image = image.resize((new_width, video_height))

        collage_array = np.array(resized_image)

        #determine how many pixels to move per frame
        collage_array = cv2.cvtColor(collage_array, cv2.COLOR_RGB2BGR)

        fps = 30
        duration_seconds = 30
        total_frames = fps * duration_seconds

        max_x = new_width - video_width
        step_x = max_x / total_frames
        
        #create file path for video output
        filename = f"{uuid.uuid4()}_collage_{collage_id}.mp4"
        absolute_output_path = self.video_dir / filename

        #create mp4 writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(
            str(absolute_output_path), 
            fourcc, 
            fps, 
            (video_width, video_height))
        
        if not video_writer.isOpened():
            raise RuntimeError(f"Failed to create video writer for path: {absolute_output_path}")

        for i in range(total_frames):
            x = int(i * step_x)
            frame = collage_array[:, x:x+video_width]

            if frame.shape[1] != video_width or frame.shape[0] != video_height:
                print(f"Skipping frame {i} due to incorrect dimensions: {frame.shape}")
                continue

            video_writer.write(frame)

        video_writer.release()

        #save video path to db associated with collage_id
        relative_video_path = f"{self.videos_subdir}/{filename}"

        saved_video = self.video_repo.save_video(collage_id, str(relative_video_path))

        BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
        video_url = f"{BASE_URL}/media/{relative_video_path}"

        return {
            "message": f"Video created successfully for collage {collage_id}",
            "video_id": saved_video["id"],
            "collage_id": collage_id,
            "video_url": video_url
        }