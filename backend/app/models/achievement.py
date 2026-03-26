"""Achievement and gamification models"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Achievement(Base):
    """Achievement definition"""
    
    __tablename__ = "achievements"
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    achievement_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    icon: Mapped[str | None] = mapped_column(String(50))
    xp_required: Mapped[int] = mapped_column(Integer, default=0)
    action_required: Mapped[str | None] = mapped_column(String(50))
    count_required: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_achievements: Mapped[list["UserAchievement"]] = relationship(back_populates="achievement", cascade="all, delete-orphan")
    
    def __repr__(self) -> str:
        return f"<Achievement {self.title}>"


class UserAchievement(Base):
    """User unlocked achievements"""
    
    __tablename__ = "user_achievements"
    __table_args__ = (
        UniqueConstraint("user_id", "achievement_id", name="uq_user_achievement"),
    )
    
    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    achievement_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("achievements.id", ondelete="CASCADE"), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")
    
    def __repr__(self) -> str:
        return f"<UserAchievement user_id={self.user_id} achievement_id={self.achievement_id}>"
