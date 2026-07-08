from fastapi import APIRouter, Depends, BackgroundTasks

from app.middleware.auth import get_current_user
from app.services.simulator_service import SimulatorService
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/api/simulator", tags=["simulator"])


async def _analyze_all(user_id: str, ticket_ids: list[str], tickets: list[dict]):
    svc = TicketService()
    for tid, t in zip(ticket_ids, tickets):
        try:
            await svc.analyze_and_save(user_id, tid, t["body"], t.get("subject"))
        except Exception:
            pass


@router.post("/generate")
async def generate_demo(
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
    count: int = 50,
):
    svc = SimulatorService()
    tickets = await svc.generate(user["id"], count)
    ids = [t["id"] for t in tickets]
    background_tasks.add_task(_analyze_all, user["id"], ids, tickets)
    return {"generated": len(tickets), "message": f"Generated {len(tickets)} demo tickets. AI analysis running in background."}
