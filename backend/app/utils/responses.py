"""Standardised JSON response helpers."""

from __future__ import annotations

from typing import Any, Optional


def success_response(data: Any, message: str = "Success") -> dict:
    return {"success": True, "message": message, "data": data}


def error_response(message: str, detail: Optional[Any] = None) -> dict:
    return {"success": False, "message": message, "detail": detail}
