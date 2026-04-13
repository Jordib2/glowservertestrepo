from app.core.db import get_db

class CollagesRepository:

    def create_collage(self):
        db = get_db()
        cursor = db.cursor()

        cursor.execute("INSERT INTO collages VALUES (NULL)")

        db.commit()
        collage_id = cursor.lastrowid

        cursor.close()
        db.close()

        return {"id": collage_id}

    def get_collages(self):
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT * FROM collages")
        result = cursor.fetchall()

        cursor.close()
        db.close()

        return result
    
