from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.controllers.video_controller import router as video_router
from app.core.db import get_db
from app.api.controllers.images_controller import router as images_router
app = FastAPI(title="GLOW API")

# ✅ CORS (for local + production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://glow2026.duckdns.org"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ include your real API routes
app.include_router(video_router, prefix="/api")
app.include_router(images_router, prefix="/api")

# ✅ health check
@app.get("/api")
def root():
    return {"status": "working"}


# ✅ DB test (IMPORTANT — keep this!)
@app.get("/api/db")
def db_test():
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute("SELECT NOW()")
        result = cursor.fetchone()

        cursor.close()
        db.close()

        return {"time": str(result[0])}

    except Exception as e:
        return {"error": str(e)}
