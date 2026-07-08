from fastapi import APIRouter, Depends, BackgroundTasks

from app.middleware.auth import get_current_user
from app.schemas.models import ImportRequest
from app.services.ticket_service import TicketService

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


async def _analyze_batch(user_id: str, items: list[tuple[str, str, str | None]]):
    svc = TicketService()
    for ticket_id, body, subject in items:
        try:
            await svc.analyze_and_save(user_id, ticket_id, body, subject)
        except Exception:
            pass


@router.post("/import")
async def import_tickets(
    req: ImportRequest,
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user),
):
    svc = TicketService()
    created = []
    to_analyze = []
    for item in req.tickets:
        ticket = svc.create_ticket(
            user_id=user["id"],
            subject=item.subject,
            body=item.body,
            client_name=item.client_name or "Imported Client",
            client_email=item.client_email or "imported@example.com",
            company=item.company or "Unknown",
            source="import",
        )
        created.append(ticket)
        to_analyze.append((ticket["id"], item.body, item.subject))

    background_tasks.add_task(_analyze_batch, user["id"], to_analyze)
    return {"imported": len(created), "tickets": created}
