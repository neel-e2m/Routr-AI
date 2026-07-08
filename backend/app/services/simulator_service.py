import random
import httpx
from faker import Faker

from app.services.ticket_service import TicketService

fake = Faker()

SUBJECTS = [
    ("Website is down", "Critical", "Website Issue"),
    ("Cannot login to dashboard", "High", "Login Problem"),
    ("Invoice discrepancy", "High", "Billing"),
    ("Payment failed", "Critical", "Payment"),
    ("Need new landing page design", "Medium", "Design Request"),
    ("SEO rankings dropped", "Medium", "SEO"),
    ("Marketing campaign issue", "Low", "Marketing"),
    ("API returning 500 errors", "Critical", "API Issue"),
    ("Feature request: dark mode", "Low", "Feature Request"),
    ("Suspicious login attempt", "Critical", "Security"),
    ("General question about pricing", "Low", "General Inquiry"),
    ("Bug in checkout flow", "High", "Bug Report"),
]

BODIES = [
    "Hi, our main website has been unreachable for the past 30 minutes. This is affecting all our customers. Please help urgently!",
    "I've tried resetting my password three times but I still can't access my account. Getting error code AUTH-401.",
    "Our last invoice shows charges for features we didn't use. Can someone from billing review this?",
    "My credit card was charged twice for the same subscription. I need an immediate refund.",
    "We need a refreshed hero section and updated brand colors for our Q3 campaign launch.",
    "Our organic traffic dropped 40% after the latest update. Need SEO team to investigate.",
    "The email campaign sent to 10k users had broken links. Marketing needs to fix this ASAP.",
    "POST /api/v2/orders returns 500 Internal Server Error consistently since yesterday.",
    "Would love to see a dark mode option in the dashboard. Many users have requested this.",
    "I received an alert about a login from an unknown IP address in another country.",
    "Could you provide more details about your enterprise pricing tiers?",
    "When I add items to cart and proceed to checkout, the page freezes on the payment step.",
]


class SimulatorService:
    def __init__(self):
        self.ticket_service = TicketService()

    async def _fetch_random_users(self, count: int) -> list[dict]:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                res = await client.get(f"https://randomuser.me/api/?results={min(count, 30)}")
                data = res.json()
                return data.get("results", [])
        except Exception:
            return []

    async def generate(self, user_id: str, count: int = 50) -> list[dict]:
        users = await self._fetch_random_users(count)
        created = []

        for i in range(count):
            subj_tpl = SUBJECTS[i % len(SUBJECTS)]
            body = BODIES[i % len(BODIES)]

            if i < len(users):
                u = users[i]
                name = f"{u['name']['first']} {u['name']['last']}"
                email = u["email"]
                company = fake.company()
            else:
                name = fake.name()
                email = fake.company_email()
                company = fake.company()

            ticket = self.ticket_service.create_ticket(
                user_id=user_id,
                subject=subj_tpl[0],
                body=body,
                client_name=name,
                client_email=email,
                company=company,
                source="simulator",
            )
            created.append(ticket)

        return created
