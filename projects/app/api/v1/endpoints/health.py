from fastapi import FastAPI
from pydantic import BaseModel

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "ok"}
