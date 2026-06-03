from sqlalchemy.orm import Session

from app.models.issue import Issue
from app.models.scan import Scan
from app.models.user import User
from app.schemas.issue import IssueCreate
from app.services.ai_service import enrich_findings
from app.services.scoring_service import calculate_score, risk_level_from_score


async def process_and_persist_scan(
    db: Session,
    user: User,
    *,
    project_name: str,
    scan_type: str,
    language: str | None,
    target_url: str | None,
    issues: list[IssueCreate],
    code_snippet: str | None = None,
) -> Scan:
    """Rule scan → optional AI enhancement (top N) → score → persist."""
    if issues:
        issues = await enrich_findings(issues, code_snippet=code_snippet)
    return persist_scan(
        db,
        user,
        project_name=project_name,
        scan_type=scan_type,
        language=language,
        target_url=target_url,
        issues=issues,
    )


def persist_scan(
    db: Session,
    user: User,
    *,
    project_name: str,
    scan_type: str,
    language: str | None,
    target_url: str | None,
    issues: list[IssueCreate],
) -> Scan:
    severities = [i.severity for i in issues]
    score = calculate_score(severities)
    risk = risk_level_from_score(score)

    scan = Scan(
        user_id=user.id,
        project_name=project_name,
        scan_type=scan_type,
        language=language,
        target_url=target_url,
        score=score,
        risk_level=risk,
    )
    db.add(scan)
    db.flush()

    for item in issues:
        db.add(
            Issue(
                scan_id=scan.id,
                title=item.title,
                severity=item.severity,
                category=item.category,
                owasp_category=item.owasp_category,
                description=item.description,
                risk_explanation=item.risk_explanation,
                evidence=item.evidence,
                affected_source=item.affected_source,
                line_number=item.line_number,
                recommendation=item.recommendation,
                secure_example=item.secure_example,
                developer_friendly_summary=item.developer_friendly_summary,
                ai_enhanced=item.ai_enhanced,
                ai_provider=item.ai_provider,
            )
        )

    db.commit()
    db.refresh(scan)
    return scan
