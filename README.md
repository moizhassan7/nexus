# VulnLens — Smart Security Auditor for Developers

VulnLens is a full-stack DevSecOps security auditing platform for developers. It performs **static code analysis** (15 security rules) and **passive API scanning** (safe GET + header inspection), with JWT authentication, PostgreSQL persistence, risk scoring, and PDF reports.

> **Disclaimer:** VulnLens is an educational automated analysis tool. It is **not** a penetration test and may produce false positives. Always validate findings manually before remediation.

## Tech Stack

| Layer    | Technologies |
|----------|-------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Recharts, Framer Motion |
| Backend  | FastAPI, SQLAlchemy, PostgreSQL, JWT, bcrypt, Pydantic, ReportLab |
| Database | PostgreSQL |

## Project Structure

```
secureshield/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/              # User, Scan, Issue
│   │   ├── schemas/
│   │   ├── routes/              # auth, scans, dashboard, reports
│   │   ├── services/            # scanners, scoring, PDF, AI placeholder
│   │   ├── security/            # JWT, bcrypt
│   │   └── rules/               # 15 code rules + API rules
│   ├── requirements.txt
│   └── .env.example
├── frontend/                    # Vite + React SPA
│   ├── src/
│   │   ├── pages/               # Landing, Dashboard, Scanners, etc.
│   │   ├── components/
│   │   ├── services/            # API clients with JWT interceptor
│   │   └── context/AuthContext.tsx
│   └── .env.example
└── README.md
```

Legacy SecureShield OpenAPI analyzer files remain under `backend/main.py` (root) but are **not** used by VulnLens. Run the VulnLens API via `app.main`.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. PostgreSQL

```sql
CREATE DATABASE vulnlens;
CREATE USER vulnlens WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE vulnlens TO vulnlens;
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit DATABASE_URL and JWT_SECRET_KEY in .env
```

Run API (from `backend/` directory):

```bash
# Windows PowerShell
$env:PYTHONPATH="."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

```bash
# macOS/Linux
export PYTHONPATH=.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tables are created automatically on startup via SQLAlchemy `create_all`.

Verify import without running server:

```bash
python -c "from app.main import app; print(app.title)"
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to `http://localhost:8000`.

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/scans/code` | Yes | Static code scan |
| POST | `/api/scans/api` | Yes | Passive API scan |
| GET | `/api/scans` | Yes | List scans |
| GET | `/api/scans/{id}` | Yes | Scan details + issues |
| DELETE | `/api/scans/{id}` | Yes | Delete scan |
| GET | `/api/dashboard/summary` | Yes | Dashboard stats |
| GET | `/api/reports/{scan_id}/pdf` | Yes | Download PDF report |

Interactive docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Security Engine

### Code Scanner (15 rules)

1. Hardcoded secrets  
2. Hardcoded JWT secret  
3. Plaintext passwords  
4. Weak hashing (MD5/SHA1)  
5. SQL injection patterns  
6. eval / exec / unsafe deserialization  
7. Insecure CORS (`*`)  
8. Missing rate limiting on auth routes  
9. Unvalidated file uploads  
10. Debug mode enabled  
11. Hardcoded database URL  
12. Token in localStorage  
13. Missing input validation  
14. Insecure cookie flags  
15. Command injection  

### API Scanner (passive only)

- HTTPS enforcement check  
- Missing security headers (HSTS, CSP, X-Frame-Options, etc.)  
- CORS wildcard  
- Server / X-Powered-By disclosure  
- Cookie Secure / HttpOnly / SameSite  
- Cache-Control (deep scan)  

**Ethics:** API scanner performs a single safe GET request and inspects headers only — no attacks, brute force, or intrusive testing.

### Scoring

- Start at **100**  
- Deductions: Critical −15, High −10, Medium −5, Low −2, Info −1  
- Risk levels: 90–100 Low, 70–89 Medium, 40–69 High, 0–39 Critical  

## Optional AI

Set `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `GROQ_API_KEY` in backend `.env`. Without keys, analysis remains fully rule-based (`app/services/ai_service.py`).

## Manual Setup Checklist

- [ ] PostgreSQL running with `vulnlens` database  
- [ ] `backend/.env` configured (`DATABASE_URL`, `JWT_SECRET_KEY`)  
- [ ] Backend running on port 8000  
- [ ] `npm install` in frontend  
- [ ] Frontend dev server on port 5173  

## License

Educational / academic use. See course requirements for your institution.
