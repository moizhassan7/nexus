"""Passive API security checks — safe GET-only header inspection."""

import re
from dataclasses import dataclass
from urllib.parse import urlparse

import httpx


@dataclass
class ApiFinding:
    title: str
    severity: str
    category: str
    owasp_category: str
    description: str
    risk_explanation: str
    evidence: str | None
    recommendation: str
    secure_example: str | None


SECURITY_HEADERS = {
    "strict-transport-security": ("Strict-Transport-Security", "High"),
    "content-security-policy": ("Content-Security-Policy", "Medium"),
    "x-content-type-options": ("X-Content-Type-Options", "Low"),
    "x-frame-options": ("X-Frame-Options", "Low"),
    "referrer-policy": ("Referrer-Policy", "Info"),
    "permissions-policy": ("Permissions-Policy", "Info"),
}


async def scan_api_target(url: str, scan_depth: str = "standard") -> list[ApiFinding]:
    """Safe passive scan: single GET, inspect response headers only."""
    findings: list[ApiFinding] = []
    parsed = urlparse(url if "://" in url else f"https://{url}")
    target = url if parsed.scheme else f"https://{url}"

    # HTTPS check
    if parsed.scheme == "http" or (not parsed.scheme and not target.startswith("https")):
        findings.append(
            ApiFinding(
                title="HTTP Instead of HTTPS",
                severity="High",
                category="Transport Security",
                owasp_category="A02:2021 – Cryptographic Failures",
                description="Target URL uses unencrypted HTTP.",
                risk_explanation="Traffic including credentials and tokens can be intercepted (MITM).",
                evidence=f"URL scheme: {parsed.scheme or 'http (assumed)'}",
                recommendation="Enforce HTTPS with valid TLS certificates and HSTS.",
                secure_example="https://api.example.com",
            )
        )

    headers: dict[str, str] = {}
    status_code = 0
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            verify=True,
        ) as client:
            response = await client.get(target)
            status_code = response.status_code
            headers = {k.lower(): v for k, v in response.headers.items()}
    except httpx.HTTPError as exc:
        findings.append(
            ApiFinding(
                title="Target Unreachable",
                severity="Info",
                category="Connectivity",
                owasp_category="A05:2021 – Security Misconfiguration",
                description=f"Could not complete safe GET request: {exc}",
                risk_explanation="Unable to assess remote security posture.",
                evidence=str(exc)[:200],
                recommendation="Verify URL, TLS certificate, and network accessibility.",
                secure_example=None,
            )
        )
        return findings

    # Missing security headers
    for header_key, (display_name, severity) in SECURITY_HEADERS.items():
        if header_key not in headers:
            if scan_depth == "quick" and severity in ("Info", "Low"):
                continue
            findings.append(
                ApiFinding(
                    title=f"Missing Security Header: {display_name}",
                    severity=severity,
                    category="HTTP Headers",
                    owasp_category="A05:2021 – Security Misconfiguration",
                    description=f"Response does not include {display_name} header.",
                    risk_explanation="Security headers provide defense-in-depth against XSS, clickjacking, and MIME sniffing.",
                    evidence=f"HTTP {status_code} — header absent",
                    recommendation=f"Configure {display_name} on your reverse proxy or application server.",
                    secure_example=f"{display_name}: <appropriate-value>",
                )
            )

    # CORS wildcard
    acao = headers.get("access-control-allow-origin", "")
    if acao == "*":
        acac = headers.get("access-control-allow-credentials", "").lower()
        sev = "High" if acac == "true" else "Medium"
        findings.append(
            ApiFinding(
                title="CORS Wildcard Origin",
                severity=sev,
                category="CORS",
                owasp_category="A05:2021 – Security Misconfiguration",
                description="Access-Control-Allow-Origin is set to wildcard (*).",
                risk_explanation="Any origin can read API responses; combined with credentials this is critical.",
                evidence=f"Access-Control-Allow-Origin: * (credentials={acac or 'false'})",
                recommendation="Restrict CORS to trusted origins explicitly.",
                secure_example="Access-Control-Allow-Origin: https://app.example.com",
            )
        )

    # Server header disclosure
    server = headers.get("server", "")
    if server and scan_depth in ("standard", "deep"):
        findings.append(
            ApiFinding(
                title="Server Version Disclosure",
                severity="Low",
                category="Information Disclosure",
                owasp_category="A05:2021 – Security Misconfiguration",
                description="Server header reveals technology/version information.",
                risk_explanation="Assists attackers in targeting known CVEs for specific versions.",
                evidence=f"Server: {server[:100]}",
                recommendation="Remove or genericize the Server header in production.",
                secure_example="Server: webserver  # or omit entirely",
            )
        )

    # X-Powered-By
    powered = headers.get("x-powered-by", "")
    if powered:
        findings.append(
            ApiFinding(
                title="X-Powered-By Header Exposed",
                severity="Low",
                category="Information Disclosure",
                owasp_category="A05:2021 – Security Misconfiguration",
                description="X-Powered-By reveals backend framework.",
                risk_explanation="Narrows attack surface for framework-specific exploits.",
                evidence=f"X-Powered-By: {powered[:100]}",
                recommendation="Disable X-Powered-By in framework configuration.",
                secure_example=None,
            )
        )

    # Cookie security flags
    set_cookie = headers.get("set-cookie", "")
    if set_cookie:
        if "secure" not in set_cookie.lower():
            findings.append(
                ApiFinding(
                    title="Cookie Missing Secure Flag",
                    severity="Medium",
                    category="Session Management",
                    owasp_category="A07:2021 – Identification and Authentication Failures",
                    description="Set-Cookie header lacks Secure attribute.",
                    risk_explanation="Cookies may be sent over unencrypted HTTP connections.",
                    evidence=set_cookie[:150],
                    recommendation="Add Secure flag to all session cookies.",
                    secure_example="Set-Cookie: session=...; Secure; HttpOnly; SameSite=Strict",
                )
            )
        if "httponly" not in set_cookie.lower():
            findings.append(
                ApiFinding(
                    title="Cookie Missing HttpOnly Flag",
                    severity="Medium",
                    category="Session Management",
                    owasp_category="A07:2021 – Identification and Authentication Failures",
                    description="Set-Cookie header lacks HttpOnly attribute.",
                    risk_explanation="JavaScript can access session cookies if XSS exists.",
                    evidence=set_cookie[:150],
                    recommendation="Add HttpOnly to prevent client-side script access.",
                    secure_example="Set-Cookie: session=...; HttpOnly; Secure; SameSite=Strict",
                )
            )
        if "samesite" not in set_cookie.lower():
            findings.append(
                ApiFinding(
                    title="Cookie Missing SameSite Attribute",
                    severity="Low",
                    category="Session Management",
                    owasp_category="A01:2021 – Broken Access Control",
                    description="Set-Cookie does not specify SameSite policy.",
                    risk_explanation="Increases CSRF risk for cookie-based authentication.",
                    evidence=set_cookie[:150],
                    recommendation="Set SameSite=Strict or Lax on authentication cookies.",
                    secure_example="Set-Cookie: session=...; SameSite=Strict",
                )
            )

    # Cache-Control on sensitive responses
    cache = headers.get("cache-control", "")
    if status_code == 200 and "no-store" not in cache.lower() and "private" not in cache.lower():
        if scan_depth == "deep":
            findings.append(
                ApiFinding(
                    title="Potentially Cacheable Sensitive Response",
                    severity="Info",
                    category="Caching",
                    owasp_category="A04:2021 – Insecure Design",
                    description="Response may be cached by browsers or proxies (no Cache-Control: no-store).",
                    risk_explanation="Sensitive API data could persist in shared caches.",
                    evidence=f"Cache-Control: {cache or '(not set)'}",
                    recommendation="Use Cache-Control: no-store for authenticated/sensitive endpoints.",
                    secure_example="Cache-Control: no-store, no-cache, must-revalidate",
                )
            )

    return findings
