from fastapi import APIRouter, Depends

from app.config import get_settings
from app.security.jwt import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/ai-status")
def ai_status(_current_user=Depends(get_current_user)):
    settings = get_settings()
    key = settings.GROQ_API_KEY
    has_key = bool(key and str(key).strip())
    enabled = has_key and settings.AI_PROVIDER.lower() == "groq"

    if enabled:
        return {
            "ai_enabled": True,
            "provider": "groq",
            "model": settings.GROQ_MODEL,
        }
    return {
        "ai_enabled": False,
        "provider": "none",
        "model": None,
    }
