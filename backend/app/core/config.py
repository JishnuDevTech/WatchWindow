from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Application settings"""

    # API
    api_title: str = "WatchWindow API"
    api_version: str = "0.1.0"
    api_description: str = "Shared household TV scheduling platform"

    # Database
    database_url: str = "postgresql://localhost/watchwindow"

    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # JWT
    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Firebase identity provider (optional until client configuration is supplied)
    firebase_project_id: str | None = None
    firebase_private_key_id: str | None = None
    firebase_private_key: str | None = None

    # Environment
    environment: str = "development"
    debug: bool = True

    class Config:
        env_file = BASE_DIR / ".env"
        case_sensitive = False


settings = Settings()