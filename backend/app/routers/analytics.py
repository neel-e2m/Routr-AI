from fastapi import APIRouter, Depends

from app.middleware.auth import get_current_user
from app.schemas.models import AnalyticsOverview
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(user: dict = Depends(get_current_user)):
    svc = AnalyticsService()
    return svc.get_overview(user["id"])
