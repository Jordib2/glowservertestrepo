from app.core.db import get_db

class SchoolsRepository:

    def get_all_schools(self):
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("SELECT * FROM schools")
        result = cursor.fetchall()

        cursor.close()
        db.close()

        return result