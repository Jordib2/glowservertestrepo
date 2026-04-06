from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.controllers.video_controller import router as video_router
from app.core.db import get_db

app = FastAPI(title="GLOW API")

# ✅ CORS (KEEP THIS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://glow2026.duckdns.org"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ KEEP THIS (frontend depends on it)
@app.get("/api")
def root():
    return {"status": "working"}

# ✅ KEEP THIS (you already use it)
@app.get("/api/db")
def db_test():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT NOW()")
        result = cursor.fetchone()
        db.close()
        return {"time": result}
    except Exception as e:
        return {"error": str(e)}

# ✅ YOUR TEAM ROUTES
app.include_router(video_router, prefix="/api")