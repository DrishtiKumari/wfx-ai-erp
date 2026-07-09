"""
WFX AI ERP — FastAPI Application Entry Point

Wires together all routes, middleware, CORS, and startup/shutdown events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import get_settings
from app.routes.health import router as health_router

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs once on startup and once on shutdown.
    Used for DB connection pool warmup and graceful teardown.
    """
    settings = get_settings()
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Debug mode: {settings.debug}")
    yield
    logger.info("Shutting down — closing database connections")


# ── App factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "AI-native ERP exploration platform for the apparel and fashion industry. "
            "Supports natural language queries, product exploration, and business analytics."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS middleware ───────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    # ── Routes ────────────────────────────────────────────────────
    app.include_router(health_router)
    # Future routers will be added here in subsequent phases:
    # app.include_router(dashboard_router, prefix="/dashboard")
    # app.include_router(products_router, prefix="/products")
    # app.include_router(ai_router, prefix="/ai")

    return app


app = create_app()
