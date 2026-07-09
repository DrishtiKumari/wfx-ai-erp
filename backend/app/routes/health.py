"""
Health check route — used by Render and monitoring tools to verify the
backend is alive and the database is reachable.
"""

from fastapi import APIRouter
from app.config import get_settings
from app.database import check_db_connection

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service health check")
async def health_check():
    """
    Returns the current health status of the API and its dependencies.

    - **status**: 'healthy' or 'degraded'
    - **database**: whether Supabase PostgreSQL is reachable
    - **version**: current app version
    """
    settings = get_settings()
    db_ok = await check_db_connection()

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "wfx-ai-erp-backend",
        "version": settings.app_version,
        "database": "connected" if db_ok else "unreachable",
    }
