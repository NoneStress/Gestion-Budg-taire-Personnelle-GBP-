from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.user import LoginRequest
from app.schemas.auth import TokenResponse
from app.services.auth_service import AuthService
from app.core.auth import create_access_token
from app.db.session import get_db

router = APIRouter()

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Connexion d'un utilisateur"""
    try:
        user = AuthService.authenticate_user(db, request)
        access_token = create_access_token(data={"sub": user.email})
        return TokenResponse(access_token=access_token)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erreur lors de la connexion")

@router.post("/logout")
def logout():
    """Déconnexion (côté client, invalider le token)"""
    # Dans une vraie implémentation, on pourrait blacklister le token
    # Pour l'instant, on retourne juste un message
    return {"message": "Déconnexion réussie"}

