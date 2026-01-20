from fastapi import APIRouter, Depends
from app.schemas.auth import UserInfo
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/me", response_model=UserInfo)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Récupère les informations de l'utilisateur connecté"""
    return UserInfo(id=current_user.id, email=current_user.email)

