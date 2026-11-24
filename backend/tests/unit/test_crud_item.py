"""Unit tests for CRUD operations (direct DB layer, no HTTP)."""

import pytest
from sqlalchemy.orm import Session

from app.crud.item import item as item_crud
from app.schemas.item import ItemCreate, ItemUpdate


@pytest.mark.unit
def test_create_item(db: Session):
    payload = ItemCreate(title="Test Item", description="A description", is_active=True)
    created = item_crud.create(db, payload)

    assert created.id is not None
    assert created.title == "Test Item"
    assert created.description == "A description"
    assert created.is_active is True


@pytest.mark.unit
def test_get_item(db: Session):
    payload = ItemCreate(title="Fetch Me")
    created = item_crud.create(db, payload)
    fetched = item_crud.get(db, created.id)

    assert fetched is not None
    assert fetched.id == created.id
    assert fetched.title == "Fetch Me"


@pytest.mark.unit
def test_get_nonexistent_item_returns_none(db: Session):
    result = item_crud.get(db, item_id=999999)
    assert result is None


@pytest.mark.unit
def test_get_all_items(db: Session):
    item_crud.create(db, ItemCreate(title="Item A"))
    item_crud.create(db, ItemCreate(title="Item B"))
    items = item_crud.get_all(db)

    assert len(items) >= 2


@pytest.mark.unit
def test_update_item(db: Session):
    created = item_crud.create(db, ItemCreate(title="Old Title"))
    updated = item_crud.update(db, created, ItemUpdate(title="New Title"))

    assert updated.title == "New Title"
    assert updated.id == created.id


@pytest.mark.unit
def test_update_item_partial(db: Session):
    created = item_crud.create(db, ItemCreate(title="Partial", description="Original"))
    updated = item_crud.update(db, created, ItemUpdate(is_active=False))

    # Only is_active changed; title and description preserved.
    assert updated.is_active is False
    assert updated.title == "Partial"
    assert updated.description == "Original"


@pytest.mark.unit
def test_remove_item(db: Session):
    created = item_crud.create(db, ItemCreate(title="Delete Me"))
    removed = item_crud.remove(db, created.id)

    assert removed is not None
    assert removed.id == created.id
    assert item_crud.get(db, created.id) is None


@pytest.mark.unit
def test_remove_nonexistent_item_returns_none(db: Session):
    result = item_crud.remove(db, item_id=999999)
    assert result is None
