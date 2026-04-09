from app.core.db import get_db

class VideosRepository:

    def save_video(self, collage_id: int):
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO videos (collage_id) VALUES (%s)",
            (collage_id,)
        )

        db.commit()
        video_id = cursor.lastrowid

        cursor.close()
        db.close()

        return {"id": video_id}

    def get_videos(self, collage_id: int):
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM videos WHERE collage_id = %s",
            (collage_id,)
        )

        result = cursor.fetchall()

        cursor.close()
        db.close()

        return result
