#from functools import lru_cache
#from pydantic_settings import BaseSettings, SettingsConfigDict


#class Settings(BaseSettings):
#    app_name: str = "GLOW APP"
#    app_env: str = "development"
#    app_host: str = "127.0.0.1"
#    app_port: int = 8000

#    db_user: str
#    db_password: str
#    db_host: str
#    db_port: int = 3306
#    db_name: str

 #   model_config = SettingsConfigDict(env_file=".env", extra="ignore")

 #   @property
 #   def database_url(self) -> str:
 #       return (
 #           f"mysql+pymysql://{self.db_user}:{self.db_password}"
 #           f"@{self.db_host}:{self.db_port}/{self.db_name}"
 #       )


#@lru_cache
#def get_settings() -> Settings:
#    return Settings()