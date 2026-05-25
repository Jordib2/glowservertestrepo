from app.core.db import get_db


class ImagesRepository:

    def save_image(
        self,
        collage_id: int,
        image_url: str
    ):

        db = get_db()
        cursor = db.cursor()

        cursor.execute(
            """
            INSERT INTO images
            (collage_id, url)
            VALUES (%s, %s)
            """,
            (collage_id, image_url)
        )

        db.commit()

        cursor.close()
        db.close()

        return {
            "message": "Image saved",
            "url": image_url
        }

    def get_images(
        self,
        collage_id: int
    ):

        db = get_db()

        cursor = db.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT *
            FROM images
            WHERE collage_id = %s
            """,
            (collage_id,)
        )

        result = cursor.fetchall()

        cursor.close()
        db.close()

        return result
