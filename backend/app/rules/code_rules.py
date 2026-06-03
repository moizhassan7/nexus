"""Static analysis rules for source code — 15 security checks."""

import re
from dataclasses import dataclass


@dataclass
class RuleFinding:
    title: str
    severity: str
    category: str
    owasp_category: str
    description: str
    risk_explanation: str
    evidence: str | None
    affected_source: str | None
    line_number: int | None
    recommendation: str
    secure_example: str | None


def _line_context(lines: list[str], idx: int, window: int = 0) -> str:
    start = max(0, idx - window)
    end = min(len(lines), idx + window + 1)
    return "\n".join(f"{i + 1}: {lines[i]}" for i in range(start, end))


def _match_lines(code: str, patterns: list[re.Pattern]) -> list[tuple[int, str]]:
    lines = code.splitlines()
    hits: list[tuple[int, str]] = []
    for i, line in enumerate(lines):
        for pat in patterns:
            if pat.search(line):
                hits.append((i + 1, line.strip()))
                break
    return hits


# --- Rule definitions ---

def rule_hardcoded_secrets(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)(api[_-]?key|secret|password|token|auth)\s*=\s*['"][^'"]{8,}['"]"""),
        re.compile(r"""(?i)(aws_access_key|aws_secret|private_key)\s*=\s*['"][^'"]+['"]"""),
        re.compile(r"sk-[a-zA-Z0-9]{20,}"),
        re.compile(r"AKIA[0-9A-Z]{16}"),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        findings.append(
            RuleFinding(
                title="Hardcoded Secret Detected",
                severity="Critical",
                category="Secrets Management",
                owasp_category="A02:2021 – Cryptographic Failures",
                description="Source code contains what appears to be a hardcoded API key, password, or secret.",
                risk_explanation="Secrets in source code can be leaked via version control, logs, or decompilation, enabling full account compromise.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Move secrets to environment variables or a secrets manager. Never commit credentials.",
                secure_example="const apiKey = process.env.API_KEY;",
            )
        )
    return findings


def rule_jwt_secret(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)jwt[_-]?secret\s*=\s*['"][^'"]+['"]"""),
        re.compile(r"""(?i)JWT_SECRET\s*[:=]\s*['"][^'"]{1,32}['"]"""),
        re.compile(r"""(?i)secretOrKey\s*:\s*['"][^'"]+['"]"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        findings.append(
            RuleFinding(
                title="Hardcoded JWT Secret",
                severity="Critical",
                category="Authentication",
                owasp_category="A02:2021 – Cryptographic Failures",
                description="JWT signing secret is embedded directly in application code.",
                risk_explanation="Attackers who obtain the secret can forge valid JWTs and impersonate any user.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Load JWT secrets from secure environment configuration with sufficient entropy (256+ bits).",
                secure_example="JWT_SECRET = os.environ['JWT_SECRET']  # 64+ random bytes",
            )
        )
    return findings


def rule_plaintext_passwords(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)password\s*=\s*['"][^'"]+['"]"""),
        re.compile(r"""(?i)user\.password\s*=\s*request\.body"""),
        re.compile(r"""(?i)store.*password.*plain"""),
        re.compile(r"""(?i)password.*===?\s*['"][^'"]+['"]"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        if "hash" in line.lower() or "bcrypt" in line.lower():
            continue
        findings.append(
            RuleFinding(
                title="Plaintext Password Handling",
                severity="High",
                category="Authentication",
                owasp_category="A02:2021 – Cryptographic Failures",
                description="Password appears to be stored or compared in plaintext.",
                risk_explanation="Database breaches expose user passwords directly, enabling credential stuffing across services.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Hash passwords with bcrypt, Argon2, or scrypt before storage. Never compare plaintext.",
                secure_example="hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())",
            )
        )
    return findings


def rule_weak_hashing(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)hashlib\.md5|hashlib\.sha1|MD5\(|SHA1\(|crypto\.createHash\(['"]md5"""),
        re.compile(r"""(?i)password.*md5|md5.*password"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        findings.append(
            RuleFinding(
                title="Weak Password Hashing Algorithm",
                severity="High",
                category="Cryptography",
                owasp_category="A02:2021 – Cryptographic Failures",
                description="MD5 or SHA1 used for password hashing — cryptographically broken for this purpose.",
                risk_explanation="Rainbow tables and GPU cracking make weak hashes trivial to reverse.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Use bcrypt, scrypt, or Argon2id with appropriate work factors.",
                secure_example="bcrypt.hashpw(password, bcrypt.gensalt(rounds=12))",
            )
        )
    return findings


def rule_sql_injection(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)(execute|query|raw)\s*\(\s*['"][^'"]*\+|f['"][^'"]*SELECT"""),
        re.compile(r"""(?i)SELECT\s+\*\s+FROM.*\+"""),
        re.compile(r"""(?i)\.format\(.*SELECT|%\s*\(.*SELECT"""),
        re.compile(r"""(?i)cursor\.execute\s*\(\s*['"][^'"]*%"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        findings.append(
            RuleFinding(
                title="Potential SQL Injection",
                severity="Critical",
                category="Injection",
                owasp_category="A03:2021 – Injection",
                description="SQL query built via string concatenation or formatting with user input.",
                risk_explanation="Attackers can manipulate queries to read, modify, or delete arbitrary database data.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Use parameterized queries / prepared statements exclusively.",
                secure_example='cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))',
            )
        )
    return findings


def rule_eval_usage(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"\beval\s*\("),
        re.compile(r"\bnew\s+Function\s*\("),
        re.compile(r"exec\s*\("),
        re.compile(r"pickle\.loads|yaml\.load\s*\("),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        if "yaml.safe_load" in line:
            continue
        findings.append(
            RuleFinding(
                title="Dangerous Code Execution (eval/exec)",
                severity="Critical",
                category="Injection",
                owasp_category="A03:2021 – Injection",
                description="Dynamic code execution detected — eval, exec, or unsafe deserialization.",
                risk_explanation="Untrusted input can execute arbitrary code on the server (RCE).",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Avoid eval/exec. Parse JSON with json.loads; use yaml.safe_load only.",
                secure_example="data = json.loads(user_input)",
            )
        )
    return findings


def rule_insecure_cors(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)Access-Control-Allow-Origin['"]?\s*[:=]\s*['"]\*['"]"""),
        re.compile(r"""(?i)cors\(\s*\{[^}]*origin\s*:\s*['"]\*['"]"""),
        re.compile(r"""(?i)allow_origins\s*=\s*\[\s*['"]\*['"]\s*\]"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        findings.append(
            RuleFinding(
                title="Overly Permissive CORS Configuration",
                severity="Medium",
                category="Configuration",
                owasp_category="A05:2021 – Security Misconfiguration",
                description="CORS allows all origins (*) which may expose authenticated APIs to malicious sites.",
                risk_explanation="Malicious websites can make credentialed requests on behalf of logged-in users.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Whitelist specific trusted origins. Avoid wildcard with credentials.",
                secure_example='allow_origins=["https://app.example.com"]',
            )
        )
    return findings


def rule_rate_limiting(code: str, language: str) -> list[RuleFinding]:
    has_auth_route = bool(re.search(r"""(?i)(login|signin|auth|register|password)""", code))
    has_rate_limit = bool(
        re.search(r"""(?i)(rateLimit|rate_limit|slowapi|limiter|throttle)""", code)
    )
    findings: list[RuleFinding] = []
    if has_auth_route and not has_rate_limit:
        findings.append(
            RuleFinding(
                title="Missing Rate Limiting on Auth Endpoints",
                severity="Medium",
                category="Availability",
                owasp_category="A04:2021 – Insecure Design",
                description="Authentication-related routes detected without rate limiting middleware.",
                risk_explanation="Enables brute-force and credential stuffing attacks against login endpoints.",
                evidence="Auth routes present; no rate-limit pattern found",
                affected_source=None,
                line_number=None,
                recommendation="Apply rate limiting (e.g., slowapi, express-rate-limit) on login and password reset.",
                secure_example="@limiter.limit('5/minute')\nasync def login(...):",
            )
        )
    return findings


def rule_file_upload(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)upload|multipart|UploadFile|multer"""),
    ]
    unsafe = [
        re.compile(r"""(?i)(originalname|filename).*write|save.*req\.file"""),
        re.compile(r"""(?i)mimetype|content-type.*trust"""),
    ]
    has_upload = bool(patterns[0].search(code))
    has_validation = bool(
        re.search(r"""(?i)(allowed_extensions|filetype|magic|clamav|size.*limit|max.*size)""", code)
    )
    findings: list[RuleFinding] = []
    if has_upload and not has_validation:
        findings.append(
            RuleFinding(
                title="Unvalidated File Upload",
                severity="High",
                category="File Handling",
                owasp_category="A04:2021 – Insecure Design",
                description="File upload handling without visible extension/MIME/size validation.",
                risk_explanation="Attackers may upload web shells, malware, or oversized files.",
                evidence="Upload handler without validation patterns",
                affected_source=None,
                line_number=None,
                recommendation="Validate extension whitelist, MIME type, file size, and scan with antivirus.",
                secure_example="if file.content_type not in ALLOWED_TYPES: raise HTTPException(400)",
            )
        )
    for pat in unsafe:
        for line_no, line in _match_lines(code, [pat]):
            findings.append(
                RuleFinding(
                    title="Unsafe File Upload Path",
                    severity="High",
                    category="File Handling",
                    owasp_category="A03:2021 – Injection",
                    description="Uploaded file may be saved using client-controlled filename.",
                    risk_explanation="Path traversal and arbitrary file write can lead to RCE.",
                    evidence=line,
                    affected_source=line,
                    line_number=line_no,
                    recommendation="Generate random server-side filenames; never use user-supplied paths.",
                    secure_example="safe_name = f'{uuid4()}{allowed_ext}'",
                )
            )
    return findings


def rule_debug_mode(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)DEBUG\s*=\s*True"""),
        re.compile(r"""(?i)app\.run\s*\([^)]*debug\s*=\s*True"""),
        re.compile(r"""(?i)FLASK_ENV\s*=\s*['"]development['"]"""),
        re.compile(r"""(?i)NODE_ENV\s*=\s*['"]development['"]"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        findings.append(
            RuleFinding(
                title="Debug Mode Enabled",
                severity="Medium",
                category="Configuration",
                owasp_category="A05:2021 – Security Misconfiguration",
                description="Application debug mode appears enabled in source.",
                risk_explanation="Debug modes expose stack traces, environment variables, and interactive consoles.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Disable debug in production. Use environment-based configuration.",
                secure_example="DEBUG = os.getenv('DEBUG', 'false').lower() == 'true'",
            )
        )
    return findings


def rule_database_url(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"postgresql://[^:]+:[^@]+@"),
        re.compile(r"mysql://[^:]+:[^@]+@"),
        re.compile(r"""(?i)DATABASE_URL\s*=\s*['"][^'"]+['"]"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        if "os.environ" in line or "process.env" in line or "getenv" in line:
            continue
        findings.append(
            RuleFinding(
                title="Hardcoded Database Credentials",
                severity="Critical",
                category="Secrets Management",
                owasp_category="A02:2021 – Cryptographic Failures",
                description="Database connection string with embedded credentials found in code.",
                risk_explanation="Full database access if source code or binaries are exposed.",
                evidence=line[:120] + ("..." if len(line) > 120 else ""),
                affected_source=line,
                line_number=line_no,
                recommendation="Use environment variables and rotate credentials regularly.",
                secure_example="DATABASE_URL = os.environ['DATABASE_URL']",
            )
        )
    return findings


def rule_localstorage_token(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)localStorage\.(setItem|getItem)\s*\(\s*['"][^'"]*(token|jwt|auth)"""),
        re.compile(r"""(?i)sessionStorage\.(setItem|getItem)\s*\(\s*['"][^'"]*token"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        findings.append(
            RuleFinding(
                title="JWT/Token Stored in localStorage",
                severity="Medium",
                category="Client Security",
                owasp_category="A07:2021 – Identification and Authentication Failures",
                description="Authentication token stored in browser localStorage.",
                risk_explanation="Any XSS vulnerability allows token theft via JavaScript.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Use HttpOnly, Secure, SameSite cookies for session tokens.",
                secure_example="// Server sets: Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict",
            )
        )
    return findings


def rule_missing_validation(code: str, language: str) -> list[RuleFinding]:
    has_body_input = bool(
        re.search(r"""(?i)(req\.body|request\.json|request\.form|@Body|req\.params)""", code)
    )
    has_validation = bool(
        re.search(
            r"""(?i)(zod|joi|yup|pydantic|class-validator|express-validator|sanitize|validate)""",
            code,
        )
    )
    findings: list[RuleFinding] = []
    if has_body_input and not has_validation:
        findings.append(
            RuleFinding(
                title="Missing Input Validation",
                severity="Medium",
                category="Input Validation",
                owasp_category="A03:2021 – Injection",
                description="Request body/params consumed without visible validation library or sanitization.",
                risk_explanation="Unvalidated input is the root cause of injection, XSS, and business logic flaws.",
                evidence="Request input without validation patterns",
                affected_source=None,
                line_number=None,
                recommendation="Validate all inputs with schema libraries (Pydantic, Zod, Joi) at trust boundaries.",
                secure_example="class UserCreate(BaseModel):\n    email: EmailStr",
            )
        )
    return findings


def rule_cookie_flags(code: str, language: str) -> list[RuleFinding]:
    has_cookie = bool(re.search(r"""(?i)(setCookie|set_cookie|response\.cookie)""", code))
    has_secure_flags = bool(
        re.search(r"""(?i)(httponly|secure\s*=\s*True|samesite)""", code)
    )
    findings: list[RuleFinding] = []
    if has_cookie and not has_secure_flags:
        findings.append(
            RuleFinding(
                title="Insecure Cookie Configuration",
                severity="Medium",
                category="Session Management",
                owasp_category="A07:2021 – Identification and Authentication Failures",
                description="Cookies set without HttpOnly, Secure, or SameSite attributes.",
                risk_explanation="Session cookies can be stolen via XSS or transmitted over HTTP.",
                evidence="setCookie without secure flag patterns",
                affected_source=None,
                line_number=None,
                recommendation="Set HttpOnly, Secure, and SameSite=Strict/Lax on session cookies.",
                secure_example="response.set_cookie('session', token, httponly=True, secure=True, samesite='strict')",
            )
        )
    return findings


def rule_command_injection(code: str, language: str) -> list[RuleFinding]:
    patterns = [
        re.compile(r"""(?i)(os\.system|os\.popen|subprocess\.(call|Popen|run))\s*\([^)]*\+"""),
        re.compile(r"""(?i)exec\s*\(\s*['"][^'"]*\+"""),
        re.compile(r"""(?i)child_process\.(exec|spawn)\s*\([^)]*\+"""),
        re.compile(r"""(?i)shell\s*=\s*True"""),
    ]
    findings: list[RuleFinding] = []
    for line_no, line in _match_lines(code, patterns):
        findings.append(
            RuleFinding(
                title="Potential Command Injection",
                severity="Critical",
                category="Injection",
                owasp_category="A03:2021 – Injection",
                description="OS command constructed with dynamic/user-controlled input or shell=True.",
                risk_explanation="Attackers can execute arbitrary system commands on the host.",
                evidence=line,
                affected_source=line,
                line_number=line_no,
                recommendation="Use subprocess with argument lists, never shell=True with user input.",
                secure_example="subprocess.run(['convert', user_filename], check=True)",
            )
        )
    return findings


ALL_CODE_RULES = [
    rule_hardcoded_secrets,
    rule_jwt_secret,
    rule_plaintext_passwords,
    rule_weak_hashing,
    rule_sql_injection,
    rule_eval_usage,
    rule_insecure_cors,
    rule_rate_limiting,
    rule_file_upload,
    rule_debug_mode,
    rule_database_url,
    rule_localstorage_token,
    rule_missing_validation,
    rule_cookie_flags,
    rule_command_injection,
]


def run_all_code_rules(code: str, language: str = "javascript") -> list[RuleFinding]:
    findings: list[RuleFinding] = []
    seen: set[tuple[str, int | None]] = set()
    for rule_fn in ALL_CODE_RULES:
        for f in rule_fn(code, language):
            key = (f.title, f.line_number)
            if key not in seen:
                seen.add(key)
                findings.append(f)
    return findings
