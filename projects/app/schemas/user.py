from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str = Field(..., description="Email de l'utilisateur")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Mot de passe (au moins 8 caractères)")

class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)

class UserResponse(UserBase):
    id: str  # UUID ou int selon ta DB
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pour compatibilité avec SQLAlchemy

# Schémas pour l'authentification
class LoginRequest(BaseModel):
    email: str = Field(..., description="Email de l'utilisateur")
    password: str = Field(..., description="Mot de passe")

class RegisterRequest(BaseModel):
    email: str = Field(..., description="Email de l'utilisateur")
    password: str = Field(..., min_length=8, description="Mot de passe (au moins 8 caractères)")

class TokenData(BaseModel):
    email: Optional[str] = None