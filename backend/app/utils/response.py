from typing import Any

from pydantic import BaseModel


class APIResponse(BaseModel):
    success: bool = True
    message: str = "OK"
    data: Any = None
