from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BudgetBase(BaseModel):
    category: str = Field(..., max_length=100)  # Statique
    monthly_limit: float = Field(..., gt=0)
    notification_threshold: float = Field(..., ge=0, le=100)  # Pourcentage (0-100)

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    category: Optional[str] = Field(None, max_length=100)
    monthly_limit: Optional[float] = Field(None, gt=0)
    notification_threshold: Optional[float] = Field(None, ge=0, le=100)

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True