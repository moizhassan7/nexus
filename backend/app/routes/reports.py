from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.scan import Scan
from app.security.jwt import get_current_user
from app.services.pdf_service import generate_scan_pdf

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/{scan_id}/pdf")
def download_pdf(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    scan = (
        db.query(Scan)
        .options(joinedload(Scan.issues))
        .filter(Scan.id == scan_id, Scan.user_id == current_user.id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    pdf_bytes = generate_scan_pdf(scan)
    filename = f"vulnlens-report-{scan.project_name.replace(' ', '-')}-{scan.id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
