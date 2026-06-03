from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.scan import Scan
from app.schemas.scan import ApiScanRequest, CodeScanRequest, ScanResponse, ScanSummaryResponse
from app.security.jwt import get_current_user
from app.services.api_scanner import scan_api
from app.services.code_scanner import scan_code
from app.services.scanner_service import process_and_persist_scan

router = APIRouter(prefix="/api/scans", tags=["scans"])


@router.post("/code", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def scan_code_endpoint(
    body: CodeScanRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    issues = scan_code(body.code, body.language)
    scan = await process_and_persist_scan(
        db,
        current_user,
        project_name=body.project_name,
        scan_type="code",
        language=body.language,
        target_url=None,
        issues=issues,
        code_snippet=body.code,
    )
    return _load_scan(db, scan.id, current_user.id)


@router.post("/api", response_model=ScanResponse, status_code=status.HTTP_201_CREATED)
async def scan_api_endpoint(
    body: ApiScanRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    issues = await scan_api(body.url, body.scan_depth)
    scan = await process_and_persist_scan(
        db,
        current_user,
        project_name=body.project_name,
        scan_type="api",
        language=None,
        target_url=body.url,
        issues=issues,
        code_snippet=None,
    )
    return _load_scan(db, scan.id, current_user.id)


@router.get("", response_model=list[ScanSummaryResponse])
def list_scans(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    scans = (
        db.query(Scan)
        .options(joinedload(Scan.issues))
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .all()
    )
    result = []
    for s in scans:
        summary = ScanSummaryResponse.model_validate(s)
        summary.issue_count = len(s.issues)
        result.append(summary)
    return result


@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return _load_scan(db, scan_id, current_user.id)


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    db.delete(scan)
    db.commit()


def _load_scan(db: Session, scan_id: int, user_id: int) -> ScanResponse:
    scan = (
        db.query(Scan)
        .options(joinedload(Scan.issues))
        .filter(Scan.id == scan_id, Scan.user_id == user_id)
        .first()
    )
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return ScanResponse.model_validate(scan)
