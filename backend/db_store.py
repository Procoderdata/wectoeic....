from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from sqlalchemy import (
    JSON,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    create_engine,
    func,
    inspect,
    select,
    text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env.local")

MODULE_KEYS = (
    "search",
    "flashcard",
    "quiz",
    "listening",
    "typing",
    "matching",
    "grammar",
)

MODULE_COUNTER_COLUMNS = {
    "search": "search_count",
    "flashcard": "flashcard_count",
    "quiz": "quiz_count",
    "listening": "listening_count",
    "typing": "typing_count",
    "matching": "matching_count",
    "grammar": "grammar_count",
}

USER_PROGRESS_SCHEMA_COLUMNS = {
    "xp_score": "INTEGER NOT NULL DEFAULT 0",
    "saved_words_count": "INTEGER NOT NULL DEFAULT 0",
    "activities_count": "INTEGER NOT NULL DEFAULT 0",
    "search_count": "INTEGER NOT NULL DEFAULT 0",
    "flashcard_count": "INTEGER NOT NULL DEFAULT 0",
    "quiz_count": "INTEGER NOT NULL DEFAULT 0",
    "listening_count": "INTEGER NOT NULL DEFAULT 0",
    "typing_count": "INTEGER NOT NULL DEFAULT 0",
    "matching_count": "INTEGER NOT NULL DEFAULT 0",
    "grammar_count": "INTEGER NOT NULL DEFAULT 0",
    "vocab_score": "INTEGER NOT NULL DEFAULT 0",
    "grammar_score": "INTEGER NOT NULL DEFAULT 0",
    "consistency_score": "INTEGER NOT NULL DEFAULT 0",
    "toeic_score": "INTEGER NOT NULL DEFAULT 0",
}

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
POSTGRES_ENABLED = DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgresql+psycopg2://")
DEFAULT_PROGRESS_USER_ID = os.getenv("DEFAULT_PROGRESS_USER_ID", "user-tester")

_engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True) if POSTGRES_ENABLED else None
SessionLocal = sessionmaker(bind=_engine, autoflush=False, expire_on_commit=False) if _engine is not None else None


class Base(DeclarativeBase):
    pass


class DbAuthUser(Base):
    __tablename__ = "auth_users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    progress: Mapped[Optional["DbUserProgress"]] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class DbUserProgress(Base):
    __tablename__ = "user_progress"

    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("auth_users.id", ondelete="CASCADE"), primary_key=True)
    total_xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_activity_date: Mapped[Optional[str]] = mapped_column(String(20))
    module_counts: Mapped[dict[str, int]] = mapped_column(JSON, nullable=False, default=dict)
    xp_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    saved_words_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    activities_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    search_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    flashcard_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    quiz_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    listening_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    typing_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    matching_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    grammar_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    vocab_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    grammar_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    consistency_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    toeic_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user: Mapped["DbAuthUser"] = relationship(back_populates="progress")


class DbSavedWord(Base):
    __tablename__ = "saved_words"
    __table_args__ = (
        UniqueConstraint("user_id", "word_id", name="uq_saved_words_user_word"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("auth_users.id", ondelete="CASCADE"), nullable=False, index=True)
    word_id: Mapped[str] = mapped_column(String(255), nullable=False)
    word: Mapped[str] = mapped_column(String(255), nullable=False)
    meaning: Mapped[str] = mapped_column(String(2000), nullable=False)
    set_title: Mapped[Optional[str]] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class DbActivity(Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(64), ForeignKey("auth_users.id", ondelete="CASCADE"), nullable=False, index=True)
    module: Mapped[str] = mapped_column(String(80), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)


def is_enabled() -> bool:
    return POSTGRES_ENABLED and SessionLocal is not None


def _safe_int(value: Any) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def _default_module_counts() -> dict[str, int]:
    return {key: 0 for key in MODULE_KEYS}


def _normalize_module_counts(module_counts: Optional[dict[str, Any]]) -> dict[str, int]:
    normalized = _default_module_counts()
    if isinstance(module_counts, dict):
        for key, value in module_counts.items():
            if key not in normalized:
                continue
            normalized[key] = _safe_int(value)
    return normalized


def _ensure_user_progress_schema() -> None:
    if _engine is None:
        return

    existing_columns = {column["name"] for column in inspect(_engine).get_columns("user_progress")}
    missing_columns = [
        (column_name, column_sql)
        for column_name, column_sql in USER_PROGRESS_SCHEMA_COLUMNS.items()
        if column_name not in existing_columns
    ]
    if not missing_columns:
        return

    with _engine.begin() as connection:
        for column_name, column_sql in missing_columns:
            connection.execute(text(f"ALTER TABLE user_progress ADD COLUMN {column_name} {column_sql}"))


def _ensure_progress_fields(
    row: DbUserProgress,
    *,
    saved_words_count: Optional[int] = None,
    activities_count: Optional[int] = None,
) -> DbUserProgress:
    normalized = _normalize_module_counts(row.module_counts)
    if normalized != (row.module_counts or {}):
        row.module_counts = normalized

    row.total_xp = _safe_int(row.total_xp)
    row.streak_days = _safe_int(row.streak_days)
    row.xp_score = row.total_xp

    for module_key, column_name in MODULE_COUNTER_COLUMNS.items():
        setattr(row, column_name, _safe_int(normalized.get(module_key)))

    row.saved_words_count = _safe_int(saved_words_count if saved_words_count is not None else row.saved_words_count)
    row.activities_count = _safe_int(activities_count if activities_count is not None else row.activities_count)

    row.vocab_score = row.saved_words_count * 38 + row.search_count * 6
    row.grammar_score = row.grammar_count * 14 + row.quiz_count * 4
    row.consistency_score = row.streak_days * 12 + row.flashcard_count * 2
    row.toeic_score = 0 if row.total_xp <= 0 else min(990, 450 + round(row.total_xp / 4))
    return row


def _user_row_to_dict(row: Optional[DbAuthUser]) -> Optional[dict[str, Any]]:
    if row is None:
        return None
    return {
        "id": row.id,
        "email": row.email,
        "username": row.username,
        "full_name": row.full_name,
        "password_hash": row.password_hash,
        "created_at": row.created_at.isoformat(),
    }


def _display_name(user: DbAuthUser) -> str:
    return (user.full_name or "").strip() or user.username


def _level_title(level_number: int) -> str:
    if level_number >= 8:
        return "Thach Dau"
    if level_number >= 6:
        return "Tinh Anh"
    if level_number >= 4:
        return "Chuyen Gia"
    if level_number >= 2:
        return "Ben Bi"
    return "Learner"


def _level_label(total_xp: int) -> str:
    level_number = max(1, _safe_int(total_xp) // 180 + 1)
    return f"Lv.{level_number} - {_level_title(level_number)}"


def _leaderboard_entry(
    rank: int,
    user: DbAuthUser,
    progress: DbUserProgress,
    *,
    current_user_id: Optional[str] = None,
) -> dict[str, Any]:
    return {
        "rank": rank,
        "user_id": user.id,
        "username": user.username,
        "display_name": _display_name(user),
        "level": _level_label(progress.total_xp),
        "xp": _safe_int(progress.total_xp),
        "streak": _safe_int(progress.streak_days),
        "saved_words_count": _safe_int(progress.saved_words_count),
        "activities_count": _safe_int(progress.activities_count),
        "vocab": _safe_int(progress.vocab_score),
        "grammar": _safe_int(progress.grammar_score),
        "consistency": _safe_int(progress.consistency_score),
        "toeic": _safe_int(progress.toeic_score),
        "is_current_user": current_user_id == user.id,
    }


def _count_saved_words(db, user_id: str) -> int:
    return _safe_int(
        db.scalar(
            select(func.count()).select_from(DbSavedWord).where(DbSavedWord.user_id == user_id)
        )
    )


def _count_activities(db, user_id: str) -> int:
    return _safe_int(
        db.scalar(
            select(func.count()).select_from(DbActivity).where(DbActivity.user_id == user_id)
        )
    )


def _refresh_progress_row_counts(db, row: DbUserProgress) -> DbUserProgress:
    return _ensure_progress_fields(
        row,
        saved_words_count=_count_saved_words(db, row.user_id),
        activities_count=_count_activities(db, row.user_id),
    )


def _ensure_progress_row(db, user_id: str) -> DbUserProgress:
    row = db.get(DbUserProgress, user_id)
    if row is None:
        row = DbUserProgress(user_id=user_id, module_counts=_default_module_counts())
        db.add(row)
        db.flush()
    return _ensure_progress_fields(row)


def init_database(seed_users: Optional[list[dict[str, Any]]] = None) -> dict[str, Any]:
    if not is_enabled():
        return {"enabled": False, "ready": False, "detail": "DATABASE_URL is missing or invalid"}

    Base.metadata.create_all(bind=_engine)
    _ensure_user_progress_schema()

    with SessionLocal() as db:
        if seed_users:
            for user in seed_users:
                row = db.get(DbAuthUser, user["id"])
                if row is None:
                    row = db.execute(select(DbAuthUser).where(DbAuthUser.email == user["email"])).scalar_one_or_none()
                if row is None:
                    row = DbAuthUser(
                        id=user["id"],
                        email=user["email"],
                        username=user["username"],
                        full_name=user.get("full_name"),
                        password_hash=user["password_hash"],
                        created_at=datetime.fromisoformat(user["created_at"]) if "T" in user["created_at"] else datetime.utcnow(),
                    )
                    db.add(row)
                else:
                    row.email = user["email"]
                    row.username = user["username"]
                    row.full_name = user.get("full_name")
                    row.password_hash = user["password_hash"]
                _ensure_progress_row(db, user["id"])

        progress_rows = db.execute(select(DbUserProgress)).scalars().all()
        for progress_row in progress_rows:
            _refresh_progress_row_counts(db, progress_row)

        db.commit()

    return {"enabled": True, "ready": True, "detail": "postgres initialized"}


def get_user_by_email(email: str) -> Optional[dict[str, Any]]:
    if not is_enabled():
        return None
    with SessionLocal() as db:
        row = db.execute(select(DbAuthUser).where(DbAuthUser.email == email)).scalar_one_or_none()
        return _user_row_to_dict(row)


def get_user_by_id(user_id: str) -> Optional[dict[str, Any]]:
    if not is_enabled():
        return None
    with SessionLocal() as db:
        row = db.get(DbAuthUser, user_id)
        return _user_row_to_dict(row)


def get_user_by_username(username: str) -> Optional[dict[str, Any]]:
    if not is_enabled():
        return None
    with SessionLocal() as db:
        row = db.execute(select(DbAuthUser).where(DbAuthUser.username == username)).scalar_one_or_none()
        return _user_row_to_dict(row)


def create_user(user_payload: dict[str, Any]) -> dict[str, Any]:
    if not is_enabled():
        raise RuntimeError("PostgreSQL is not enabled")

    with SessionLocal() as db:
        row = DbAuthUser(
            id=user_payload["id"],
            email=user_payload["email"],
            username=user_payload["username"],
            full_name=user_payload.get("full_name"),
            password_hash=user_payload["password_hash"],
            created_at=datetime.fromisoformat(user_payload["created_at"]) if "T" in user_payload["created_at"] else datetime.utcnow(),
        )
        db.add(row)
        _ensure_progress_row(db, row.id)
        db.commit()
        return _user_row_to_dict(row) or user_payload


def ensure_user_progress(user_id: str) -> None:
    if not is_enabled():
        return
    with SessionLocal() as db:
        if db.get(DbAuthUser, user_id) is None:
            return
        _refresh_progress_row_counts(db, _ensure_progress_row(db, user_id))
        db.commit()


def _empty_progress_snapshot() -> dict[str, Any]:
    return {
        "total_xp": 0,
        "streak_days": 0,
        "last_activity_date": None,
        "saved_words": [],
        "saved_word_count": 0,
        "activities_count": 0,
        "module_counts": _default_module_counts(),
        "vocab_score": 0,
        "grammar_score": 0,
        "consistency_score": 0,
        "toeic_score": 0,
    }


def get_progress_snapshot(user_id: str) -> dict[str, Any]:
    if not is_enabled():
        return _empty_progress_snapshot()

    with SessionLocal() as db:
        if db.get(DbAuthUser, user_id) is None:
            return _empty_progress_snapshot()

        progress = _ensure_progress_row(db, user_id)

        saved_rows = db.execute(
            select(DbSavedWord).where(DbSavedWord.user_id == user_id).order_by(DbSavedWord.created_at.desc())
        ).scalars().all()

        saved_words = [
            {
                "id": row.word_id,
                "word": row.word,
                "meaning": row.meaning,
                "set_title": row.set_title,
            }
            for row in saved_rows
        ]

        _ensure_progress_fields(
            progress,
            saved_words_count=len(saved_words),
            activities_count=_count_activities(db, user_id),
        )
        db.commit()

        return {
            "total_xp": progress.total_xp,
            "streak_days": progress.streak_days,
            "last_activity_date": progress.last_activity_date,
            "saved_words": saved_words,
            "saved_word_count": len(saved_words),
            "activities_count": progress.activities_count,
            "module_counts": _normalize_module_counts(progress.module_counts),
            "vocab_score": progress.vocab_score,
            "grammar_score": progress.grammar_score,
            "consistency_score": progress.consistency_score,
            "toeic_score": progress.toeic_score,
        }


def record_activity(user_id: str, module: str, title: str, xp: int = 0) -> dict[str, Any]:
    if not is_enabled():
        return {"success": False, "detail": "postgres not enabled"}

    now = datetime.now()
    today = now.date().isoformat()

    with SessionLocal() as db:
        if db.get(DbAuthUser, user_id) is None:
            raise ValueError("User not found for activity")

        progress = _ensure_progress_row(db, user_id)
        progress.total_xp = _safe_int(progress.total_xp) + _safe_int(xp)

        module_counts = _normalize_module_counts(progress.module_counts)
        if module in module_counts:
            module_counts[module] = _safe_int(module_counts.get(module)) + 1
            progress.module_counts = module_counts

        if progress.last_activity_date != today:
            progress.streak_days = _safe_int(progress.streak_days) + 1
            progress.last_activity_date = today

        db.add(
            DbActivity(
                user_id=user_id,
                module=module,
                title=title,
                xp=_safe_int(xp),
                time=now,
            )
        )
        db.flush()

        stale_rows = db.execute(
            select(DbActivity)
            .where(DbActivity.user_id == user_id)
            .order_by(DbActivity.time.desc())
            .offset(20)
        ).scalars().all()
        for row in stale_rows:
            db.delete(row)
        db.flush()

        _ensure_progress_fields(
            progress,
            activities_count=_count_activities(db, user_id),
        )
        db.commit()
        return {
            "success": True,
            "total_xp": progress.total_xp,
            "streak_days": progress.streak_days,
            "last_activity_date": progress.last_activity_date,
            "activities_count": progress.activities_count,
            "vocab_score": progress.vocab_score,
            "grammar_score": progress.grammar_score,
            "consistency_score": progress.consistency_score,
            "toeic_score": progress.toeic_score,
        }


def get_recent_activities(user_id: str, limit: int = 10) -> list[dict[str, Any]]:
    if not is_enabled():
        return []
    with SessionLocal() as db:
        rows = db.execute(
            select(DbActivity)
            .where(DbActivity.user_id == user_id)
            .order_by(DbActivity.time.desc())
            .limit(limit)
        ).scalars().all()
        return [
            {
                "id": f"activity-{row.id}",
                "module": row.module,
                "title": row.title,
                "xp": row.xp,
                "time": row.time.isoformat(),
            }
            for row in rows
        ]


def save_word(user_id: str, payload: dict[str, Any]) -> dict[str, Any]:
    if not is_enabled():
        return {"success": False, "detail": "postgres not enabled"}

    with SessionLocal() as db:
        if db.get(DbAuthUser, user_id) is None:
            raise ValueError("User not found for save word")

        existing = db.execute(
            select(DbSavedWord).where(
                DbSavedWord.user_id == user_id,
                DbSavedWord.word_id == payload["id"],
            )
        ).scalar_one_or_none()

        if existing is None:
            db.add(
                DbSavedWord(
                    user_id=user_id,
                    word_id=payload["id"],
                    word=payload["word"],
                    meaning=payload["meaning"],
                    set_title=payload.get("set_title"),
                )
            )
            db.flush()

        progress = _ensure_progress_row(db, user_id)
        saved_count = _count_saved_words(db, user_id)
        _ensure_progress_fields(progress, saved_words_count=saved_count)
        db.commit()
        return {
            "success": True,
            "already_saved": existing is not None,
            "saved_count": saved_count,
        }


def remove_saved_word(user_id: str, word_id: str) -> dict[str, Any]:
    if not is_enabled():
        return {"success": False, "detail": "postgres not enabled"}

    with SessionLocal() as db:
        row = db.execute(
            select(DbSavedWord).where(
                DbSavedWord.user_id == user_id,
                DbSavedWord.word_id == word_id,
            )
        ).scalar_one_or_none()
        if row is not None:
            db.delete(row)
            db.flush()

        progress = _ensure_progress_row(db, user_id)
        saved_count = _count_saved_words(db, user_id)
        _ensure_progress_fields(progress, saved_words_count=saved_count)
        db.commit()
        return {
            "success": True,
            "saved_count": saved_count,
        }


def get_leaderboard(limit: int = 20, current_user_id: Optional[str] = None) -> list[dict[str, Any]]:
    if not is_enabled():
        return []

    with SessionLocal() as db:
        rows = db.execute(
            select(DbAuthUser, DbUserProgress)
            .join(DbUserProgress, DbUserProgress.user_id == DbAuthUser.id)
            .order_by(
                DbUserProgress.xp_score.desc(),
                DbUserProgress.vocab_score.desc(),
                DbUserProgress.activities_count.desc(),
                DbAuthUser.created_at.asc(),
            )
            .limit(limit)
        ).all()

        leaderboard = []
        for index, (user, progress) in enumerate(rows, start=1):
            _ensure_progress_fields(progress)
            leaderboard.append(
                _leaderboard_entry(
                    index,
                    user,
                    progress,
                    current_user_id=current_user_id,
                )
            )
        return leaderboard


def get_admin_student_summary() -> dict[str, int]:
    if not is_enabled():
        return {
            "total_students": 0,
            "visitors_today": 0,
            "online_today": 0,
            "away_today": 0,
            "offline_today": 0,
        }

    today = datetime.now().date().isoformat()
    with SessionLocal() as db:
        total_students = _safe_int(db.scalar(select(func.count()).select_from(DbAuthUser)))
        online_today = _safe_int(
            db.scalar(
                select(func.count())
                .select_from(DbUserProgress)
                .where(DbUserProgress.last_activity_date == today)
            )
        )
        return {
            "total_students": total_students,
            "visitors_today": online_today,
            "online_today": online_today,
            "away_today": 0,
            "offline_today": max(total_students - online_today, 0),
        }


def get_admin_student_activity(limit: int = 12) -> list[dict[str, Any]]:
    if not is_enabled():
        return []

    with SessionLocal() as db:
        rows = db.execute(
            select(DbAuthUser, DbUserProgress)
            .outerjoin(DbUserProgress, DbUserProgress.user_id == DbAuthUser.id)
        ).all()

        items = []
        for user, progress in rows:
            if progress is None:
                items.append(
                    {
                        "user_id": user.id,
                        "display_name": _display_name(user),
                        "email": user.email,
                        "last_activity_date": None,
                        "total_xp": 0,
                        "streak_days": 0,
                        "activities_count": 0,
                        "status": "offline",
                        "created_at": user.created_at.isoformat(),
                    }
                )
                continue

            _ensure_progress_fields(progress)
            items.append(
                {
                    "user_id": user.id,
                    "display_name": _display_name(user),
                    "email": user.email,
                    "last_activity_date": progress.last_activity_date,
                    "total_xp": _safe_int(progress.total_xp),
                    "streak_days": _safe_int(progress.streak_days),
                    "activities_count": _safe_int(progress.activities_count),
                    "status": "online" if progress.last_activity_date == datetime.now().date().isoformat() else "offline",
                    "created_at": user.created_at.isoformat(),
                }
            )

        items.sort(
            key=lambda item: (
                1 if item["status"] == "online" else 0,
                item["last_activity_date"] or "",
                item["activities_count"],
                item["created_at"],
            ),
            reverse=True,
        )
        return items[:limit]


def check_connection() -> bool:
    if not is_enabled():
        return False
    try:
        with SessionLocal() as db:
            db.execute(select(1))
        return True
    except Exception:
        return False
