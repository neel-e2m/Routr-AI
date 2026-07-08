import httpx
from groq import Groq

from app.ai.prompts import TRIAGE_SYSTEM_PROMPT
from app.core.config import settings
from app.schemas.models import AnalysisResult
from app.utils.json_parser import extract_json


class GroqService:
    def __init__(self, api_key: str | None = None, model: str | None = None):
        key = api_key or settings.groq_api_key
        self.model = model or settings.groq_model
        self.client = Groq(api_key=key) if key else None

    async def analyze(self, text: str, subject: str | None = None) -> AnalysisResult:
        if not self.client:
            raise ValueError("Groq API key not configured")

        user_content = text
        if subject:
            user_content = f"Subject: {subject}\n\n{text}"

        for attempt in range(2):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": TRIAGE_SYSTEM_PROMPT},
                        {"role": "user", "content": user_content},
                    ],
                    temperature=0.2,
                    max_tokens=1500,
                )
                raw = response.choices[0].message.content or "{}"
                data = extract_json(raw)
                return AnalysisResult(
                    category=data.get("category", "Other"),
                    priority=data.get("priority", "Medium"),
                    department=data.get("department", "Support"),
                    sentiment=data.get("sentiment", "Neutral"),
                    confidence=float(data.get("confidence", 75)),
                    summary=data.get("summary", ""),
                    reasoning=data.get("reasoning", ""),
                    suggested_reply=data.get("suggested_reply", ""),
                    suggested_action=data.get("suggested_action", ""),
                    estimated_resolution=data.get("estimated_resolution", "1-2 business days"),
                )
            except Exception:
                if attempt == 1:
                    raise
        raise ValueError("Analysis failed")
