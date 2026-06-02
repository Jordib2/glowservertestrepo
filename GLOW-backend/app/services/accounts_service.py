from app.persistence.repositories.accounts_repository import AccountsRepository
from app.core.security import (hash_password, verify_password, sign_access_token)

_DUMMT_HASH = hash_password("__never_matches__")

class AccountsService:
    def __init__(self):
        self.accounts_repo = AccountsRepository()

    def login(self, role: str, username: str, password: str) -> dict:
        user = self.accounts_repo.find_by_username(username, role)
        ok = verify_password(password, user["password"]) if user else _DUMMT_HASH
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
                "role": user["role"]
            }
        }
        
    def signup(self, name: str, username: str, password: str, role: str) -> dict:
        if role == "admin":
            raise ValueError("Cannot create admin users")
        if self.accounts_repo.find_by_username(username, role):
            raise ValueError("Username already exists")
        user = self.accounts_repo.create_user(name, username, hash_password(password), role)
        token = sign_access_token(user["id"], user["role"])
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user,
        }