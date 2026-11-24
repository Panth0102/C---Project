"""Unit tests for queue business-logic (service layer, CRUD helpers)."""

from __future__ import annotations

import pytest
from sqlalchemy.orm import Session

from app.crud.queue import (
    create_queue_entry, get_queue_by_token, get_active_queue_by_phone,
    recalculate_positions_and_eta, update_queue_status, auto_assign_barber,
)
from app.models.queue import BarberStatus, QueueStatus


@pytest.mark.unit
def test_create_queue_entry_returns_token(db: Session):
    entry = create_queue_entry(db, "Ravi", "9876500001", [1], None)
    assert entry.token
    assert entry.status == QueueStatus.waiting


@pytest.mark.unit
def test_token_format_is_correct(db: Session):
    entry = create_queue_entry(db, "Priya", "9876500002", [1], None)
    # Format: YYMMDD-NNN
    parts = entry.token.split("-")
    assert len(parts) == 2
    assert len(parts[0]) == 6
    assert parts[1].isdigit()


@pytest.mark.unit
def test_auto_assign_picks_available_barber(db: Session):
    barber = auto_assign_barber(db, [1])
    assert barber is not None
    assert barber.status == BarberStatus.available


@pytest.mark.unit
def test_duplicate_active_phone_detected(db: Session):
    create_queue_entry(db, "Amit", "9876500003", [1], None)
    duplicate = get_active_queue_by_phone(db, "9876500003")
    assert duplicate is not None


@pytest.mark.unit
def test_positions_recalculated_after_new_entry(db: Session):
    e1 = create_queue_entry(db, "P1", "9876500004", [1], 1)
    e2 = create_queue_entry(db, "P2", "9876500005", [1], 1)
    db.refresh(e1)
    db.refresh(e2)
    assert e1.position == 1
    assert e2.position == 2


@pytest.mark.unit
def test_eta_increases_with_queue_depth(db: Session):
    e1 = create_queue_entry(db, "Q1", "9876500006", [1], 1)  # 30 min service
    e2 = create_queue_entry(db, "Q2", "9876500007", [1], 1)
    db.refresh(e1)
    db.refresh(e2)
    # e2 must wait longer than e1
    assert e2.estimated_wait_minutes > e1.estimated_wait_minutes


@pytest.mark.unit
def test_transition_to_called_sets_called_at(db: Session):
    entry = create_queue_entry(db, "Nisha", "9876500008", [1], None)
    updated = update_queue_status(db, entry, QueueStatus.called)
    assert updated.status == QueueStatus.called
    assert updated.called_at is not None


@pytest.mark.unit
def test_transition_to_in_service_sets_started_at(db: Session):
    entry = create_queue_entry(db, "Suresh", "9876500009", [1], None)
    update_queue_status(db, entry, QueueStatus.called)
    updated = update_queue_status(db, entry, QueueStatus.in_service)
    assert updated.started_at is not None


@pytest.mark.unit
def test_transition_to_completed_sets_completed_at(db: Session):
    entry = create_queue_entry(db, "Leena", "9876500010", [1], None)
    update_queue_status(db, entry, QueueStatus.called)
    update_queue_status(db, entry, QueueStatus.in_service)
    updated = update_queue_status(db, entry, QueueStatus.completed)
    assert updated.completed_at is not None


@pytest.mark.unit
def test_cancel_removes_entry_from_active(db: Session):
    entry = create_queue_entry(db, "Raj", "9876500011", [1], None)
    update_queue_status(db, entry, QueueStatus.cancelled)
    active = get_active_queue_by_phone(db, "9876500011")
    assert active is None


@pytest.mark.unit
def test_no_show_removes_entry_from_active(db: Session):
    entry = create_queue_entry(db, "Ghost", "9876500012", [1], None)
    update_queue_status(db, entry, QueueStatus.called)
    update_queue_status(db, entry, QueueStatus.no_show)
    active = get_active_queue_by_phone(db, "9876500012")
    assert active is None
