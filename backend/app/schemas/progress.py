"""Progress tracking schemas"""
from datetime import datetime, date
from uuid import UUID

from pydantic import BaseModel, Field


class UserProgressResponse(BaseModel):
    """User progress response"""
    user_id: UUID
    total_xp: int
    streak_days: int
    last_activity_date: date | None
    module_counts: dict
    
    model_config = {"from_attributes": True}


class ActivityCreate(BaseModel):
    """Create activity request"""
    module: str = Field(..., max_length=50)
    title: str = Field(..., max_length=255)
    xp: int = Field(default=0, ge=0)
    metadata: dict | None = None


class ActivityResponse(BaseModel):
    """Activity response"""
    id: UUID
    module: str
    title: str
    xp_earned: int
    created_at: datetime
    
    model_config = {"from_attributes": True}


class SavedWordCreate(BaseModel):
    """Save word request"""
    word_id: str
    word: str
    meaning: str
    set_title: str | None = None


class SavedWordResponse(BaseModel):
    """Saved word response"""
    id: UUID
    word_id: str
    word: str
    meaning: str
    set_title: str | None
    created_at: datetime
    
    model_config = {"from_attributes": True}


class StreakResponse(BaseModel):
    """Streak information"""
    streak_days: int
    last_activity_date: date | None
    is_active_today: bool
