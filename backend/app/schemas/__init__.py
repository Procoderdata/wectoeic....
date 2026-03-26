"""Pydantic schemas for request/response validation"""
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.auth import Token, TokenData, LoginRequest, RegisterRequest
from app.schemas.progress import (
    UserProgressResponse,
    ActivityCreate,
    ActivityResponse,
    SavedWordCreate,
    SavedWordResponse,
)

__all__ = [
    "UserCreate",
    "UserResponse",
    "UserUpdate",
    "Token",
    "TokenData",
    "LoginRequest",
    "RegisterRequest",
    "UserProgressResponse",
    "ActivityCreate",
    "ActivityResponse",
    "SavedWordCreate",
    "SavedWordResponse",
]
