from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Ticket(BaseModel):
    type: str = Field(..., max_length=100)  # Type MIME
    file_path: str = Field(..., max_length=500)  # Lien vers le fichier

class TicketCreate(BaseModel):
    ticket_id: Optional[int] = None  # ID du ticket déjà traité avec OCR
    type: Optional[str] = Field(None, max_length=100)  # Type MIME (optionnel si ticket_id fourni)
    file_path: Optional[str] = Field(None, max_length=500)  # Lien vers le fichier
    size: Optional[int] = Field(None, ge=0)  # Taille en octets

class TicketUpdate(BaseModel):
    type: Optional[str] = Field(None, max_length=100)
    file_path: Optional[str] = Field(None, max_length=500)
    size: Optional[int] = Field(None, ge=0)

class TicketResponse(Ticket):
    id: int
    user_id: int  # Propriétaire du ticket
    transaction_id: Optional[int]
    data: Optional[str]  # Données extraites OCR
    size: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

