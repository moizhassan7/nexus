from app.rules.api_rules import ApiFinding, scan_api_target
from app.schemas.issue import IssueCreate


async def scan_api(url: str, scan_depth: str = "standard") -> list[IssueCreate]:
    findings: list[ApiFinding] = await scan_api_target(url, scan_depth)
    return [_to_issue(f) for f in findings]


def _to_issue(f: ApiFinding) -> IssueCreate:
    return IssueCreate(
        title=f.title,
        severity=f.severity,
        category=f.category,
        owasp_category=f.owasp_category,
        description=f.description,
        risk_explanation=f.risk_explanation,
        evidence=f.evidence,
        affected_source=None,
        line_number=None,
        recommendation=f.recommendation,
        secure_example=f.secure_example,
    )
