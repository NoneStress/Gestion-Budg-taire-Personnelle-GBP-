from fastapi import APIRouter
from .endpoints.model1 import router as classify
from .endpoints.health import router as health
from .endpoints.ocr import router as ocr
from .endpoints.auth.user_registration import router as user_registration
from .endpoints.auth.user_login import router as user_login
from .endpoints.auth.auth import router as auth
from .endpoints.transactions.transactions import router as transactions
from .endpoints.budgets.budgets import router as budgets
from .endpoints.dashboard.dashboard import router as dashboard
from .endpoints.category.category import router as category

api_router = APIRouter()

# api_router.include_router(classify, prefix="/classify", tags=["Classification"])
api_router.include_router(ocr, prefix="/extract_text/image", tags=["OCR"])
api_router.include_router(health, prefix="/health", tags=["Health"])
api_router.include_router(user_registration, prefix="/auth", tags=["Authentication"])
api_router.include_router(user_login, prefix="/auth", tags=["Authentication"])
api_router.include_router(auth, prefix="/auth", tags=["Authentication"])
api_router.include_router(transactions, prefix="/api", tags=["Transactions"])
api_router.include_router(budgets, prefix="/api", tags=["Budgets"])
api_router.include_router(dashboard, prefix="/api", tags=["Dashboard"])
api_router.include_router(category, prefix="/api", tags=["Categories"])

