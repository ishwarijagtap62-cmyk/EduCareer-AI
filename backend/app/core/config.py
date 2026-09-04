"""
Central configuration for EduCareer AI backend.
All settings loaded from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EduCareer AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/educareer"

    # Redis (optional, for caching)
    REDIS_URL: Optional[str] = None

    # Groq AI
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_MAX_TOKENS: int = 2048
    GROQ_TEMPERATURE: float = 0.7

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_db"

    # File uploads
    MAX_FILE_SIZE_MB: int = 20
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_EXTENSIONS: list = ["pdf", "docx", "txt", "pptx"]

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://educareer-ai.vercel.app",
    ]

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    AI_RATE_LIMIT_PER_MINUTE: int = 20

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
