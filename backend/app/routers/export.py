import csv
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, Response
from fpdf import FPDF

from app.middleware.auth import get_current_user
from app.database.supabase_client import get_admin_client

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/tickets/csv")
async def export_csv(user: dict = Depends(get_current_user)):
    db = get_admin_client()
    tickets = db.table("tickets").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute().data or []

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        "id", "client_name", "client_email", "company", "subject", "status",
        "category", "priority", "sentiment", "created_at",
    ])
    writer.writeheader()
    for t in tickets:
        writer.writerow({k: t.get(k, "") for k in writer.fieldnames})

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=routr-tickets.csv"},
    )


@router.get("/ticket/{ticket_id}/pdf")
async def export_pdf(ticket_id: str, user: dict = Depends(get_current_user)):
    db = get_admin_client()
    ticket = db.table("tickets").select("*").eq("id", ticket_id).eq("user_id", user["id"]).single().execute()
    if not ticket.data:
        raise HTTPException(404, "Ticket not found")

    analysis = (
        db.table("ticket_analysis")
        .select("*")
        .eq("ticket_id", ticket_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    a = analysis.data[0] if analysis.data else {}
    t = ticket.data

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "Routr AI - Ticket Report", ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.ln(5)
    pdf.cell(0, 8, f"Subject: {t.get('subject', '')}", ln=True)
    pdf.cell(0, 8, f"Client: {t.get('client_name', '')} ({t.get('client_email', '')})", ln=True)
    pdf.cell(0, 8, f"Company: {t.get('company', '')}", ln=True)
    pdf.cell(0, 8, f"Status: {t.get('status', '')} | Priority: {t.get('priority', 'N/A')}", ln=True)
    pdf.ln(5)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Original Message", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(0, 6, t.get("body", "")[:500])
    if a:
        pdf.ln(5)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "AI Analysis", ln=True)
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 6, f"Category: {a.get('category', '')} | Sentiment: {a.get('sentiment', '')}", ln=True)
        pdf.cell(0, 6, f"Confidence: {a.get('confidence', '')}%", ln=True)
        pdf.multi_cell(0, 6, f"Summary: {a.get('summary', '')}")
        pdf.multi_cell(0, 6, f"Suggested Reply: {a.get('suggested_reply', '')}")

    pdf_bytes = pdf.output()
    return Response(
        content=bytes(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ticket-{ticket_id[:8]}.pdf"},
    )
