from app.core.db import get_db

class VideosRepository:

    def save_video(self, collage_id: int, video_url: str):
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO videos (collage_id, video_path) VALUES (%s, %s)",
            (collage_id, video_url)
        )

        db.commit()
        video_id = cursor.lastrowid

        cursor.close()
        db.close()

        return {"id": video_id, "url": video_url}

    def get_videos(self, collage_id: int):
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT id, collage_id, video_path as url FROM videos WHERE collage_id = %s",
            (collage_id,)
        )

        result = cursor.fetchall()

        cursor.close()
        db.close()

        return result