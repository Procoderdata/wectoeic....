"""User and authentication models"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """User model"""
    
    __tablename__ = "users"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(50), default="student")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    progress: Mapped["UserProgress"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")
    saved_words: Mapped[list["SavedWord"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    activities: Mapped[list["Activity"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<User {self.username}>"


class RefreshToken(Base):
    """Refresh token model"""
    
    __tablename__ = "refresh_tokens"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="refresh_tokens")
    
    def __repr__(self) -> str:
        return f"<RefreshToken {self.id}>"
