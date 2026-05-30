from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    jwt_access_secret: str
    jwt_refresh_secret: str
    access_ttl_minutes: int = 15
    refresh_ttl_days: int = 7
    
    base_url: str
    
    model_config = {
        "env_file": env_path,
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }
        
settings = Settings()