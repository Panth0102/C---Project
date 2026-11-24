"""Integration tests for /api/v1/queue endpoints."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


# ── Helpers ───────────────────────────────────────────────────────────────────

def _join(client: TestClient, phone: str = "9876543210", barber_id=None) -> dict:
    payload = {
        "customer_name": "Test Customer",
        "phone": phone,
        "service_ids": [1],
    }
    if barber_id is not None:
        payload["barber_id"] = barber_id
    r = client.post("/api/v1/queue/join", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


# ── Catalogue ─────────────────────────────────────────────────────────────────

@pytest.mark.integration
def test_list_services_returns_200(client: TestClient):
    r = client.get("/api/v1/queue/services")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 1


@pytest.mark.integration
def test_list_barbers_returns_200(client: TestClient):
    r = client.get("/api/v1/queue/barbers")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 1


# ── Join queue ────────────────────────────────────────────────────────────────

@pytest.mark.integration
def test_join_queue_returns_201(client: TestClient):
    r = client.post("/api/v1/queue/join", json={
        "customer_name": "Arjun Sharma",
        "phone": "9876543210",
        "service_ids": [1],
    })
    assert r.status_code == 201


@pytest.mark.integration
def test_join_queue_returns_token(client: TestClient):
    entry = _join(client, "9876543211")
    assert "token" in entry
    assert entry["token"]  # not empty


@pytest.mark.integration
def test_join_queue_status_is_waiting(client: TestClient):
    entry = _join(client, "9876543212")
    assert entry["status"] == "waiting"


@pytest.mark.integration
def test_join_queue_includes_services(client: TestClient):
    entry = _join(client, "9876543213")
    assert len(entry["services"]) == 1


@pytest.mark.integration
def test_join_queue_duplicate_phone_returns_409(client: TestClient):
    _join(client, "9111111111")
    r = client.post("/api/v1/queue/join", json={
        "customer_name": "Duplicate",
        "phone": "9111111111",
        "service_ids": [1],
    })
    assert r.status_code == 409


@pytest.mark.integration
def test_join_queue_invalid_phone_returns_422(client: TestClient):
    r = client.post("/api/v1/queue/join", json={
        "customer_name": "Bad Phone",
        "phone": "1234567890",   # starts with 1 — invalid Indian number
        "service_ids": [1],
    })
    assert r.status_code == 422


@pytest.mark.integration
def test_join_queue_no_services_returns_422(client: TestClient):
    r = client.post("/api/v1/queue/join", json={
        "customer_name": "No Services",
        "phone": "9876543214",
        "service_ids": [],
    })
    assert r.status_code == 422


@pytest.mark.integration
def test_join_queue_too_many_services_returns_422(client: TestClient):
    r = client.post("/api/v1/queue/join", json={
        "customer_name": "Too Many",
        "phone": "9876543215",
        "service_ids": [1, 2, 3, 1],
    })
    assert r.status_code == 422


@pytest.mark.integration
def test_join_with_on_break_barber_returns_400(client: TestClient):
    # Barber id=3 (Dev Patel) is seeded as on_break
    r = client.post("/api/v1/queue/join", json={
        "customer_name": "Break Test",
        "phone": "9876543216",
        "service_ids": [1],
        "barber_id": 3,
    })
    assert r.status_code == 400


# ── Status by token ───────────────────────────────────────────────────────────

@pytest.mark.integration
def test_get_status_by_token(client: TestClient):
    entry = _join(client, "9876543217")
    r = client.get(f"/api/v1/queue/status/{entry['token']}")
    assert r.status_code == 200
    assert r.json()["token"] == entry["token"]


@pytest.mark.integration
def test_get_status_unknown_token_returns_404(client: TestClient):
    r = client.get("/api/v1/queue/status/INVALID-999")
    assert r.status_code == 404


# ── Active list ───────────────────────────────────────────────────────────────

@pytest.mark.integration
def test_list_active_returns_list(client: TestClient):
    r = client.get("/api/v1/queue/active")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ── Status transitions ────────────────────────────────────────────────────────

@pytest.mark.integration
def test_transition_waiting_to_called(client: TestClient):
    entry = _join(client, "9876543218")
    r = client.patch(f"/api/v1/queue/{entry['id']}/status", json={"status": "called"})
    assert r.status_code == 200
    assert r.json()["status"] == "called"


@pytest.mark.integration
def test_transition_called_to_in_service(client: TestClient):
    entry = _join(client, "9876543219")
    client.patch(f"/api/v1/queue/{entry['id']}/status", json={"status": "called"})
    r = client.patch(f"/api/v1/queue/{entry['id']}/status", json={"status": "in_service"})
    assert r.status_code == 200
    assert r.json()["status"] == "in_service"


@pytest.mark.integration
def test_transition_in_service_to_completed(client: TestClient):
    entry = _join(client, "9876543220")
    client.patch(f"/api/v1/queue/{entry['id']}/status", json={"status": "called"})
    client.patch(f"/api/v1/queue/{entry['id']}/status", json={"status": "in_service"})
    r = client.patch(f"/api/v1/queue/{entry['id']}/status", json={"status": "completed"})
    assert r.status_code == 200
    assert r.json()["status"] == "completed"


@pytest.mark.integration
def test_invalid_transition_returns_422(client: TestClient):
    entry = _join(client, "9876543221")
    # Cannot jump directly from waiting to completed
    r = client.patch(f"/api/v1/queue/{entry['id']}/status", json={"status": "completed"})
    assert r.status_code == 422


# ── Customer cancel ───────────────────────────────────────────────────────────

@pytest.mark.integration
def test_customer_cancel_waiting_entry(client: TestClient):
    entry = _join(client, "9876543222")
    r = client.delete(f"/api/v1/queue/{entry['id']}/cancel")
    assert r.status_code == 200
    assert r.json()["status"] == "cancelled"


@pytest.mark.integration
def test_customer_cancel_called_entry_returns_422(client: TestClient):
    entry = _join(client, "9876543223")
    client.patch(f"/api/v1/queue/{entry['id']}/status", json={"status": "called"})
    r = client.delete(f"/api/v1/queue/{entry['id']}/cancel")
    assert r.status_code == 422


# ── Walk-in ───────────────────────────────────────────────────────────────────

@pytest.mark.integration
def test_walkin_returns_201(client: TestClient):
    r = client.post("/api/v1/queue/walkin", json={
        "customer_name": "Walk In",
        "phone": "9876543224",
        "service_ids": [1, 2],
    })
    assert r.status_code == 201


# ── Dashboard summary ─────────────────────────────────────────────────────────

@pytest.mark.integration
def test_dashboard_summary_returns_200(client: TestClient):
    r = client.get("/api/v1/queue/dashboard/summary")
    assert r.status_code == 200
    data = r.json()
    assert "total_waiting"    in data
    assert "average_wait_minutes" in data
    assert "queue_open"       in data


# ── Barber status update ──────────────────────────────────────────────────────

@pytest.mark.integration
def test_update_barber_status_to_on_break(client: TestClient):
    r = client.patch("/api/v1/queue/barbers/1/status", json={"status": "on_break"})
    assert r.status_code == 200
    assert r.json()["status"] == "on_break"


@pytest.mark.integration
def test_update_barber_status_back_to_available(client: TestClient):
    client.patch("/api/v1/queue/barbers/1/status", json={"status": "on_break"})
    r = client.patch("/api/v1/queue/barbers/1/status", json={"status": "available"})
    assert r.status_code == 200
    assert r.json()["status"] == "available"


@pytest.mark.integration
def test_update_nonexistent_barber_returns_404(client: TestClient):
    r = client.patch("/api/v1/queue/barbers/9999/status", json={"status": "available"})
    assert r.status_code == 404
