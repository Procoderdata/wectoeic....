"""User schemas"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str | None = None


class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    full_name: str | None = None
    avatar_url: str | None = None


class UserResponse(UserBase):
    """Schema for user response"""
    id: UUID
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    model_config = {"from_attributes": True}


class UserWithProgress(UserResponse):
    """User with progress data"""
    total_xp: int = 0
    streak_days: int = 0
    saved_words_count: int = 0
