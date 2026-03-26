"""Authentication schemas"""
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Login request schema"""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Registration request schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str | None = None


class Token(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    user_id: str
    email: str
    username: str
