from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.routes import auth, dashboard, reports, scans
from app.routes import settings as settings_routes

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Nexus — Smart Security Auditor for Developers",
    lifespan=lifespan,
)

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


@app.get("/health")
def health():
    return {"status": "ok", "app": "Nexus", "version": settings.APP_VERSION}


@app.get("/")
def root():
    return {
        "name": "Nexus",
        "tagline": "Smart Security Auditor for Developers",
        "docs": "/docs",
    }
