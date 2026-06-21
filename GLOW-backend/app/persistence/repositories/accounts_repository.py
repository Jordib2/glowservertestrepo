from app.core.db import get_db

VALID_ROLES = {"teacher", "student", "admin"}

class AccountsRepository:

    def find_by_username(self, username: str, role: str) -> dict | None:
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                "SELECT id, name, username, password, role, class_name, school_name FROM users WHERE username = %s AND role = %s",
                (username, role)
            )
            result = cursor.fetchone()
            if not result:
                return None
            return dict(zip(["id", "name", "username", "password", "role", "class_name", "school_name"], result))
        finally:
            cursor.close()
            db.close()

    def exists_by_username(self, username: str) -> bool:
        """Return True if the username is already taken (any role)."""
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT 1 FROM users WHERE username = %s LIMIT 1", (username,))
            return cursor.fetchone() is not None
        finally:
            cursor.close()
            db.close()

    def create_user(self, name: str, username: str, password: str, role: str, class_name: str, school_name: str | None = None) -> dict:
        if role not in VALID_ROLES:
            raise ValueError(f"Invalid role: {role}")

        # Global uniqueness check
        if self.exists_by_username(username):
            raise ValueError("Username already exists")

        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                "INSERT INTO users (name, username, password, role, class_name, school_name) VALUES (%s, %s, %s, %s, %s, %s)",
                (name, username, password, role, class_name, school_name)
            )
            db.commit()
            user_id = cursor.lastrowid
            if user_id is None:
                raise ValueError("Failed to create user - no ID returned")
            return {
                "id": user_id,
                "name": name,
                "username": username,
                "role": role,
                "class_name": class_name,
                "school_name": school_name
            }
        finally:
            cursor.close()
            db.close()

    def register_student(self, name: str, username: str, password: str, role: str, class_name: str, school_name: str | None = None) -> dict:
        if role != "student":
            raise ValueError("Role must be 'student' for student registration")
        # create_user already checks username uniqueness
        return self.create_user(
            name=name,
            username=username,
            password=password,
            role=role,
            class_name=class_name,
            school_name=school_name
        )