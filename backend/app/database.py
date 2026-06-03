from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Idempotent ALTERs for Issue columns added after initial deploy (create_all skips existing tables).
_ISSUES_COLUMN_MIGRATIONS: tuple[str, ...] = (
    "ALTER TABLE issues ADD COLUMN IF NOT EXISTS developer_friendly_summary TEXT",
    "ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_enhanced BOOLEAN DEFAULT FALSE NOT NULL",
    "ALTER TABLE issues ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50)",
)


def _migrate_issues_columns() -> None:
    """Add Groq/AI Issue columns on PostgreSQL when missing (safe to run repeatedly)."""
    if not settings.DATABASE_URL.startswith("postgresql"):
        return
    with engine.begin() as conn:
        for stmt in _ISSUES_COLUMN_MIGRATIONS:
            conn.execute(text(stmt))


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app.models import issue, scan, user  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _migrate_issues_columns()
