from app.core.db import get_db
import os
import uuid
from pathlib import Path

class CollageRepository:
    def __init__(self):
        self.base_media_dir = os.getenv("MEDIA_DIR", "media")
        self.collages_subdir = "collages"
        self.collage_dir = Path(self.base_media_dir) / self.collages_subdir

    def create_collage(self):
        db = get_db()
        cursor = db.cursor()

        cursor.execute("INSERT INTO collages () VALUES ()")
        collage_id = cursor.lastrowid

        db.commit()
        cursor.close()
        db.close()

        return collage_id

    def save_collage_file(self, collage_id: int, file_path: str):
        # Assuming file_path is the path to the generated collage file
        # Move or copy to media/collages/
        self.collage_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4()}_collage_{collage_id}.png"
        destination = self.collage_dir / filename
        os.rename(file_path, destination)  # or shutil.move

        relative_path = f"{self.collages_subdir}/{filename}"
        BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8000")
        url = f"{BASE_URL}/media/{relative_path}"

        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            "UPDATE collages SET collage_path = %s WHERE id = %s",
            (relative_path, collage_id)
        )
        db.commit()
        cursor.close()
        db.close()

        return url

    def save_collage(self, collage_id: int):
        # This might be deprecated, but keeping for now
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO collages (id) VALUES (%s)",
            (collage_id,)
        )

        db.commit()
        db.close()

        return {"message": f"Collage {collage_id} saved"}

    def get_collage(self, collage_id: int):
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT * FROM collages WHERE id = %s", (collage_id,))
        result = cursor.fetchone()

        cursor.close()
        db.close()

        return result