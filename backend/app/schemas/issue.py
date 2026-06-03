from pydantic import BaseModel


class IssueCreate(BaseModel):
    title: str
    severity: str
    category: str
    owasp_category: str | None = None
    description: str
    risk_explanation: str
    evidence: str | None = None
    affected_source: str | None = None
    line_number: int | None = None
    recommendation: str
    secure_example: str | None = None
    developer_friendly_summary: str | None = None
    ai_enhanced: bool = False
    ai_provider: str | None = None
    ai_error: str | None = None
