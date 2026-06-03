import json
import uuid
from contextlib import asynccontextmanager

import httpx
import yaml
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from db.database import get_analysis, init_db, save_analysis
from app.database import init_db as app_init_db
from models.schemas import AnalysisResult, AnalyzeSpecRequest
from parser.openapi_parser import parse_spec
from rules.owasp_rules import run_all_checks
from rules.severity import count_by_severity, sort_by_severity
from scanner.live_scanner import scan_live_endpoints

from app.routes import auth, dashboard, reports, scans
from app.routes import settings as settings_routes

@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    app_init_db()
    yield

from app.config import get_settings

settings = get_settings()

app = FastAPI(title="SecureShield API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(scans.router)
app.include_router(dashboard.router)
app.include_router(reports.router)
app.include_router(settings_routes.router)


def _parse_raw_content(content: bytes, filename: str = "") -> dict:
    text = content.decode("utf-8", errors="replace").strip()
    lower = filename.lower()
    try:
        if lower.endswith(".json"):
            return json.loads(text)
        return yaml.safe_load(text)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid spec format: {exc}") from exc


async def _run_analysis(
    raw: dict, base_url: str | None = None
) -> AnalysisResult:
    if not isinstance(raw, dict):
        raise HTTPException(status_code=400, detail="Spec must be a JSON/YAML object")

    endpoints = parse_spec(raw)
    if not endpoints:
        raise HTTPException(status_code=400, detail="No endpoints found in specification")

    vulns = run_all_checks(endpoints)

    if base_url:
        live_vulns = await scan_live_endpoints(base_url, endpoints)
        vulns.extend(live_vulns)

    vulns = sort_by_severity(vulns)
    counts = count_by_severity(vulns)
    spec_title = raw.get("info", {}).get("title", "Unknown API")

    result = AnalysisResult(
        analysis_id=str(uuid.uuid4()),
        spec_title=spec_title,
        total_endpoints=len(endpoints),
        total_vulnerabilities=len(vulns),
        critical_count=counts["Critical"],
        high_count=counts["High"],
        medium_count=counts["Medium"],
        low_count=counts["Low"],
        vulnerabilities=vulns,
    )
    await save_analysis(result)
    return result


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze/spec", response_model=AnalysisResult)
async def analyze_spec(
    file: UploadFile = File(...),
    base_url: str | None = Form(None),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    lower = file.filename.lower()
    if not lower.endswith((".yaml", ".yml", ".json")):
        raise HTTPException(
            status_code=400,
            detail="File must be .yaml, .yml, or .json",
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    raw = _parse_raw_content(content, file.filename)
    return await _run_analysis(raw, base_url=base_url)


@app.post("/analyze/url", response_model=AnalysisResult)
async def analyze_url(body: AnalyzeSpecRequest):
    if not body.spec_url:
        raise HTTPException(status_code=400, detail="spec_url is required")

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(body.spec_url)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to fetch spec URL: {exc}",
        ) from exc

    content_type = response.headers.get("content-type", "")
    filename = "spec.json" if "json" in content_type else "spec.yaml"
    raw = _parse_raw_content(response.content, filename)
    return await _run_analysis(raw, base_url=body.base_url)


@app.get("/result/{analysis_id}", response_model=AnalysisResult)
async def get_result(analysis_id: str):
    result = await get_analysis(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
