from app.database.supabase_client import get_admin_client


class ActivityService:
    def log(
        self,
        user_id: str,
        ticket_id: str,
        action_type: str,
        description: str,
        metadata: dict | None = None,
    ):
        db = get_admin_client()
        db.table("activities").insert({
            "user_id": user_id,
            "ticket_id": ticket_id,
            "action_type": action_type,
            "description": description,
            "metadata": metadata or {},
        }).execute()
