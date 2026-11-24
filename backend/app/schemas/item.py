"""Pydantic schemas for the Item resource."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ItemBase(BaseModel):
    """Fields shared between create and update schemas."""

    title: str = Field(..., min_length=1, max_length=255, examples=["My first item"])
    description: Optional[str] = Field(None, max_length=5000, examples=["A short description"])
    is_active: bool = Field(True)


class ItemCreate(ItemBase):
    """Schema for creating a new item (request body)."""
    pass


class ItemUpdate(BaseModel):
    """Schema for updating an existing item — all fields optional."""

    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=5000)
    is_active: Optional[bool] = None


class ItemRead(ItemBase):
    """Schema returned to API clients — includes server-generated fields."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
