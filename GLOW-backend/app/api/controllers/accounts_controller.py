from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from app.services.accounts_service import AccountsService

router = APIRouter()
service = AccountsService()

@router.post("/login")
async def login(
    role: str = Form(...),
    username: str = Form(...),
    password: str = Form(...)
):
    try:
        user = service.login(role, username, password)
        return {"message": "Login successful", "user": user}
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))