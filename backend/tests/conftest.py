"""Pytest fixtures shared across the entire test suite.

Uses an in-memory SQLite database — no live PostgreSQL required.
Tests never touch production data.
"""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

# ── Environment must be set before importing anything that reads settings ──────
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["ENVIRONMENT"]  = "test"
os.environ["SECRET_KEY"]   = "test-secret-key"
os.environ["ALLOWED_ORIGINS"] = "http://localhost:5173"

from app.db.base   import Base       # noqa: E402
from app.db.session import get_db    # noqa: E402
from app.main      import app        # noqa: E402

# ── Test engine ───────────────────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite:///./test.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(bind=test_engine)
    _seed_lookup_data()
    yield
    Base.metadata.drop_all(bind=test_engine)


def _seed_lookup_data() -> None:
    """Seed services and barbers once per session."""
    from app.models.queue import Barber, BarberStatus, Service
    db = TestingSessionLocal()
    try:
        if db.query(Service).count() == 0:
            db.add_all([
                Service(id=1, name="Classic Haircut",    price=250, duration=30, is_active=True),
                Service(id=2, name="Royal Shave",        price=350, duration=45, is_active=True),
                Service(id=3, name="Beard Trim & Shape", price=200, duration=20, is_active=True),
            ])
        if db.query(Barber).count() == 0:
            db.add_all([
                Barber(id=1, name="Rajan Mehta", status=BarberStatus.available, is_active=True),
                Barber(id=2, name="Arjun Shah",  status=BarberStatus.available, is_active=True),
                Barber(id=3, name="Dev Patel",   status=BarberStatus.on_break,  is_active=True),
            ])
        db.commit()
    finally:
        db.close()


@pytest.fixture()
def db() -> Session:
    """Yield an isolated test session that rolls back after each test."""
    connection  = test_engine.connect()
    transaction = connection.begin()
    session     = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db: Session) -> TestClient:
    """TestClient wired to the isolated test session."""
    def _override():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
