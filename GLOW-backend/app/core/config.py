from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_access_secret: str
    jwt_refresh_secret: str
    access_ttl_minutes: int = 15
    refresh_ttl_days: int = 7
    base_url: str = "http://localhost:5173"
    
    class Config:
        env_file = ".env"
        
settings = Settings()