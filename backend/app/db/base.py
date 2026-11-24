"""SQLAlchemy declarative base shared by all models."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Single declarative base for the entire application.

    Import all models in alembic/env.py so Alembic can detect schema changes.
    """
    pass
