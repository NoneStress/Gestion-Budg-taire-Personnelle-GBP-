from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from .ticket_schema import *

class TransactionType(str, Enum):
    income = "income"
    expense = "expense"

class TransactionBase(BaseModel):
    description: str = Field(..., max_length=255)
    amount: float = Field(..., gt=0)  # Montant positif
    type: TransactionType
    category: Optional[str] = Field(None, max_length=100)  # Optionnel - classification automatique si non fourni
    date: date

class TransactionCreate(TransactionBase):
    tickets: Optional[List["TicketCreate"]] = Field(default_factory=list)  # Imbriqué pour upload simultané

class TransactionUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    type: Optional[TransactionType] = None
    category: Optional[str] = Field(None, max_length=100)
    date: Optional[date] = None

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    tickets: List["TicketResponse"] = []

    class Config:
        from_attributes = True


