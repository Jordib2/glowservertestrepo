from app.core.db import get_db

class VideosRepository:

    def save_video(self, collage_id: int, video_path: str):
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO videos (collage_id, video_path) VALUES (%s, %s)",
            (collage_id, video_path)
        )

        video_id = cursor.lastrowid

        db.commit()
        cursor.close()
        db.close()

        return {"id": video_id, "video_path": video_path}

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
