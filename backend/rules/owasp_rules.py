import re

from models.schemas import Vulnerability

SENSITIVE_KEYWORDS = {
    "password", "token", "secret", "ssn", "credit_card",
    "cvv", "pin", "private_key", "api_key",
}

SSRF_PARAM_NAMES = {"url", "uri", "endpoint", "redirect", "callback", "webhook"}

ADMIN_PATH_PATTERNS = re.compile(
    r"/(admin|internal|manage|superuser)(/|$)", re.IGNORECASE
)

AUTH_PATH_PATTERNS = re.compile(
    r"^/(login|auth|token|signin)(/|$)", re.IGNORECASE
)

LIST_PATH_PATTERNS = re.compile(
    r"(s|ies|list|items|all)(/|$)", re.IGNORECASE
)


def _endpoint_label(ep: dict) -> str:
    return f"{ep['method']} {ep['path']}"


def _has_security(ep: dict) -> bool:
    sec = ep.get("security")
    if sec is None:
        root = ep.get("root_security")
        return bool(root)
    return len(sec) > 0


def check_api1_bola(endpoints: list[dict]) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []
    for ep in endpoints:
        path_params = ep.get("path_params") or []
        if path_params and not _has_security(ep):
            param_names = ", ".join(path_params)
            vulns.append(Vulnerability(
                rule_id="API1:2023",
                rule_name="Broken Object Level Authorization",
                endpoint=_endpoint_label(ep),
                severity="Critical",
                description=(
                    f"Endpoint has path parameter(s) ({param_names}) "
                    "but no security requirements defined."
                ),
                fix="Add authentication and verify that the requesting user owns this resource",
            ))
    return vulns


def check_api2_auth(endpoints: list[dict]) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []
    for ep in endpoints:
        if ep["method"] != "POST":
            continue
        if not AUTH_PATH_PATTERNS.search(ep["path"]):
            continue

        issues: list[str] = []
        if not ep.get("has_https", True):
            issues.append("spec does not enforce HTTPS")

        operation = ep.get("operation", {})
        has_rate_limit = False
        for param in ep.get("parameters", []):
            name = (param.get("name") or "").lower()
            if "rate" in name or "limit" in name:
                has_rate_limit = True
        for header_name in operation.get("responses", {}).get("200", {}).get("headers", {}):
            if "rate" in header_name.lower():
                has_rate_limit = True
        if not has_rate_limit:
            issues.append("no rate limiting headers or parameters documented")

        if issues:
            vulns.append(Vulnerability(
                rule_id="API2:2023",
                rule_name="Broken Authentication",
                endpoint=_endpoint_label(ep),
                severity="Critical",
                description=f"Authentication endpoint issue: {'; '.join(issues)}.",
                fix="Ensure login endpoints enforce rate limiting and use HTTPS only",
            ))
    return vulns


def check_api3_property_auth(endpoints: list[dict]) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []
    for ep in endpoints:
        for field in ep.get("response_fields", []):
            field_lower = field.lower()
            for keyword in SENSITIVE_KEYWORDS:
                if keyword in field_lower:
                    vulns.append(Vulnerability(
                        rule_id="API3:2023",
                        rule_name="Broken Object Property Level Authorization",
                        endpoint=_endpoint_label(ep),
                        severity="High",
                        description=f"Response schema exposes sensitive field '{field}'.",
                        fix=f"Remove sensitive field '{field}' from API response or mask it",
                    ))
                    break
    return vulns


def check_api4_resource_consumption(endpoints: list[dict]) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []
    pagination_names = {"limit", "page_size", "pagesize", "per_page"}

    for ep in endpoints:
        if ep["method"] != "GET":
            continue

        params = ep.get("parameters", [])
        pagination_params = [
            p for p in params
            if (p.get("name") or "").lower() in pagination_names
        ]

        if pagination_params:
            for p in pagination_params:
                schema = p.get("schema") or {}
                maximum = schema.get("maximum")
                if maximum is None:
                    vulns.append(Vulnerability(
                        rule_id="API4:2023",
                        rule_name="Unrestricted Resource Consumption",
                        endpoint=_endpoint_label(ep),
                        severity="Medium",
                        description=(
                            f"Pagination parameter '{p.get('name')}' has no "
                            "maximum value constraint defined."
                        ),
                        fix="Add maximum value constraint to pagination parameters to prevent resource exhaustion",
                    ))
        else:
            path = ep["path"]
            if LIST_PATH_PATTERNS.search(path):
                vulns.append(Vulnerability(
                    rule_id="API4:2023",
                    rule_name="Unrestricted Resource Consumption",
                    endpoint=_endpoint_label(ep),
                    severity="Medium",
                    description=(
                        "List-like GET endpoint has no pagination parameters defined."
                    ),
                    fix="Add maximum value constraint to pagination parameters to prevent resource exhaustion",
                ))
    return vulns


def check_api5_bfla(endpoints: list[dict]) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []
    for ep in endpoints:
        if ADMIN_PATH_PATTERNS.search(ep["path"]) and not _has_security(ep):
            vulns.append(Vulnerability(
                rule_id="API5:2023",
                rule_name="Broken Function Level Authorization",
                endpoint=_endpoint_label(ep),
                severity="Critical",
                description="Admin or privileged endpoint has no security requirements defined.",
                fix="Restrict admin endpoints with role-based access control",
            ))
    return vulns


def check_api7_ssrf(endpoints: list[dict]) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []
    for ep in endpoints:
        found_params: list[str] = []
        for p in ep.get("parameters", []):
            name = (p.get("name") or "").lower()
            loc = p.get("in", "")
            if name in SSRF_PARAM_NAMES and loc in ("query", "path", "header"):
                found_params.append(name)
        for field in ep.get("request_body_fields", []):
            if field.lower() in SSRF_PARAM_NAMES:
                found_params.append(field)
        if found_params:
            param_list = ", ".join(dict.fromkeys(found_params))
            vulns.append(Vulnerability(
                rule_id="API7:2023",
                rule_name="Server-Side Request Forgery (SSRF)",
                endpoint=_endpoint_label(ep),
                severity="High",
                description=f"Endpoint accepts SSRF-prone parameter(s): {param_list}.",
                fix="Validate and whitelist allowed URLs/domains for this parameter",
            ))
    return vulns


def check_api8_misconfiguration(endpoints: list[dict]) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []
    for ep in endpoints:
        for p in ep.get("parameters", []):
            schema = p.get("schema")
            if not schema or not isinstance(schema, dict):
                vulns.append(Vulnerability(
                    rule_id="API8:2023",
                    rule_name="Security Misconfiguration",
                    endpoint=_endpoint_label(ep),
                    severity="Medium",
                    description=(
                        f"Parameter '{p.get('name')}' has no schema type defined."
                    ),
                    fix="Define strict schema types for all parameters and secure destructive endpoints",
                ))
                continue
            if not schema.get("type") and not schema.get("$ref") and not schema.get("properties"):
                vulns.append(Vulnerability(
                    rule_id="API8:2023",
                    rule_name="Security Misconfiguration",
                    endpoint=_endpoint_label(ep),
                    severity="Medium",
                    description=(
                        f"Parameter '{p.get('name')}' has untyped schema (injection risk)."
                    ),
                    fix="Define strict schema types for all parameters and secure destructive endpoints",
                ))

        if ep["method"] == "DELETE" and not _has_security(ep):
            vulns.append(Vulnerability(
                rule_id="API8:2023",
                rule_name="Security Misconfiguration",
                endpoint=_endpoint_label(ep),
                severity="Medium",
                description="DELETE endpoint has no security requirements defined.",
                fix="Define strict schema types for all parameters and secure destructive endpoints",
            ))
    return vulns


def run_all_checks(endpoints: list[dict]) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []
    vulns.extend(check_api1_bola(endpoints))
    vulns.extend(check_api2_auth(endpoints))
    vulns.extend(check_api3_property_auth(endpoints))
    vulns.extend(check_api4_resource_consumption(endpoints))
    vulns.extend(check_api5_bfla(endpoints))
    vulns.extend(check_api7_ssrf(endpoints))
    vulns.extend(check_api8_misconfiguration(endpoints))
    return vulns
