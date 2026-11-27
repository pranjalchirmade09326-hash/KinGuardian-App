"""API v1 router aggregation."""

from fastapi import APIRouter

from src.routes.ai import ai_router
from src.routes.alerts import alerts_router
from src.routes.care import care_router
from src.routes.contacts import contacts_router
from src.routes.users import users_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(users_router, prefix="/users")
api_v1_router.include_router(contacts_router, prefix="/contacts")
api_v1_router.include_router(alerts_router, prefix="/alerts")
api_v1_router.include_router(ai_router, prefix="/ai")
api_v1_router.include_router(care_router)
