from app.database.supabase_client import get_admin_client


class RoutingService:
    def apply_routing(self, user_id: str, category: str, ai_department: str) -> tuple[str, str | None]:
        db = get_admin_client()
        rules = (
            db.table("routing_rules")
            .select("*, departments(name)")
            .eq("user_id", user_id)
            .eq("category", category)
            .eq("is_active", True)
            .order("priority_order")
            .limit(1)
            .execute()
        )
        if rules.data:
            dept = rules.data[0].get("departments", {})
            dept_name = dept.get("name", ai_department) if isinstance(dept, dict) else ai_department
            return dept_name, rules.data[0].get("department_id")
        return ai_department, None
