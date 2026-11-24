"""Aggregates all v1 endpoint routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import items, queue

api_router = APIRouter()
api_router.include_router(items.router)
api_router.include_router(queue.router)
