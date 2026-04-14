from app.core.db import get_db

class CollageRepository:

    def save_collage(self, collage_id: int):
        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            "INSERT INTO collages (id) VALUES (%s)",
            (collage_id,)
        )

        db.commit()
        db.close()

        return {"message": f"Collage {collage_id} saved"}

    def get_collage(self, collage_id: int):
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT * FROM collages WHERE id = %s", (collage_id,))
        result = cursor.fetchone()

        cursor.close()
        db.close()

        return result