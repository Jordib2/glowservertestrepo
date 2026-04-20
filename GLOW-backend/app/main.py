import os  
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)
from dotenv import dotenv_values

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.controllers.images_controller import router as images_router
from app.api.controllers.collages_controller import router as collages_router
from app.api.controllers.videos_controller import router as videos_router
from app.core.db import get_db

app = FastAPI(title="GLOW API")
# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.54:5173",
        "http://localhost:3000",
        "https://glow2026.duckdns.org"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ routes
app.include_router(images_router, prefix="/api")
app.include_router(collages_router, prefix="/api")
app.include_router(videos_router, prefix="/api")

# ✅ THIS IS THE FIXED LINE 👇 (USE MEDIA_DIR, NOT HARDCODED PATH)
MEDIA_DIR = os.getenv("MEDIA_DIR", "media")

os.makedirs(MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

# ✅ health check
@app.get("/api")
def root():
    return {"status": "working"}

# ✅ DB test
@app.get("/api/db")
def db_test():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT NOW()")
        return {"time": cursor.fetchone()}
    except Exception as e:
        return {"error": str(e)}