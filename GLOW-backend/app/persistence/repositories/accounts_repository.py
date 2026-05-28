from app.core.db import get_db

class AccountsRepository:
    
    ALLOWED_TABLES = {"Teacher": "teachers", "Child": "children"}

    def login(self, role: str, username: str, password: str) -> dict:
        if role not in self.ALLOWED_TABLES:
            raise ValueError(f"Invalid role: {role}")
        
        db = get_db()
        cursor = db.cursor()

        table = self.ALLOWED_TABLES[role]
        cursor.execute(
            f"SELECT * FROM {table} WHERE username = %s AND password = %s",
            (username, password)
        )

        user = cursor.fetchone()

        cursor.close()
        db.close()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return user
            