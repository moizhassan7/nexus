from pydantic import BaseModel
from typing import Optional


class AnalyzeSpecRequest(BaseModel):
    spec_url: Optional[str] = None
    base_url: Optional[str] = None


class Vulnerability(BaseModel):
    rule_id: str
    rule_name: str
    endpoint: str
    severity: str
    description: str
    fix: str


class AnalysisResult(BaseModel):
    analysis_id: str
    spec_title: str
    total_endpoints: int
    total_vulnerabilities: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    vulnerabilities: list[Vulnerability]
