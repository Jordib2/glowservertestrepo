from app.core.db import get_db

class VideosRepository:

    def save_video(self, collage_id: int, video_path: str):
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO videos (collage_id, video_path) VALUES (%s, %s)",
            (collage_id, video_path)
        )

        db.commit()
        video_id = cursor.lastrowid

        cursor.execute(
            "SELECT * FROM videos WHERE id = %s",
            (video_id,)
        )

        saved_video = cursor.fetchone()

        cursor.close()
        db.close()

        return saved_video

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
