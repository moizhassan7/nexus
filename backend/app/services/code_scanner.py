from app.rules.code_rules import RuleFinding, run_all_code_rules
from app.schemas.issue import IssueCreate


def scan_code(code: str, language: str = "javascript") -> list[IssueCreate]:
    findings: list[RuleFinding] = run_all_code_rules(code, language)
    return [_to_issue(f) for f in findings]


def _to_issue(f: RuleFinding) -> IssueCreate:
    return IssueCreate(
        title=f.title,
        severity=f.severity,
        category=f.category,
        owasp_category=f.owasp_category,
        description=f.description,
        risk_explanation=f.risk_explanation,
        evidence=f.evidence,
        affected_source=f.affected_source,
        line_number=f.line_number,
        recommendation=f.recommendation,
        secure_example=f.secure_example,
    )
