from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class CodeScanRequest(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    language: str = Field(default="javascript", max_length=50)
    code: str = Field(..., min_length=1)


class ApiScanRequest(BaseModel):
    project_name: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., min_length=1)
    scan_depth: str = Field(default="standard", pattern="^(quick|standard|deep)$")


class IssueResponse(BaseModel):
    id: int
    title: str
    severity: str
    category: str
    owasp_category: str | None
    description: str
    risk_explanation: str
    evidence: str | None
    affected_source: str | None
    line_number: int | None
    recommendation: str
    secure_example: str | None
    developer_friendly_summary: str | None = None
    ai_enhanced: bool = False
    ai_provider: str | None = None

    model_config = {"from_attributes": True}


class ScanResponse(BaseModel):
    id: int
    project_name: str
    scan_type: str
    language: str | None
    target_url: str | None
    score: float
    risk_level: str
    created_at: datetime
    issues: list[IssueResponse] = []

    model_config = {"from_attributes": True}


class ScanSummaryResponse(BaseModel):
    id: int
    project_name: str
    scan_type: str
    language: str | None
    target_url: str | None
    score: float
    risk_level: str
    created_at: datetime
    issue_count: int = 0

    model_config = {"from_attributes": True}
