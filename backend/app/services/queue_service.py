"""Business-logic layer for the queue domain."""

from __future__ import annotations

from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud import queue as queue_crud
from app.models.queue import BarberStatus, Barber, Queue, QueueStatus, Service
from app.schemas.queue import DashboardSummary


# ── Fetchers with 404 ─────────────────────────────────────────────────────────

def get_queue_or_404(db: Session, queue_id: int) -> Queue:
    entry = queue_crud.get_queue_by_id(db, queue_id)
    if not entry:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Queue entry {queue_id} not found.")
    return entry


def get_queue_by_token_or_404(db: Session, token: str) -> Queue:
    entry = queue_crud.get_queue_by_token(db, token)
    if not entry:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Token '{token}' not found.")
    return entry


def get_barber_or_404(db: Session, barber_id: int) -> Barber:
    barber = queue_crud.get_barber_by_id(db, barber_id)
    if not barber:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=f"Barber {barber_id} not found.")
    return barber


# ── Queue join ────────────────────────────────────────────────────────────────

def join_queue(
    db: Session,
    customer_name: str,
    phone: str,
    service_ids: List[int],
    barber_id: int | None,
) -> Queue:
    # Duplicate active entry check
    duplicate = queue_crud.get_active_queue_by_phone(db, phone)
    if duplicate:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail=f"An active queue entry already exists for this phone number (token: {duplicate.token}).",
        )

    # Barber availability check for explicit selection
    if barber_id is not None:
        barber = queue_crud.get_barber_by_id(db, barber_id)
        if not barber or not barber.is_active:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Selected barber is not available.")
        if barber.status == BarberStatus.on_break:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                detail="Selected barber is on break. Please choose another barber.",
            )

    try:
        return queue_crud.create_queue_entry(db, customer_name, phone, service_ids, barber_id)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


# ── Status transitions ────────────────────────────────────────────────────────

_VALID_TRANSITIONS: dict[QueueStatus, set[QueueStatus]] = {
    QueueStatus.waiting:    {QueueStatus.called, QueueStatus.cancelled, QueueStatus.no_show},
    QueueStatus.called:     {QueueStatus.in_service, QueueStatus.no_show, QueueStatus.cancelled},
    QueueStatus.in_service: {QueueStatus.completed},
    QueueStatus.completed:  set(),
    QueueStatus.cancelled:  set(),
    QueueStatus.no_show:    set(),
}


def transition_status(db: Session, entry: Queue, new_status: QueueStatus) -> Queue:
    allowed = _VALID_TRANSITIONS.get(entry.status, set())
    if new_status not in allowed:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Cannot transition from '{entry.status}' to '{new_status}'.",
        )
    return queue_crud.update_queue_status(db, entry, new_status)


def cancel_by_customer(db: Session, entry: Queue) -> Queue:
    """Customer-initiated cancel — only allowed from 'waiting'."""
    if entry.status != QueueStatus.waiting:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="You can only cancel while your status is 'waiting'.",
        )
    return queue_crud.update_queue_status(db, entry, QueueStatus.cancelled)


# ── Barber status ─────────────────────────────────────────────────────────────

def set_barber_status(db: Session, barber_id: int, new_status: BarberStatus) -> Barber:
    barber = get_barber_or_404(db, barber_id)
    return queue_crud.update_barber_status(db, barber, new_status)


# ── Dashboard summary ─────────────────────────────────────────────────────────

def get_dashboard_summary(db: Session) -> DashboardSummary:
    active = queue_crud.get_all_active(db)
    waiting    = [e for e in active if e.status == QueueStatus.waiting]
    called     = [e for e in active if e.status == QueueStatus.called]
    in_service = [e for e in active if e.status == QueueStatus.in_service]
    avg_wait = (
        sum(e.estimated_wait_minutes for e in waiting) // len(waiting)
        if waiting else 0
    )
    return DashboardSummary(
        total_waiting=len(waiting),
        total_in_service=len(in_service),
        total_called=len(called),
        average_wait_minutes=avg_wait,
        queue_open=True,
    )
