from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, Budget
from app.schemas.budget_schema import (
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse
)

router = APIRouter()

@router.get("/budgets", response_model=List[BudgetResponse])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste des budgets de l'utilisateur"""
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    return budgets

@router.post("/budgets", response_model=BudgetResponse)
def create_budget(
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ajouter un nouveau budget"""
    # Vérifier si un budget existe déjà pour cette catégorie
    existing_budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category == budget_data.category
    ).first()

    if existing_budget:
        raise HTTPException(
            status_code=400,
            detail=f"Un budget existe déjà pour la catégorie '{budget_data.category}'"
        )

    # Créer le budget
    db_budget = Budget(
        user_id=current_user.id,
        category=budget_data.category,
        monthly_limit=budget_data.monthly_limit,
        notification_threshold=budget_data.notification_threshold
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

@router.put("/budgets/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_data: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Modifier un budget existant"""
    # Récupérer le budget
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget non trouvé")

    # Vérifier si la nouvelle catégorie n'est pas déjà utilisée (si elle est modifiée)
    if budget_data.category and budget_data.category != budget.category:
        existing_budget = db.query(Budget).filter(
            Budget.user_id == current_user.id,
            Budget.category == budget_data.category
        ).first()

        if existing_budget:
            raise HTTPException(
                status_code=400,
                detail=f"Un budget existe déjà pour la catégorie '{budget_data.category}'"
            )

    # Mettre à jour les champs fournis
    update_data = budget_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)

    db.commit()
    db.refresh(budget)
    return budget

@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer un budget"""
    # Récupérer le budget
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget non trouvé")

    # Supprimer le budget
    db.delete(budget)
    db.commit()

    return {"message": "Budget supprimé avec succès"}

