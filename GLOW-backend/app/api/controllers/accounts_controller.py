from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from app.services.accounts_service import AccountsService

router = APIRouter()
service = AccountsService()

class LoginIn(BaseModel):
    username: str
    password: str
    role: str = Field(regex="^(teacher|student)$")

class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    username: str = Field(min_length=3, max_length=30, regex="^[a-zA-Z0-9_]+$")
    password: str = Field(min_length=6, max_length=100)
    role: str = Field(regex="^(teacher|student)$")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in {"teacher", "student"}:
            raise ValueError("Role must be 'teacher' or 'student'")
        return v


@router.post("/login")
async def login(login_data: LoginIn):
    try:
        return service.login(role=login_data.role, username=login_data.username, password=login_data.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/signup")
async def signup(signup_data: SignupIn):
    try:
        return service.signup(name=signup_data.name, username=signup_data.username, password=signup_data.password, role=signup_data.role)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

