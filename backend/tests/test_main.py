"""Tests for the root and health-check endpoints."""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.unit
def test_root_returns_200(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200


@pytest.mark.unit
def test_root_contains_message(client: TestClient):
    data = client.get("/").json()
    assert "message" in data
    assert "Welcome" in data["message"]


@pytest.mark.unit
def test_root_contains_docs_link(client: TestClient):
    data = client.get("/").json()
    assert data.get("docs") == "/docs"


@pytest.mark.unit
def test_health_check_returns_200(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200


@pytest.mark.unit
def test_health_check_status_is_healthy(client: TestClient):
    data = client.get("/health").json()
    assert data["status"] == "healthy"


@pytest.mark.unit
def test_health_check_contains_version(client: TestClient):
    data = client.get("/health").json()
    assert "version" in data
