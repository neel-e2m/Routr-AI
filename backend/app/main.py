from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import ai, tickets, simulator, analytics, export

app = FastAPI(title="Routr AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)
app.include_router(tickets.router)
app.include_router(simulator.router)
app.include_router(analytics.router)
app.include_router(export.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "routr-ai"}
