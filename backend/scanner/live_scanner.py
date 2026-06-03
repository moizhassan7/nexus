import json
import re

import httpx

from models.schemas import Vulnerability

SENSITIVE_KEYWORDS = {
    "password", "token", "secret", "ssn", "credit_card",
    "cvv", "pin", "private_key", "api_key",
}

TIMEOUT = 5.0


def _build_url(base_url: str, path: str) -> str:
    base = base_url.rstrip("/")
    resolved_path = re.sub(r"\{[^}]+\}", "1", path)
    if not resolved_path.startswith("/"):
        resolved_path = "/" + resolved_path
    return f"{base}{resolved_path}"


def _json_has_sensitive_keys(data: object) -> list[str]:
    found: list[str] = []
    if isinstance(data, dict):
        for key, value in data.items():
            key_lower = key.lower()
            for keyword in SENSITIVE_KEYWORDS:
                if keyword in key_lower:
                    found.append(key)
                    break
            found.extend(_json_has_sensitive_keys(value))
    elif isinstance(data, list):
        for item in data:
            found.extend(_json_has_sensitive_keys(item))
    return found


async def scan_live_endpoints(
    base_url: str, endpoints: list[dict]
) -> list[Vulnerability]:
    vulns: list[Vulnerability] = []

    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
        for ep in endpoints:
            url = _build_url(base_url, ep["path"])
            method = ep["method"].lower()
            label = f"{ep['method']} {ep['path']}"

            try:
                if method == "get":
                    response = await client.get(url)
                elif method == "post":
                    response = await client.post(url, json={})
                elif method == "put":
                    response = await client.put(url, json={})
                elif method == "delete":
                    response = await client.delete(url)
                else:
                    response = await client.request(method, url)
            except Exception:
                continue

            path_params = ep.get("path_params") or []
            has_security = ep.get("security") is not None and len(ep.get("security") or []) > 0
            root_sec = ep.get("root_security")
            requires_auth = has_security or bool(root_sec)

            if response.status_code == 200 and (path_params or requires_auth):
                vulns.append(Vulnerability(
                    rule_id="API1:2023",
                    rule_name="Broken Object Level Authorization",
                    endpoint=label,
                    severity="Critical",
                    description=(
                        f"Live probe returned 200 OK without authentication "
                        f"at {url}"
                    ),
                    fix="Add authentication and verify that the requesting user owns this resource",
                ))

            if response.status_code == 200:
                content_type = response.headers.get("content-type", "")
                if "json" in content_type:
                    try:
                        body = response.json()
                        sensitive_keys = _json_has_sensitive_keys(body)
                        for key in dict.fromkeys(sensitive_keys):
                            vulns.append(Vulnerability(
                                rule_id="API3:2023",
                                rule_name="Broken Object Property Level Authorization",
                                endpoint=label,
                                severity="High",
                                description=(
                                    f"Live response contains sensitive field '{key}'."
                                ),
                                fix=f"Remove sensitive field '{key}' from API response or mask it",
                            ))
                    except Exception:
                        pass

            if method == "get" and ep["method"] == "GET":
                try:
                    limit_url = f"{url}?limit=99999"
                    limit_resp = await client.get(limit_url)
                    if limit_resp.status_code == 200:
                        vulns.append(Vulnerability(
                            rule_id="API4:2023",
                            rule_name="Unrestricted Resource Consumption",
                            endpoint=label,
                            severity="Medium",
                            description=(
                                "Live probe with ?limit=99999 returned 200 OK "
                                "without error."
                            ),
                            fix="Add maximum value constraint to pagination parameters to prevent resource exhaustion",
                        ))
                except Exception:
                    pass

    return vulns
