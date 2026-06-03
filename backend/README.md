# Nexus - Backend API

The core backend service for **Nexus**, powering real-time API scanning, code vulnerability analysis, and the primary REST API for the frontend. Built for speed, concurrency, and security.

## Features
- **Dynamic API Scanning**: Parse OpenAPI specifications (`.json`/`.yaml`) and crawl endpoints for OWASP vulnerabilities (SQLi, XSS, etc.).
- **Live Endpoint Analysis**: Asynchronous network testing against target servers.
- **AI-Enhanced Reporting**: Integrates with Groq AI to generate context-aware, developer-friendly remediation steps.
- **Authentication**: JWT-based secure user sessions and RBAC.
- **Persistent Storage**: SQLAlchemy ORM for scan histories, user profiles, and detailed reports.

## Tech Stack
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Database**: SQLite (Development) / PostgreSQL (Production ready via SQLAlchemy)
- **HTTP Client**: HTTPX (for asynchronous web requests)
- **Parsing**: PyYAML, JSON

## Getting Started

### Prerequisites
- Python 3.10+

### Installation
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Set up a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (copy `.env.example` to `.env` and fill in required values like `GROQ_API_KEY`).

5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`. 
   Swagger documentation is auto-generated at `http://127.0.0.1:8000/docs`.

## Project Architecture
- `main.py`: The application entry point (mounts sub-routers and initializes the app).
- `/app`: Contains all modular FastAPI routers (`auth.py`, `dashboard.py`, `scans.py`).
- `/db`: Database initialization and core models.
- `/scanner`: Core scanning logic (live crawlers).
- `/rules`: Security testing patterns (SQLi payloads, XSS payloads).
- `/parser`: OpenAPI spec parsing utilities.
