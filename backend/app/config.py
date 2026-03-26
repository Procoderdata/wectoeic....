"""Application configuration"""
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/bloom_english"
    TEST_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/bloom_english_test"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_TTL: int = 3600  # 1 hour
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    # API
    API_V1_PREFIX: str = "/api"
    PROJECT_NAME: str = "Bloom English House API"
    VERSION: str = "2.0.0"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
