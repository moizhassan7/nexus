"""Groq AI enrichment for security findings — defensive prompts only."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from copy import deepcopy

from app.config import get_settings
from app.schemas.issue import IssueCreate

logger = logging.getLogger(__name__)

SEVERITY_RANK = {
    "Critical": 0,
    "High": 1,
    "Medium": 2,
    "Low": 3,
    "Info": 4,
}

SYSTEM_PROMPT = (
    "You are a defensive application security assistant for developers. "
    "Explain vulnerabilities and recommend secure fixes only. "
    "NEVER provide exploit code, attack payloads, malware, or instructions to compromise systems. "
    "Respond with a single JSON object only (no markdown fences)."
)

USER_PROMPT_TEMPLATE = """Analyze this security finding and return JSON with exactly these keys:
- description (string)
- risk_explanation (string)
- recommendation (string)
- secure_example (string or null)
- developer_friendly_summary (string, plain language for developers)

Finding:
- title: {title}
- severity: {severity}
- category: {category}
- owasp_category: {owasp}
- current_description: {description}
- current_risk: {risk_explanation}
- evidence: {evidence}
{code_block}"""


def _severity_sort_key(issue: IssueCreate) -> tuple[int, str]:
    return (SEVERITY_RANK.get(issue.severity, 99), issue.title)


def _parse_json_response(text: str) -> dict | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        data = json.loads(text)
        return data if isinstance(data, dict) else None
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                data = json.loads(match.group())
                return data if isinstance(data, dict) else None
            except json.JSONDecodeError:
                return None
    return None


def _safe_str(value: object, max_len: int = 4000) -> str:
    if value is None:
        return ""
    s = str(value)
    return s[:max_len] if len(s) > max_len else s


class AIService:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client = None
        if self.is_enabled():
            from groq import Groq

            self._client = Groq(api_key=self._settings.GROQ_API_KEY)

    def is_enabled(self) -> bool:
        key = self._settings.GROQ_API_KEY
        has_key = bool(key and str(key).strip())
        return has_key and self._settings.AI_PROVIDER.lower() == "groq"

    def _build_user_prompt(self, issue: IssueCreate, code_snippet: str | None) -> str:
        code_block = ""
        if code_snippet:
            snippet = _safe_str(code_snippet, 3000)
            code_block = f"\nRelevant code context (for remediation guidance only):\n{snippet}"
        return USER_PROMPT_TEMPLATE.format(
            title=_safe_str(issue.title, 500),
            severity=issue.severity,
            category=_safe_str(issue.category, 200),
            owasp=_safe_str(issue.owasp_category or "N/A", 200),
            description=_safe_str(issue.description, 1500),
            risk_explanation=_safe_str(issue.risk_explanation, 1500),
            evidence=_safe_str(issue.evidence or "N/A", 800),
            code_block=code_block,
        )

    def _call_groq_sync(self, issue: IssueCreate, code_snippet: str | None) -> IssueCreate:
        assert self._client is not None
        user_prompt = self._build_user_prompt(issue, code_snippet)
        response = self._client.chat.completions.create(
            model=self._settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
            max_tokens=1024,
        )
        content = response.choices[0].message.content or ""
        parsed = _parse_json_response(content)
        if not parsed:
            raise ValueError("Groq response was not valid JSON")

        result = deepcopy(issue)
        result.description = _safe_str(parsed.get("description") or issue.description)
        result.risk_explanation = _safe_str(parsed.get("risk_explanation") or issue.risk_explanation)
        result.recommendation = _safe_str(parsed.get("recommendation") or issue.recommendation)
        secure = parsed.get("secure_example")
        result.secure_example = _safe_str(secure) if secure else issue.secure_example
        result.developer_friendly_summary = _safe_str(
            parsed.get("developer_friendly_summary") or issue.developer_friendly_summary
        )
        result.ai_enhanced = True
        result.ai_provider = "groq"
        result.ai_error = None
        return result

    async def enhance_issue(
        self, issue: IssueCreate, code_snippet: str | None = None
    ) -> IssueCreate:
        if not self.is_enabled():
            return issue

        try:
            return await asyncio.to_thread(self._call_groq_sync, issue, code_snippet)
        except Exception as exc:
            logger.warning("Groq enhancement failed for issue %s: %s", issue.title, exc)
            fallback = deepcopy(issue)
            fallback.ai_enhanced = False
            fallback.ai_provider = None
            fallback.ai_error = _safe_str(str(exc), 500)
            return fallback

    async def enhance_issues(
        self, issues: list[IssueCreate], code_snippet: str | None = None
    ) -> list[IssueCreate]:
        if not self.is_enabled() or not issues:
            return issues

        max_n = max(1, self._settings.AI_MAX_ISSUES)
        indexed = list(enumerate(issues))
        indexed.sort(key=lambda pair: _severity_sort_key(pair[1]))
        top_indices = {idx for idx, _ in indexed[:max_n]}

        enhanced: list[IssueCreate] = []
        for idx, issue in enumerate(issues):
            if idx in top_indices:
                enhanced.append(await self.enhance_issue(issue, code_snippet))
            else:
                copy = deepcopy(issue)
                copy.ai_enhanced = False
                copy.ai_provider = None
                enhanced.append(copy)
        return enhanced


async def enrich_findings(
    issues: list[IssueCreate], code_snippet: str | None = None
) -> list[IssueCreate]:
    """Backward-compatible entry point used by the scan pipeline."""
    service = AIService()
    if not service.is_enabled():
        return issues
    return await service.enhance_issues(issues, code_snippet=code_snippet)
