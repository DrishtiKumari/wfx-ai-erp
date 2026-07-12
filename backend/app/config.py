"""
Application configuration — reads environment variables via pydantic-settings.
Never hardcode secrets. All values come from .env or deployment environment.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────
    database_url: str = ""
    supabase_url: str = ""
    supabase_anon_key: str = ""

    # ── OpenRouter AI ─────────────────────────────────────────────
    openrouter_api_key: str = ""
    openrouter_model: str = "google/gemini-2.0-flash-001"

    # ── App ───────────────────────────────────────────────────────
    app_name: str = "WFX AI ERP"
    app_version: str = "1.0.0"
    debug: bool = False

    # ── CORS ──────────────────────────────────────────────────────
    # Comma-separated list of allowed origins
    allowed_origins: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def allowed_origins_list(self) -> list[str]:
        """Parse comma-separated origins into a list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance — only reads .env once per process lifetime.
    Use dependency injection: Depends(get_settings)
    """
    return Settings()
