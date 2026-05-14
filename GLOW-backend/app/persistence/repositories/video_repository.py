from app.core.db import get_db

class VideosRepository:

    def save_video(self, collage_id: int, video_path: str) -> dict:
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

        return {
            "message": f"Video path saved successfully", 
            "id": video_id,
            "video_path": video_path
        }
    
    def get_video_by_id(self, video_id: int) -> dict:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM videos WHERE id = %s",
            (video_id,)
        )

        result = cursor.fetchone()

        cursor.close()
        db.close()

        return result


    def get_video_by_collage_id(self, collage_id: int) -> dict:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM videos WHERE collage_id = %s ORDER BY id DESC",
            (collage_id,)
        )

        result = cursor.fetchone()

        cursor.close()
        db.close()

        return result