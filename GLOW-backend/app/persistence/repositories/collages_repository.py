from app.core.db import get_db

class CollagesRepository:

    def create_collage(self, collage_id: int):
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO collages (id) VALUES (%s)",
            (collage_id,)
        )

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
