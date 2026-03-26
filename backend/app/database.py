"""Database configuration and session management"""
from typing import AsyncGenerator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


# Convert postgresql:// to postgresql+asyncpg:// for async
async_database_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Async engine for production
async_engine = create_async_engine(
    async_database_url,
    echo=settings.DEBUG,
    future=True,
)

# Sync engine for Alembic migrations
sync_engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

# Session factories
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

SessionLocal = sessionmaker(
    sync_engine,
    class_=Session,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting async database session
    
    Usage:
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_sync_db() -> Session:
    """Get synchronous database session (for migrations and seeds)"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
