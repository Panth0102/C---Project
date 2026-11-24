# Re-export all models so Alembic's env.py can detect schema changes.
from app.models.item  import Item    # noqa: F401
from app.models.queue import (       # noqa: F401
    Barber, Queue, QueueStatus, BarberStatus, Service, queue_service_table
)
