from app.core.db import get_db

class VideoRepository:

    def save_video(self, collage_id: int):
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO videos (collage_id) VALUES (%s)",
            (collage_id,)
        )

        db.commit()
        db.close()

        return {"message": "Video saved"}