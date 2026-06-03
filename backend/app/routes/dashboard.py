from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.issue import Issue
from app.models.scan import Scan
from app.security.jwt import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    scans = db.query(Scan).filter(Scan.user_id == current_user.id).all()
    total_scans = len(scans)
    avg_score = round(sum(s.score for s in scans) / total_scans, 1) if scans else 100.0

    risk_distribution = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    for s in scans:
        if s.risk_level in risk_distribution:
            risk_distribution[s.risk_level] += 1

    severity_rows = (
        db.query(Issue.severity, func.count(Issue.id))
        .join(Scan)
        .filter(Scan.user_id == current_user.id)
        .group_by(Issue.severity)
        .all()
    )
    severity_counts = {row[0]: row[1] for row in severity_rows}

    recent = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_scans": total_scans,
        "average_score": avg_score,
        "risk_distribution": risk_distribution,
        "severity_counts": severity_counts,
        "recent_scans": [
            {
                "id": s.id,
                "project_name": s.project_name,
                "scan_type": s.scan_type,
                "score": s.score,
                "risk_level": s.risk_level,
                "created_at": s.created_at.isoformat(),
            }
            for s in recent
        ],
    }
