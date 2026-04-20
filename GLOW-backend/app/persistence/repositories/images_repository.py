from app.core.db import get_db
import os
import uuid
from pathlib import Path
import shutil

class ImagesRepository:
    def __init__(self):
        self.base_media_dir = os.getenv("MEDIA_DIR", "media")
        self.images_subdir = "images"
        self.image_dir = Path(self.base_media_dir) / self.images_subdir

    def save_image(self, collage_id: int, file_path: str):
        # file_path is the uploaded file path, save to media/images/
        self.image_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4()}_{os.path.basename(file_path)}"
        destination = self.image_dir / filename
        shutil.move(file_path, destination)

        relative_path = f"{self.images_subdir}/{filename}"
        BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
        url = f"{BASE_URL}/media/{relative_path}"

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO images (collage_id, url) VALUES (%s, %s)",
            (collage_id, url)
        )
        db.commit()
        cursor.close()
        db.close()

        return {"message": "Image saved", "url": url}

    def get_images(self, collage_id: int):
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM images WHERE collage_id = %s",
            (collage_id,)
        )

        result = cursor.fetchall()
        db.close()

        return result