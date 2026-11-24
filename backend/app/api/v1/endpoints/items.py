"""Item endpoints — /api/v1/items."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate
from app.services import item_service

router = APIRouter(prefix="/items", tags=["Items"])


@router.get("/", response_model=List[ItemRead], summary="List all items")
def list_items(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
) -> List[ItemRead]:
    """Return a paginated list of all items."""
    return item_service.list_items(db, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=ItemRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create an item",
)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)) -> ItemRead:
    """Create and persist a new item."""
    return item_service.create_item(db, payload)


@router.get("/{item_id}", response_model=ItemRead, summary="Get a single item")
def get_item(item_id: int, db: Session = Depends(get_db)) -> ItemRead:
    """Return a single item by ID, or 404 if not found."""
    return item_service.get_item_or_404(db, item_id)


@router.put("/{item_id}", response_model=ItemRead, summary="Update an item")
def update_item(
    item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)
) -> ItemRead:
    """Partially or fully update an existing item."""
    return item_service.update_item(db, item_id, payload)


@router.delete(
    "/{item_id}",
    response_model=ItemRead,
    summary="Delete an item",
)
def delete_item(item_id: int, db: Session = Depends(get_db)) -> ItemRead:
    """Delete an item by ID and return the deleted record."""
    return item_service.delete_item(db, item_id)
