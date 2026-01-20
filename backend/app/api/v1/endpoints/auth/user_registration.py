from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.user import RegisterRequest
from app.schemas.auth import TokenResponse
from app.services.auth_service import AuthService
from app.core.auth import create_access_token
from app.db.session import get_db

router = APIRouter()

@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Inscription d'un nouvel utilisateur"""
    try:
        user = AuthService.register_user(db, request)
        # Créer un token automatiquement après inscription
        access_token = create_access_token(data={"sub": user.email})
        return TokenResponse(access_token=access_token)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur lors de l'inscription")

