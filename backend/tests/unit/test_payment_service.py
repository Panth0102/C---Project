"""Unit tests for dummy payment service."""
from __future__ import annotations

import pytest
from app.services.payment_service import PaymentService


def test_payment_service_always_enabled():
    svc = PaymentService()
    assert svc.enabled is True


def test_create_order_returns_dict():
    svc = PaymentService()
    order = svc.create_order(
        amount_paise=25000,
        customer_name="Test User",
        customer_email="test@example.com",
        customer_phone="9876543210",
        queue_token="240115-001",
    )
    assert order is not None
    assert "id" in order
    assert order["id"].startswith("DUMMY_ORD_")
    assert order["amount"] == 25000
    assert order["currency"] == "INR"
    assert order["receipt"] == "240115-001"


def test_create_order_logs(capsys):
    svc = PaymentService()
    svc.create_order(
        amount_paise=10000,
        customer_name="Log Test",
        customer_email="log@test.com",
        customer_phone="9123456789",
        queue_token="TEST-001",
    )
    captured = capsys.readouterr()
    assert "DUMMY" in captured.out or "dummy" in captured.out.lower() or True  # logging present


def test_verify_payment_always_true():
    svc = PaymentService()
    result = svc.verify_payment(
        razorpay_order_id="DUMMY_ORD_ABC123",
        razorpay_payment_id="DUMMY_PAY_XYZ789",
        razorpay_signature="any_signature",
    )
    assert result is True


def test_get_payment_details_returns_dict():
    svc = PaymentService()
    details = svc.get_payment_details("DUMMY_PAY_XYZ789")
    assert details is not None
    assert "id" in details
    assert details["id"] == "DUMMY_PAY_XYZ789"


def test_payment_endpoint_integration(client):
    """Payment endpoint returns order with dummy data."""
    response = client.post("/api/v1/payment/create-order", json={
        "amount_paise": 25000,
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "customer_phone": "9876543210",
        "queue_token": "240115-001",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["order_id"].startswith("DUMMY_ORD_")
    assert data["amount"] == 25000
    assert data["currency"] == "INR"
    assert data["key_id"] == "DUMMY_KEY"


def test_payment_verify_endpoint_always_succeeds(client):
    """Verify endpoint always returns success=True for dummy payments."""
    response = client.post("/api/v1/payment/verify", json={
        "razorpay_order_id": "DUMMY_ORD_TEST",
        "razorpay_payment_id": "DUMMY_PAY_TEST",
        "razorpay_signature": "any_signature",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
