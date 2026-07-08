from datetime import datetime, timedelta, timezone
from collections import Counter

from app.database.supabase_client import get_admin_client


class AnalyticsService:
    def __init__(self):
        self.db = get_admin_client()

    def get_overview(self, user_id: str) -> dict:
        tickets = self.db.table("tickets").select("*").eq("user_id", user_id).execute().data or []
        analyses = (
            self.db.table("ticket_analysis")
            .select("*, tickets!inner(user_id)")
            .eq("tickets.user_id", user_id)
            .execute()
        ).data or []
        activities = (
            self.db.table("activities")
            .select("*, tickets(subject)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        ).data or []
        departments = self.db.table("departments").select("*").eq("user_id", user_id).execute().data or []
        dept_map = {d["id"]: d["name"] for d in departments}

        total = len(tickets)
        critical = sum(1 for t in tickets if t.get("priority") == "Critical")
        open_t = sum(1 for t in tickets if t.get("status") in ("open", "in_progress"))
        resolved = sum(1 for t in tickets if t.get("status") in ("resolved", "closed"))

        confidences = [a.get("confidence", 0) for a in analyses if a.get("confidence")]
        ai_accuracy = sum(confidences) / len(confidences) if confidences else 0

        resolution_times = []
        for t in tickets:
            if t.get("resolved_at") and t.get("created_at"):
                try:
                    created = datetime.fromisoformat(t["created_at"].replace("Z", "+00:00"))
                    resolved_at = datetime.fromisoformat(t["resolved_at"].replace("Z", "+00:00"))
                    resolution_times.append((resolved_at - created).total_seconds() / 3600)
                except Exception:
                    pass
        avg_resolution = sum(resolution_times) / len(resolution_times) if resolution_times else 0
        avg_response = avg_resolution * 0.3 if avg_resolution else 0

        cat_counter = Counter(t.get("category") or "Other" for t in tickets)
        pri_counter = Counter(t.get("priority") or "Medium" for t in tickets)
        sent_counter = Counter(t.get("sentiment") or "Neutral" for t in tickets)
        dept_counter = Counter(dept_map.get(t.get("department_id"), "Unassigned") for t in tickets)

        now = datetime.now(timezone.utc)
        weekly = []
        for i in range(6, -1, -1):
            day = now - timedelta(days=i)
            day_str = day.strftime("%a")
            count = sum(
                1 for t in tickets
                if t.get("created_at") and day.strftime("%Y-%m-%d") in t["created_at"][:10]
            )
            weekly.append({"day": day_str, "count": count})

        dept_perf = []
        for dept in departments:
            dept_tickets = [t for t in tickets if t.get("department_id") == dept["id"]]
            resolved_count = sum(1 for t in dept_tickets if t.get("status") in ("resolved", "closed"))
            dept_perf.append({
                "department": dept["name"],
                "total": len(dept_tickets),
                "resolved": resolved_count,
                "rate": round(resolved_count / len(dept_tickets) * 100, 1) if dept_tickets else 0,
            })

        conf_buckets = {"0-50": 0, "51-70": 0, "71-85": 0, "86-100": 0}
        for c in confidences:
            if c <= 50: conf_buckets["0-50"] += 1
            elif c <= 70: conf_buckets["51-70"] += 1
            elif c <= 85: conf_buckets["71-85"] += 1
            else: conf_buckets["86-100"] += 1

        return {
            "total_tickets": total,
            "critical_tickets": critical,
            "open_tickets": open_t,
            "resolved_tickets": resolved,
            "ai_accuracy": round(ai_accuracy, 1),
            "avg_response_time_hours": round(avg_response, 1),
            "avg_resolution_time_hours": round(avg_resolution, 1),
            "category_breakdown": [{"name": k, "value": v} for k, v in cat_counter.most_common()],
            "priority_distribution": [{"name": k, "value": v} for k, v in pri_counter.most_common()],
            "department_workload": [{"name": k, "value": v} for k, v in dept_counter.most_common()],
            "weekly_trend": weekly,
            "sentiment_distribution": [{"name": k, "value": v} for k, v in sent_counter.most_common()],
            "department_performance": dept_perf,
            "confidence_histogram": [{"range": k, "count": v} for k, v in conf_buckets.items()],
            "recent_activities": [
                {
                    "id": a["id"],
                    "action_type": a["action_type"],
                    "description": a["description"],
                    "created_at": a["created_at"],
                    "ticket_subject": (a.get("tickets") or {}).get("subject", ""),
                }
                for a in activities
            ],
        }
