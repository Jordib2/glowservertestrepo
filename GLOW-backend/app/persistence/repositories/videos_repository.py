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
    

def get_videos_by_teacher(self, teacher_name: str):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM videos WHERE school_name IS NOT NULL ORDER BY id DESC"
    )
    result = cursor.fetchall()
    cursor.close()
    db.close()
    return result

def update_export_info(self, video_id: int, school_name: str, class_name: str):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE videos SET school_name = %s, class_name = %s WHERE id = %s",
        (school_name, class_name, video_id)
    )
    db.commit()
    cursor.close()
    db.close()

