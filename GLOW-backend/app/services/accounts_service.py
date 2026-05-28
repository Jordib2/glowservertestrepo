from app.repositories.accounts_repository import AccountsRepository

class AccountsService:
    def __init__(self):
        self.accounts_repo = AccountsRepository()

    def login(self, role: str, username: str, password: str) -> dict:
        user = self.accounts_repo.login(role, username, password)
        if not user:
            raise ValueError("Invalid credentials")
        return user