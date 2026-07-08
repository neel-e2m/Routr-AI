from fastapi import APIRouter, Depends, BackgroundTasks

from app.middleware.auth import get_current_user
from app.schemas.models import AnalyzeRequest, AnalysisResult
from app.services.groq_service import GroqService
from app.services.ticket_service import TicketService
from app.database.supabase_client import get_admin_client

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/analyze", response_model=AnalysisResult)
async def analyze_text(req: AnalyzeRequest, user: dict = Depends(get_current_user)):
    db = get_admin_client()
    settings = db.table("settings").select("groq_api_key, ai_model").eq("user_id", user["id"]).limit(1).execute()
    key, model = None, None
    if settings.data:
        key = settings.data[0].get("groq_api_key")
        model = settings.data[0].get("ai_model")
    groq = GroqService(api_key=key, model=model)
    return await groq.analyze(req.text, req.subject)


@router.post("/analyze-ticket/{ticket_id}", response_model=AnalysisResult)
async def analyze_ticket(ticket_id: str, user: dict = Depends(get_current_user)):
    db = get_admin_client()
    ticket = db.table("tickets").select("*").eq("id", ticket_id).eq("user_id", user["id"]).single().execute()
    if not ticket.data:
        from fastapi import HTTPException
        raise HTTPException(404, "Ticket not found")
    svc = TicketService()
    return await svc.analyze_and_save(user["id"], ticket_id, ticket.data["body"], ticket.data.get("subject"))
