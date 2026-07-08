from datetime import datetime, timezone

from app.database.supabase_client import get_admin_client
from app.schemas.models import AnalysisResult
from app.services.activity_service import ActivityService
from app.services.groq_service import GroqService
from app.services.routing_service import RoutingService


class TicketService:
    def __init__(self):
        self.db = get_admin_client()
        self.routing = RoutingService()
        self.activity = ActivityService()

    def _get_user_groq_key(self, user_id: str) -> tuple[str | None, str | None]:
        res = self.db.table("settings").select("groq_api_key, ai_model").eq("user_id", user_id).limit(1).execute()
        if res.data and res.data[0].get("groq_api_key"):
            return res.data[0]["groq_api_key"], res.data[0].get("ai_model")
        return None, None

    def _resolve_department_id(self, user_id: str, department_name: str) -> str | None:
        res = (
            self.db.table("departments")
            .select("id")
            .eq("user_id", user_id)
            .ilike("name", department_name)
            .limit(1)
            .execute()
        )
        return res.data[0]["id"] if res.data else None

    async def analyze_and_save(self, user_id: str, ticket_id: str, text: str, subject: str | None = None) -> AnalysisResult:
        key, model = self._get_user_groq_key(user_id)
        groq = GroqService(api_key=key, model=model)
        analysis = await groq.analyze(text, subject)

        dept_name, rule_dept_id = self.routing.apply_routing(user_id, analysis.category, analysis.department)
        dept_id = rule_dept_id or self._resolve_department_id(user_id, dept_name)

        self.db.table("ticket_analysis").insert({
            "ticket_id": ticket_id,
            "category": analysis.category,
            "priority": analysis.priority,
            "department": dept_name,
            "sentiment": analysis.sentiment,
            "confidence": analysis.confidence,
            "summary": analysis.summary,
            "reasoning": analysis.reasoning,
            "suggested_reply": analysis.suggested_reply,
            "suggested_action": analysis.suggested_action,
            "estimated_resolution": analysis.estimated_resolution,
            "model_used": groq.model,
            "raw_response": analysis.model_dump(),
        }).execute()

        update_data = {
            "category": analysis.category,
            "priority": analysis.priority,
            "sentiment": analysis.sentiment,
            "is_ai_analyzed": True,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        if dept_id:
            update_data["department_id"] = dept_id

        self.db.table("tickets").update(update_data).eq("id", ticket_id).eq("user_id", user_id).execute()

        self.activity.log(
            user_id, ticket_id, "ai_analyzed",
            f"AI analyzed ticket: {analysis.category} / {analysis.priority}",
            {"department": dept_name, "confidence": analysis.confidence},
        )
        return analysis

    def create_ticket(
        self, user_id: str, subject: str, body: str,
        client_name: str = "Unknown", client_email: str = "unknown@example.com",
        company: str = "Unknown", source: str = "manual",
    ) -> dict:
        res = self.db.table("tickets").insert({
            "user_id": user_id,
            "subject": subject,
            "body": body,
            "client_name": client_name,
            "client_email": client_email,
            "company": company,
            "source": source,
            "status": "open",
            "is_read": False,
            "is_ai_analyzed": False,
        }).execute()
        ticket = res.data[0]
        self.activity.log(user_id, ticket["id"], "created", f"Ticket created: {subject}")
        return ticket
