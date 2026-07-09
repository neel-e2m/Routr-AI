from fastapi import FastAPI, Request, Response

from app.core.config import settings
from app.routers import ai, tickets, simulator, analytics, export

app = FastAPI(title="Routr AI API", version="1.0.0")


def build_cors_headers(origin: str | None) -> dict[str, str]:
    allowed = settings.cors_origins_list
    if allowed == ["*"]:
        allowed_origin = origin or "*"
    elif origin in allowed:
        allowed_origin = origin
    else:
        return {}

    headers = {
        "Access-Control-Allow-Origin": allowed_origin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "authorization,content-type",
        "Access-Control-Max-Age": "600",
        "Vary": "Origin",
    }
    if allowed_origin != "*":
        headers["Access-Control-Allow-Credentials"] = "false"
    return headers


@app.middleware("http")
async def custom_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    if request.method == "OPTIONS":
        headers = build_cors_headers(origin)
        if not headers:
            return Response(status_code=403)
        return Response(status_code=204, headers=headers)

    response = await call_next(request)
    headers = build_cors_headers(origin)
    for key, value in headers.items():
        response.headers[key] = value
    return response


app.include_router(ai.router)
app.include_router(tickets.router)
app.include_router(simulator.router)
app.include_router(analytics.router)
app.include_router(export.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "routr-ai"}
