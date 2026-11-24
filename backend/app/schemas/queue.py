"""Pydantic schemas for the queue domain."""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.queue import BarberStatus, QueueStatus


# ── Service ───────────────────────────────────────────────────────────────────

class ServiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:          int
    name:        str
    price:       int
    duration:    int
    description: Optional[str] = None
    icon:        Optional[str] = None
    is_active:   bool


# ── Barber ────────────────────────────────────────────────────────────────────

class BarberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:        int
    name:      str
    specialty: Optional[str] = None
    status:    BarberStatus
    is_active: bool
    initials:  str


class BarberStatusUpdate(BaseModel):
    status: BarberStatus


# ── Queue create (customer joins) ─────────────────────────────────────────────

class QueueCreate(BaseModel):
    customer_name: str  = Field(..., min_length=1, max_length=255)
    phone:         str  = Field(..., min_length=10, max_length=15)
    service_ids:   List[int] = Field(..., min_length=1, max_length=3)
    barber_id:     Optional[int] = None   # None = auto-assign

    @field_validator("phone")
    @classmethod
    def validate_indian_phone(cls, v: str) -> str:
        digits = v.replace(" ", "").replace("-", "")
        if not digits.isdigit() or len(digits) != 10 or digits[0] not in "6789":
            raise ValueError("Must be a valid 10-digit Indian mobile number starting with 6-9.")
        return digits


# ── Queue read (returned to clients) ─────────────────────────────────────────

class QueueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id:                     int
    token:                  str
    customer_name:          str
    phone:                  str
    status:                 QueueStatus
    position:               Optional[int]
    estimated_wait_minutes: int
    total_price:            int
    total_duration:         int
    barber_locked:          bool
    called_at:              Optional[datetime]
    started_at:             Optional[datetime]
    completed_at:           Optional[datetime]
    created_at:             datetime
    updated_at:             datetime
    barber:                 Optional[BarberRead]
    services:               List[ServiceRead]


# ── Status update (receptionist / barber actions) ─────────────────────────────

class QueueStatusUpdate(BaseModel):
    status: QueueStatus


# ── Barber assignment ─────────────────────────────────────────────────────────

class QueueBarberAssign(BaseModel):
    barber_id: int


# ── Walk-in (receptionist adds customer directly) ────────────────────────────

class WalkInCreate(QueueCreate):
    """Same as QueueCreate; kept separate for clarity and future divergence."""
    pass


# ── Dashboard summary ─────────────────────────────────────────────────────────

class DashboardSummary(BaseModel):
    total_waiting:        int
    total_in_service:     int
    total_called:         int
    average_wait_minutes: int
    queue_open:           bool
