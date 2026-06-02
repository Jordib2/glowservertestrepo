import hashlib, secrets
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings
import bcrypt

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def hash_password(password: str) -> str:
    pw_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pw_bytes, bcrypt.gensalt(rounds=12)).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))

def sign_access_token(user_id: int, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.access_ttl_minutes)).timestamp())
    }
    return jwt.encode(payload, settings.jwt_access_secret, algorithm="HS256")

def verify_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_access_secret, algorithms=["HS256"])

def new_refresh_token() -> str:
    return secrets.token_hex(48)

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()