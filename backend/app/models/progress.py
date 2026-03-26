"""User progress and activity models"""
from datetime import datetime, date
from uuid import uuid4

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserProgress(Base):
    """User progress tracking"""
    
    __tablename__ = "user_progress"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_date: Mapped[date | None] = mapped_column(Date)
    module_counts: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="progress")
    
    def __repr__(self) -> str:
        return f"<UserProgress user_id={self.user_id} xp={self.total_xp}>"


class SavedWord(Base):
    """User saved vocabulary words"""
    
    __tablename__ = "saved_words"
    __table_args__ = (
        UniqueConstraint("user_id", "word_id", name="uq_user_word"),
    )
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    word_id: Mapped[str] = mapped_column(String(255), nullable=False)  # Can be UUID or string ID
    word: Mapped[str] = mapped_column(String(255), nullable=False)
    meaning: Mapped[str] = mapped_column(Text, nullable=False)
    set_title: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="saved_words")
    
    def __repr__(self) -> str:
        return f"<SavedWord {self.word}>"


class Activity(Base):
    """User activity log"""
    
    __tablename__ = "activities"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    module: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    metadata: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="activities")
    
    def __repr__(self) -> str:
        return f"<Activity {self.module}: {self.title}>"
