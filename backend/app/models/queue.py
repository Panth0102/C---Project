"""SQLAlchemy ORM models for the queue domain.

Tables: barbers, services, queue_service (join), queues
"""

from __future__ import annotations

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, DateTime, Enum, ForeignKey, Integer, String, Text,
    Table, Column,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ── Queue status enum ─────────────────────────────────────────────────────────

class QueueStatus(str, enum.Enum):
    waiting    = "waiting"
    called     = "called"
    in_service = "in_service"
    completed  = "completed"
    cancelled  = "cancelled"
    no_show    = "no_show"


class BarberStatus(str, enum.Enum):
    available = "available"
    on_break  = "on_break"
    offline   = "offline"


# ── Association table: queue_entries ↔ services ───────────────────────────────

queue_service_table = Table(
    "queue_services",
    Base.metadata,
    Column("queue_id",   Integer, ForeignKey("queues.id",   ondelete="CASCADE"), primary_key=True),
    Column("service_id", Integer, ForeignKey("services.id", ondelete="CASCADE"), primary_key=True),
)


# ── Service ───────────────────────────────────────────────────────────────────

class Service(Base):
    __tablename__ = "services"

    id:          Mapped[int]  = mapped_column(Integer, primary_key=True, index=True)
    name:        Mapped[str]  = mapped_column(String(255), nullable=False)
    price:       Mapped[int]  = mapped_column(Integer, nullable=False)          # INR
    duration:    Mapped[int]  = mapped_column(Integer, nullable=False)          # minutes
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    icon:        Mapped[str | None] = mapped_column(String(10), nullable=True)
    is_active:   Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    queues: Mapped[list["Queue"]] = relationship(
        "Queue", secondary=queue_service_table, back_populates="services"
    )

    def __repr__(self) -> str:
        return f"<Service id={self.id} name={self.name!r}>"


# ── Barber ────────────────────────────────────────────────────────────────────

class Barber(Base):
    __tablename__ = "barbers"

    id:        Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name:      Mapped[str] = mapped_column(String(255), nullable=False)
    specialty: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status:    Mapped[BarberStatus] = mapped_column(
        Enum(BarberStatus), default=BarberStatus.available, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    queues: Mapped[list["Queue"]] = relationship("Queue", back_populates="barber")

    @property
    def initials(self) -> str:
        parts = self.name.split()
        return "".join(p[0].upper() for p in parts[:2])

    def __repr__(self) -> str:
        return f"<Barber id={self.id} name={self.name!r} status={self.status}>"


# ── Queue entry ───────────────────────────────────────────────────────────────

class Queue(Base):
    __tablename__ = "queues"

    id:            Mapped[int]  = mapped_column(Integer, primary_key=True, index=True)
    token:         Mapped[str]  = mapped_column(String(20), unique=True, nullable=False, index=True)
    customer_name: Mapped[str]  = mapped_column(String(255), nullable=False)
    phone:         Mapped[str]  = mapped_column(String(15),  nullable=False, index=True)
    status:        Mapped[QueueStatus] = mapped_column(
        Enum(QueueStatus), default=QueueStatus.waiting, nullable=False, index=True
    )
    barber_id:  Mapped[int | None] = mapped_column(
        Integer, ForeignKey("barbers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    # True means the customer explicitly picked this barber (must not be re-assigned)
    barber_locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    position:               Mapped[int | None] = mapped_column(Integer, nullable=True)
    estimated_wait_minutes: Mapped[int]        = mapped_column(Integer, default=0, nullable=False)

    called_at:    Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    started_at:   Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at:   Mapped[datetime]        = mapped_column(
        DateTime(timezone=True), default=_now, nullable=False
    )
    updated_at:   Mapped[datetime]        = mapped_column(
        DateTime(timezone=True), default=_now, onupdate=_now, nullable=False
    )

    barber:   Mapped[Barber | None]  = relationship("Barber", back_populates="queues")
    services: Mapped[list[Service]]  = relationship(
        "Service", secondary=queue_service_table, back_populates="queues"
    )

    @property
    def total_price(self) -> int:
        return sum(s.price for s in self.services)

    @property
    def total_duration(self) -> int:
        return sum(s.duration for s in self.services)

    def __repr__(self) -> str:
        return f"<Queue id={self.id} token={self.token!r} status={self.status}>"
