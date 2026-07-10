"""
Database connection — SQLAlchemy async engine for Supabase PostgreSQL.
Uses asyncpg driver with statement_cache_size=0 for pgbouncer compatibility.
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text, event
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def _build_async_url(database_url: str) -> str:
    """
    Convert a standard postgres:// URL to asyncpg-compatible
    postgresql+asyncpg:// URL.
    """
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return database_url


# ── Lazy engine singleton ────────────────────────────────────────────────────
_engine = None
_session_factory = None


def _get_engine():
    """Create the async SQLAlchemy engine (lazy, singleton)."""
    global _engine
    if _engine is None:
        settings = get_settings()
        if not settings.database_url:
            raise RuntimeError(
                "DATABASE_URL is not set. Please configure it in .env or environment variables."
            )
        async_url = _build_async_url(settings.database_url)
        _engine = create_async_engine(
            async_url,
            echo=settings.debug,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=300,
            connect_args={
                "statement_cache_size": 0,
            },
        )
    return _engine


def _get_session_factory():
    """Get or create the session factory (lazy, singleton)."""
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(
            bind=_get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False,
        )
    return _session_factory


async def get_db() -> AsyncSession:
    """
    FastAPI dependency — yields a database session per request.
    Automatically closes the session when the request is done.
    """
    session_factory = _get_session_factory()
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_db_connection() -> bool:
    """
    Health check — verify the database connection is alive.
    Returns True if connected, False otherwise.
    """
    try:
        session_factory = _get_session_factory()
        async with session_factory() as session:
            await session.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False
