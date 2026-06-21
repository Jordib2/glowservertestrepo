from app.persistence.repositories.accounts_repository import AccountsRepository
from app.core.security import (hash_password, verify_password, sign_access_token)

_DUMMY_HASH = hash_password("__never_matches__")

class AccountsService:
    def __init__(self):
        self.accounts_repo = AccountsRepository()

    def login(self, role: str, username: str, password: str) -> dict:
        user = self.accounts_repo.find_by_username(username, role)
        ok = verify_password(password, user["password"]) if user else _DUMMY_HASH
        if not user or not ok:
            raise ValueError("Invalid credentials")

        token = sign_access_token(user["id"], user["role"])
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "username": user["username"],
                "role": user["role"],
                "class_name": user["class_name"],
                "school_name": user.get("school_name")
            }
        }

    def signup(self, name: str, username: str, password: str, role: str, class_name: str, school_name: str | None = None) -> dict:
        if role == "admin":
            raise ValueError("Cannot create admin users")
        if self.accounts_repo.find_by_username(username, role):
            raise ValueError("Username already exists")
        user = self.accounts_repo.create_user(name, username, hash_password(password), role, class_name, school_name)
        token = sign_access_token(user["id"], user["role"])
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user,
        }

    def register_student(self, name: str, username: str, password: str, confirm_password: str, class_name: str, school_name: str | None = None) -> dict:
        if self.accounts_repo.find_by_username(username, "student"):
            raise ValueError("Username already exists")
        if password != confirm_password:
            raise ValueError("Passwords do not match")
        user = self.accounts_repo.register_student(name, username, hash_password(password), "student", class_name, school_name)
        token = sign_access_token(user["id"], user["role"])
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user,
        }