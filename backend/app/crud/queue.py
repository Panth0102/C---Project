"""CRUD operations for the queue domain."""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.queue import Barber, BarberStatus, Queue, QueueStatus, Service


# ── Token generation ──────────────────────────────────────────────────────────

def _generate_token(db: Session) -> str:
    """Generate a token in format YYMMDD-XXX (e.g. 240115-003)."""
    today = date.today()
    prefix = today.strftime("%y%m%d")
    count = (
        db.query(func.count(Queue.id))
        .filter(func.date(Queue.created_at) == today)
        .scalar()
        or 0
    )
    return f"{prefix}-{count + 1:03d}"


# ── Queue eager-load helper ───────────────────────────────────────────────────

def _queue_query(db: Session):
    return db.query(Queue).options(
        selectinload(Queue.services),
        selectinload(Queue.barber),
    )


# ── Reads ─────────────────────────────────────────────────────────────────────

def get_queue_by_id(db: Session, queue_id: int) -> Optional[Queue]:
    return _queue_query(db).filter(Queue.id == queue_id).first()


def get_queue_by_token(db: Session, token: str) -> Optional[Queue]:
    return _queue_query(db).filter(Queue.token == token).first()


def get_active_queue_by_phone(db: Session, phone: str) -> Optional[Queue]:
    """Return the first active (waiting/called/in_service) entry for a phone."""
    active_statuses = [QueueStatus.waiting, QueueStatus.called, QueueStatus.in_service]
    return (
        _queue_query(db)
        .filter(Queue.phone == phone, Queue.status.in_(active_statuses))
        .first()
    )


def get_all_active(db: Session) -> List[Queue]:
    """All entries that are not yet archived."""
    active = [QueueStatus.waiting, QueueStatus.called, QueueStatus.in_service]
    return (
        _queue_query(db)
        .filter(Queue.status.in_(active))
        .order_by(Queue.created_at)
        .all()
    )


def get_waiting_for_barber(db: Session, barber_id: int) -> List[Queue]:
    """Waiting + called entries assigned to a specific barber, in order."""
    return (
        _queue_query(db)
        .filter(
            Queue.barber_id == barber_id,
            Queue.status.in_([QueueStatus.waiting, QueueStatus.called]),
        )
        .order_by(Queue.created_at)
        .all()
    )


# ── Barber helpers ────────────────────────────────────────────────────────────

def get_all_barbers(db: Session) -> List[Barber]:
    return db.query(Barber).filter(Barber.is_active == True).all()  # noqa: E712


def get_barber_by_id(db: Session, barber_id: int) -> Optional[Barber]:
    return db.get(Barber, barber_id)


def get_barber_load(db: Session, barber_id: int) -> int:
    """Number of waiting+called entries for this barber."""
    return (
        db.query(func.count(Queue.id))
        .filter(
            Queue.barber_id == barber_id,
            Queue.status.in_([QueueStatus.waiting, QueueStatus.called]),
        )
        .scalar()
        or 0
    )


def auto_assign_barber(db: Session, service_ids: List[int]) -> Optional[Barber]:
    """Assign the least-loaded available barber; tie-break by name."""
    available = (
        db.query(Barber)
        .filter(Barber.status == BarberStatus.available, Barber.is_active == True)  # noqa: E712
        .all()
    )
    if not available:
        return None
    return min(available, key=lambda b: (get_barber_load(db, b.id), b.name))


# ── Service helpers ───────────────────────────────────────────────────────────

def get_all_services(db: Session) -> List[Service]:
    return db.query(Service).filter(Service.is_active == True).all()  # noqa: E712


def get_services_by_ids(db: Session, ids: List[int]) -> List[Service]:
    return db.query(Service).filter(Service.id.in_(ids), Service.is_active == True).all()  # noqa: E712


# ── ETA calculation ───────────────────────────────────────────────────────────

TURNOVER_BUFFER_MINUTES = 5


def recalculate_positions_and_eta(db: Session) -> None:
    """Recompute position and ETA for all active waiting entries.

    Groups by barber, processes oldest-first within each barber's queue.
    """
    all_active = get_all_active(db)

    # Separate by barber
    by_barber: dict[int | None, list[Queue]] = {}
    for entry in all_active:
        key = entry.barber_id
        by_barber.setdefault(key, []).append(entry)

    for _barber_id, entries in by_barber.items():
        # Sort: in_service / called first (they are actively being served),
        # then waiting in created_at order.
        def sort_key(e: Queue) -> tuple:
            order = {
                QueueStatus.in_service: 0,
                QueueStatus.called: 1,
                QueueStatus.waiting: 2,
            }
            return (order.get(e.status, 3), e.created_at)

        entries.sort(key=sort_key)

        cumulative = 0
        waiting_pos = 1
        for entry in entries:
            if entry.status in (QueueStatus.in_service, QueueStatus.called):
                entry.position = 0
                entry.estimated_wait_minutes = 0
            else:
                entry.position = waiting_pos
                entry.estimated_wait_minutes = cumulative
                waiting_pos += 1
                cumulative += entry.total_duration + TURNOVER_BUFFER_MINUTES

    db.commit()


# ── Create ────────────────────────────────────────────────────────────────────

def create_queue_entry(
    db: Session,
    customer_name: str,
    phone: str,
    service_ids: List[int],
    barber_id: Optional[int],
) -> Queue:
    services = get_services_by_ids(db, service_ids)
    if not services:
        raise ValueError("No valid services found for the given IDs.")

    barber_locked = barber_id is not None
    if not barber_locked:
        assigned = auto_assign_barber(db, service_ids)
        barber_id = assigned.id if assigned else None

    token = _generate_token(db)
    entry = Queue(
        token=token,
        customer_name=customer_name,
        phone=phone,
        barber_id=barber_id,
        barber_locked=barber_locked,
        status=QueueStatus.waiting,
        services=services,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    recalculate_positions_and_eta(db)
    db.refresh(entry)
    return entry


# ── Status transitions ────────────────────────────────────────────────────────

def update_queue_status(db: Session, entry: Queue, new_status: QueueStatus) -> Queue:
    now = datetime.now(timezone.utc)
    entry.status = new_status
    if new_status == QueueStatus.called:
        entry.called_at = now
    elif new_status == QueueStatus.in_service:
        entry.started_at = now
    elif new_status in (QueueStatus.completed, QueueStatus.cancelled, QueueStatus.no_show):
        entry.completed_at = now
    db.commit()
    recalculate_positions_and_eta(db)
    db.refresh(entry)
    return entry


# ── Barber status ─────────────────────────────────────────────────────────────

def update_barber_status(db: Session, barber: Barber, new_status: BarberStatus) -> Barber:
    barber.status = new_status
    db.commit()
    db.refresh(barber)
    return barber
