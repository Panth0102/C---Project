"""Queue endpoints — /api/v1/queue"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.queue import QueueStatus
from app.schemas.queue import (
    BarberRead, BarberStatusUpdate,
    DashboardSummary,
    QueueCreate, QueueRead, QueueStatusUpdate,
    ServiceRead, WalkInCreate,
)
from app.services import queue_service

router = APIRouter(prefix="/queue", tags=["Queue"])


# ── Services catalogue ────────────────────────────────────────────────────────

@router.get("/services", response_model=List[ServiceRead], summary="List all services")
def list_services(db: Session = Depends(get_db)) -> List[ServiceRead]:
    from app.crud.queue import get_all_services
    return get_all_services(db)


# ── Barbers ───────────────────────────────────────────────────────────────────

@router.get("/barbers", response_model=List[BarberRead], summary="List all barbers")
def list_barbers(db: Session = Depends(get_db)) -> List[BarberRead]:
    from app.crud.queue import get_all_barbers
    return get_all_barbers(db)


@router.patch(
    "/barbers/{barber_id}/status",
    response_model=BarberRead,
    summary="Update barber availability status",
)
def update_barber_status(
    barber_id: int,
    payload: BarberStatusUpdate,
    db: Session = Depends(get_db),
) -> BarberRead:
    return queue_service.set_barber_status(db, barber_id, payload.status)


# ── Queue entries ─────────────────────────────────────────────────────────────

@router.post(
    "/join",
    response_model=QueueRead,
    status_code=status.HTTP_201_CREATED,
    summary="Customer joins the queue",
)
def join_queue(payload: QueueCreate, db: Session = Depends(get_db)) -> QueueRead:
    return queue_service.join_queue(
        db,
        customer_name=payload.customer_name,
        phone=payload.phone,
        service_ids=payload.service_ids,
        barber_id=payload.barber_id,
    )


@router.post(
    "/walkin",
    response_model=QueueRead,
    status_code=status.HTTP_201_CREATED,
    summary="Receptionist adds a walk-in customer",
)
def add_walkin(payload: WalkInCreate, db: Session = Depends(get_db)) -> QueueRead:
    return queue_service.join_queue(
        db,
        customer_name=payload.customer_name,
        phone=payload.phone,
        service_ids=payload.service_ids,
        barber_id=payload.barber_id,
    )


@router.get(
    "/status/{token}",
    response_model=QueueRead,
    summary="Get queue entry by token (customer status page)",
)
def get_status_by_token(token: str, db: Session = Depends(get_db)) -> QueueRead:
    return queue_service.get_queue_by_token_or_404(db, token)


@router.get(
    "/active",
    response_model=List[QueueRead],
    summary="List all active queue entries (reception dashboard)",
)
def list_active(db: Session = Depends(get_db)) -> List[QueueRead]:
    from app.crud.queue import get_all_active
    return get_all_active(db)


@router.patch(
    "/{queue_id}/status",
    response_model=QueueRead,
    summary="Update a queue entry status (receptionist / barber)",
)
def update_status(
    queue_id: int,
    payload: QueueStatusUpdate,
    db: Session = Depends(get_db),
) -> QueueRead:
    entry = queue_service.get_queue_or_404(db, queue_id)
    return queue_service.transition_status(db, entry, payload.status)


@router.delete(
    "/{queue_id}/cancel",
    response_model=QueueRead,
    summary="Customer cancels their own spot",
)
def customer_cancel(queue_id: int, db: Session = Depends(get_db)) -> QueueRead:
    entry = queue_service.get_queue_or_404(db, queue_id)
    return queue_service.cancel_by_customer(db, entry)


# ── Dashboard summary ─────────────────────────────────────────────────────────

@router.get(
    "/dashboard/summary",
    response_model=DashboardSummary,
    summary="Receptionist dashboard statistics",
)
def dashboard_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    return queue_service.get_dashboard_summary(db)
