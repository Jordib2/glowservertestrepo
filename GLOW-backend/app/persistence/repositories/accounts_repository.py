from app.core.db import get_db

VALID_ROLES = {"teacher", "student", "admin"}

class AccountsRepository:

    def find_by_username(self, username: str, role: str ) -> dict:
        db = get_db()
        cursor = db.cursor()
        
        try:
            cursor.execute(
                "SELECT id, name, username, password, role FROM users WHERE username = %s AND role = %s",
                (username, role)
            )
            result = cursor.fetchone()
            if not result:
                return None
            return dict(zip(["id", "name", "username", "password", "role"], result))
        finally:
            cursor.close()
            db.close()
            
            
    def create_user(self, name: str, username: str, password: str, role: str) -> dict:
        if role not in VALID_ROLES:
            raise ValueError(f"Invalid role: {role}")
        
        db = get_db()
        cursor = db.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (name, username, password, role) VALUES (%s, %s, %s, %s)",
                (name, username, password, role)
            )
            db.commit()
            user_id = cursor.lastrowid
            if user_id is None:
                raise ValueError("Failed to create user - no ID returned")
            return {
                "id": user_id,
                "name": name,
                "username": username,
                "role": role
            }
        finally:
            cursor.close()
            db.close() 
            