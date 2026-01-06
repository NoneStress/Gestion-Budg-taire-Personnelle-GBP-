from pydantic import BaseModel
from typing import List

class CategoriesResponse(BaseModel):
    expense: List[str]  # Ex. ['Alimentation', 'Transport', ...]
    income: List[str]   # Ex. ['Salaire', 'Freelance', ...]