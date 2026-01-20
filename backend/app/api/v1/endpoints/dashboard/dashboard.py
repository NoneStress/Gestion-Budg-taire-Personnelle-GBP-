from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional, List
from datetime import datetime, date
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, Budget
from app.models.transaction import Transaction
from pydantic import BaseModel

router = APIRouter()

# Schémas de réponse pour le dashboard
class DashboardSummary(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    transaction_count: int
    month: str

class BudgetStatus(BaseModel):
    id: int
    category: str
    monthly_limit: float
    current_spending: float
    percentage_used: float
    notification_threshold: float
    is_over_budget: bool
    is_near_limit: bool

class CategoryAnalysis(BaseModel):
    category: str
    total_amount: float
    transaction_count: int
    percentage_of_expenses: float

@router.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    month: Optional[str] = Query(None, description="Format: YYYY-MM"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Résumé général du dashboard avec revenus, dépenses et solde"""

    # Déterminer la période (mois en cours si non spécifié)
    if month:
        try:
            year, month_num = map(int, month.split('-'))
            start_date = date(year, month_num, 1)
            if month_num == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month_num + 1, 1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de mois invalide. Utilisez YYYY-MM")
    else:
        # Mois en cours
        today = date.today()
        start_date = date(today.year, today.month, 1)
        if today.month == 12:
            end_date = date(today.year + 1, 1, 1)
        else:
            end_date = date(today.year, today.month + 1, 1)
        month = f"{today.year:04d}-{today.month:02d}"

    # Calcul des revenus totaux
    total_income_result = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "income",
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).scalar()
    total_income = float(total_income_result) if total_income_result is not None else 0.0

    # Calcul des dépenses totales
    total_expenses_result = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).scalar()
    total_expenses = float(total_expenses_result) if total_expenses_result is not None else 0.0

    # Nombre de transactions
    transaction_count = db.query(func.count(Transaction.id)).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).scalar()

    # Calcul du solde
    balance = total_income - total_expenses

    return DashboardSummary(
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        balance=round(balance, 2),
        transaction_count=transaction_count,
        month=month
    )

@router.get("/budgets/status", response_model=List[BudgetStatus])
def get_budgets_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Statut des budgets avec dépenses actuelles et alertes"""

    # Mois en cours
    today = date.today()
    start_date = date(today.year, today.month, 1)
    if today.month == 12:
        end_date = date(today.year + 1, 1, 1)
    else:
        end_date = date(today.year, today.month + 1, 1)

    # Récupérer tous les budgets de l'utilisateur
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()

    budget_statuses = []

    for budget in budgets:
        # Calcul des dépenses actuelles pour cette catégorie ce mois-ci
        current_spending_result = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
            Transaction.category == budget.category,
            Transaction.date >= start_date,
            Transaction.date < end_date
        ).scalar()
        current_spending = float(current_spending_result) if current_spending_result is not None else 0.0

        # Calcul du pourcentage utilisé
        monthly_limit_float = float(budget.monthly_limit)
        notification_threshold_float = float(budget.notification_threshold)
        percentage_used = (current_spending / monthly_limit_float * 100) if monthly_limit_float > 0 else 0

        # Déterminer les alertes
        is_over_budget = current_spending > monthly_limit_float
        is_near_limit = percentage_used >= notification_threshold_float

        budget_statuses.append(BudgetStatus(
            id=budget.id,
            category=budget.category,
            monthly_limit=round(monthly_limit_float, 2),
            current_spending=round(current_spending, 2),
            percentage_used=round(percentage_used, 2),
            notification_threshold=notification_threshold_float,
            is_over_budget=is_over_budget,
            is_near_limit=is_near_limit
        ))

    return budget_statuses

@router.get("/categories/analysis", response_model=List[CategoryAnalysis])
def get_categories_analysis(
    month: Optional[str] = Query(None, description="Format: YYYY-MM"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyse par catégorie pour les graphiques"""

    # Déterminer la période (mois en cours si non spécifié)
    if month:
        try:
            year, month_num = map(int, month.split('-'))
            start_date = date(year, month_num, 1)
            if month_num == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month_num + 1, 1)
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de mois invalide. Utilisez YYYY-MM")
    else:
        # Mois en cours
        today = date.today()
        start_date = date(today.year, today.month, 1)
        if today.month == 12:
            end_date = date(today.year + 1, 1, 1)
        else:
            end_date = date(today.year, today.month + 1, 1)

    # Calcul du total des dépenses pour le pourcentage
    total_expenses_result = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).scalar()
    total_expenses = float(total_expenses_result) if total_expenses_result is not None else 0.0

    # Agrégation par catégorie
    from sqlalchemy import text
    query = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total_amount'),
        func.count(Transaction.id).label('transaction_count')
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= start_date,
        Transaction.date < end_date
    ).group_by(Transaction.category).all()

    categories_analysis = []

    for category, total_amount, transaction_count in query:
        percentage = (total_amount / total_expenses * 100) if total_expenses > 0 else 0

        categories_analysis.append(CategoryAnalysis(
            category=category,
            total_amount=round(total_amount, 2),
            transaction_count=transaction_count,
            percentage_of_expenses=round(percentage, 2)
        ))

    # Trier par montant décroissant
    categories_analysis.sort(key=lambda x: x.total_amount, reverse=True)

    return categories_analysis

