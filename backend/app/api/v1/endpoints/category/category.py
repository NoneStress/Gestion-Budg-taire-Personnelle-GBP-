from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

# Schémas de réponse
class CategoriesResponse(BaseModel):
    expense: List[str]
    income: List[str]

# Catégories statiques (basées sur les constantes du front-end)
EXPENSE_CATEGORIES = [
    "Nourriture"
    "Transport"
    "Factures"
    "Divertissement"
    "Achats"
    "Santé"
    "Éducation"
    "Divers"
]



INCOME_CATEGORIES = [
    "Salaire",
    "Freelance",
    "Investissement",
    "Location",
    "Prime",
    "Cadeau",
    "Remboursement",
    "Vente",
    "Intérêts",
    "Dividendes",
    "Autres"
]

@router.get("/categories", response_model=CategoriesResponse)
def get_categories():
    """
    Récupère la liste des catégories disponibles pour les dépenses et les revenus.
    Ces catégories sont statiques et correspondent aux constantes du front-end.
    """
    return CategoriesResponse(
        expense=EXPENSE_CATEGORIES,
        income=INCOME_CATEGORIES
    )

