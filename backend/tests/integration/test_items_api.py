"""Integration tests for the /api/v1/items endpoints."""

import pytest
from fastapi.testclient import TestClient


# ── Helpers ───────────────────────────────────────────────────────────────────

def _create_item(client: TestClient, title: str = "Test Item", description: str = "Desc") -> dict:
    response = client.post("/api/v1/items/", json={"title": title, "description": description})
    assert response.status_code == 201, response.text
    return response.json()


# ── GET /api/v1/items/ ────────────────────────────────────────────────────────

@pytest.mark.integration
def test_list_items_returns_200(client: TestClient):
    response = client.get("/api/v1/items/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


# ── POST /api/v1/items/ ───────────────────────────────────────────────────────

@pytest.mark.integration
def test_create_item_returns_201(client: TestClient):
    response = client.post("/api/v1/items/", json={"title": "New Item"})
    assert response.status_code == 201


@pytest.mark.integration
def test_create_item_persists_data(client: TestClient):
    item = _create_item(client, title="Persist Me", description="Check this")
    assert item["title"] == "Persist Me"
    assert item["description"] == "Check this"
    assert item["is_active"] is True
    assert "id" in item
    assert "created_at" in item
    assert "updated_at" in item


@pytest.mark.integration
def test_create_item_missing_title_returns_422(client: TestClient):
    response = client.post("/api/v1/items/", json={"description": "No title"})
    assert response.status_code == 422


@pytest.mark.integration
def test_create_item_empty_title_returns_422(client: TestClient):
    response = client.post("/api/v1/items/", json={"title": ""})
    assert response.status_code == 422


# ── GET /api/v1/items/{id} ────────────────────────────────────────────────────

@pytest.mark.integration
def test_get_item_by_id(client: TestClient):
    created = _create_item(client, title="Get By ID")
    response = client.get(f"/api/v1/items/{created['id']}")
    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


@pytest.mark.integration
def test_get_nonexistent_item_returns_404(client: TestClient):
    response = client.get("/api/v1/items/999999")
    assert response.status_code == 404


# ── PUT /api/v1/items/{id} ────────────────────────────────────────────────────

@pytest.mark.integration
def test_update_item(client: TestClient):
    created = _create_item(client, title="Before Update")
    response = client.put(
        f"/api/v1/items/{created['id']}",
        json={"title": "After Update"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "After Update"


@pytest.mark.integration
def test_update_nonexistent_item_returns_404(client: TestClient):
    response = client.put("/api/v1/items/999999", json={"title": "Ghost"})
    assert response.status_code == 404


@pytest.mark.integration
def test_update_item_partial(client: TestClient):
    created = _create_item(client, title="Partial Update", description="Original")
    response = client.put(
        f"/api/v1/items/{created['id']}",
        json={"is_active": False},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is False
    assert data["title"] == "Partial Update"


# ── DELETE /api/v1/items/{id} ─────────────────────────────────────────────────

@pytest.mark.integration
def test_delete_item(client: TestClient):
    created = _create_item(client, title="Delete Me")
    response = client.delete(f"/api/v1/items/{created['id']}")
    assert response.status_code == 200


@pytest.mark.integration
def test_deleted_item_is_gone(client: TestClient):
    created = _create_item(client, title="Gone Soon")
    client.delete(f"/api/v1/items/{created['id']}")
    response = client.get(f"/api/v1/items/{created['id']}")
    assert response.status_code == 404


@pytest.mark.integration
def test_delete_nonexistent_item_returns_404(client: TestClient):
    response = client.delete("/api/v1/items/999999")
    assert response.status_code == 404


# ── Pagination ────────────────────────────────────────────────────────────────

@pytest.mark.integration
def test_list_items_pagination(client: TestClient):
    for i in range(3):
        _create_item(client, title=f"Page Item {i}")
    response = client.get("/api/v1/items/?skip=0&limit=2")
    assert response.status_code == 200
    assert len(response.json()) <= 2
