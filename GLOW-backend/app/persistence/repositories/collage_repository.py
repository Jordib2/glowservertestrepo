from app.core.db import get_db

class CollageRepository:

    def create_collage(self):
        db = get_db()
        cursor = db.cursor()
        
        # Insert with empty string placeholder
        cursor.execute(
            "INSERT INTO collages (collage_path) VALUES (%s)",
            ("",)
        )
        
        db.commit()
        collage_id = cursor.lastrowid
        
        if collage_id is None:
            cursor.close()
            db.close()
            raise ValueError("Failed to create collage - no ID returned")
        
        cursor.close()
        db.close()
        
        return collage_id

    def update_collage_path(self, collage_id: int, collage_url: str):
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute(
            "UPDATE collages SET collage_path = %s WHERE id = %s",
            (collage_url, collage_id)
        )
        
        db.commit()
        cursor.close()
        db.close()

    def get_collage(self, collage_id: int):
        db = get_db()
        cursor = db.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM collages WHERE id = %s", (collage_id,))
        result = cursor.fetchone()
        
        cursor.close()
        db.close()
        
        return result
