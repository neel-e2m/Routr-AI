from pydantic import BaseModel, Field
from typing import Any, Optional


class AnalyzeRequest(BaseModel):
    text: str
    subject: Optional[str] = None


class AnalysisResult(BaseModel):
    category: str
    priority: str
    department: str
    sentiment: str
    confidence: float = Field(ge=0, le=100)
    summary: str
    reasoning: str
    suggested_reply: str
    suggested_action: str
    estimated_resolution: str


class ImportTicketItem(BaseModel):
    subject: str
    body: str
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    company: Optional[str] = None


class ImportRequest(BaseModel):
    tickets: list[ImportTicketItem]


class TicketUpdateRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    department_id: Optional[str] = None
    is_read: Optional[bool] = None


class AnalyticsOverview(BaseModel):
    total_tickets: int = 0
    critical_tickets: int = 0
    open_tickets: int = 0
    resolved_tickets: int = 0
    ai_accuracy: float = 0
    avg_response_time_hours: float = 0
    category_breakdown: list[dict[str, Any]] = []
    priority_distribution: list[dict[str, Any]] = []
    department_workload: list[dict[str, Any]] = []
    weekly_trend: list[dict[str, Any]] = []
    sentiment_distribution: list[dict[str, Any]] = []
    recent_activities: list[dict[str, Any]] = []
    avg_resolution_time_hours: float = 0
    department_performance: list[dict[str, Any]] = []
    confidence_histogram: list[dict[str, Any]] = []
