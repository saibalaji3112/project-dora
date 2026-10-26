"""Compatibility entry point for hosts configured with ``uvicorn main:app``."""

from services.main import app

__all__ = ["app"]
