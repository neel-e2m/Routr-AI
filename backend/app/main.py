from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ai, tickets, simulator, analytics, export

app = FastAPI(title="Routr AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
    allow_credentials=False,
    expose_headers=["*"],
)

@app.options("/{full_path:path}", include_in_schema=False)
async def preflight(full_path: str):
    return Response(status_code=204)

app.include_router(ai.router)
app.include_router(tickets.router)
app.include_router(simulator.router)
app.include_router(analytics.router)
app.include_router(export.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "routr-ai"}
