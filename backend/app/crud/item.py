"""CRUD operations for the Item model."""

from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


class CRUDItem:
    """Encapsulates all database operations for Items."""

    # ── Read ─────────────────────────────────────────────────────────────────

    def get(self, db: Session, item_id: int) -> Optional[Item]:
        """Return a single item by primary key, or None if not found."""
        return db.get(Item, item_id)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Item]:
        """Return a paginated list of items."""
        return db.query(Item).offset(skip).limit(limit).all()

    # ── Create ───────────────────────────────────────────────────────────────

    def create(self, db: Session, payload: ItemCreate) -> Item:
        """Persist a new item and return the created record."""
        db_item = Item(**payload.model_dump())
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    # ── Update ───────────────────────────────────────────────────────────────

    def update(self, db: Session, db_item: Item, payload: ItemUpdate) -> Item:
        """Apply a partial update to an existing item."""
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
        return db_item

    # ── Delete ───────────────────────────────────────────────────────────────

    def remove(self, db: Session, item_id: int) -> Optional[Item]:
        """Delete an item by ID and return the deleted record, or None if missing."""
        db_item = self.get(db, item_id)
        if db_item:
            db.delete(db_item)
            db.commit()
        return db_item


# Single shared instance used throughout the application.
item = CRUDItem()
