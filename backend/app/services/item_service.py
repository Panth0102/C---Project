"""Business-logic layer for items.

For this starter project the service simply delegates to CRUD.
Add validation, event publishing, or cross-entity logic here as the app grows.
"""

from __future__ import annotations

from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.crud.item import item as item_crud
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


def get_item_or_404(db: Session, item_id: int) -> Item:
    """Return the item or raise HTTP 404."""
    db_item = item_crud.get(db, item_id)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with id={item_id} not found.",
        )
    return db_item


def list_items(db: Session, skip: int = 0, limit: int = 100) -> List[Item]:
    return item_crud.get_all(db, skip=skip, limit=limit)


def create_item(db: Session, payload: ItemCreate) -> Item:
    return item_crud.create(db, payload)


def update_item(db: Session, item_id: int, payload: ItemUpdate) -> Item:
    db_item = get_item_or_404(db, item_id)
    return item_crud.update(db, db_item, payload)


def delete_item(db: Session, item_id: int) -> Item:
    db_item = get_item_or_404(db, item_id)
    return item_crud.remove(db, item_id)  # type: ignore[return-value]
