import mysql.connector
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from the backend root directory
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

def get_db():
    host = os.getenv("DB_HOST", "localhost")
    port = int(os.getenv("DB_PORT", "3306"))
    user = os.getenv("DB_USER", "appuser")
    password = os.getenv("DB_PASSWORD", "")
    database = os.getenv("DB_NAME", "glow2026")
    
    return mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database
    )
