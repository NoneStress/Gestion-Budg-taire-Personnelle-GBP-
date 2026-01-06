from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
import os
import joblib
import json
from projects.app.db.session import get_db
from projects.app.dependencies.auth import get_current_user
from projects.app.models.user import User
from projects.app.models.transaction import Transaction
from projects.app.models.user import Ticket
from projects.app.schemas.transaction_schema import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionType
)
from projects.app.services.ocr_service import extract_text_from_image, extract_items
from projects.app.utils.helpers import clean_receipt_lines
from ..model_loader import model, vectorizer

# Load the model and vectorizer for automatic classification
# model_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'ml_project', 'models', 'expense_categorizer_model.pkl')
# vectorizer_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'ml_project', 'models', 'vectorizer.pkl')

# model = joblib.load(model_path)
# vectorizer = joblib.load(vectorizer_path)

router = APIRouter()

@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    type: Optional[TransactionType] = Query(None),
    category: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liste des transactions de l'utilisateur avec filtres optionnels"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if type:
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Transaction.category == category)
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    transactions = query.all()
    return transactions

@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ajouter une nouvelle transaction"""
    
    # Classification automatique si la catégorie n'est pas fournie
    category = transaction_data.category
    if not category:
        try:
            # Utiliser le modèle pour classifier la description
            X = vectorizer.transform([transaction_data.description])
            predicted_category = model.predict(X)[0]
            category = predicted_category
        except Exception as e:
            # En cas d'erreur de classification, utiliser une catégorie par défaut
            category = "Autre"
            print(f"Erreur lors de la classification automatique: {e}")
    
    # Créer la transaction principale
    db_transaction = Transaction(
        user_id=current_user.id,
        description=transaction_data.description,
        amount=transaction_data.amount,
        type=transaction_data.type,
        category=category,
        date=transaction_data.date
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # Traiter les tickets (attachments)
    if transaction_data.tickets:
        for ticket_data in transaction_data.tickets:
            if ticket_data.ticket_id:
                # Utiliser un ticket déjà traité avec OCR
                existing_ticket = db.query(Ticket).filter(
                    Ticket.id == ticket_data.ticket_id,
                    Ticket.user_id == current_user.id,  # ✅ Vérifier que le ticket appartient à l'utilisateur
                    Ticket.transaction_id.is_(None)  # Ticket pas encore associé à une transaction
                ).first()
                
                if not existing_ticket:
                    raise HTTPException(status_code=404, detail=f"Ticket {ticket_data.ticket_id} non trouvé ou déjà utilisé")
                
                # Mettre à jour le ticket pour l'associer à la transaction
                existing_ticket.transaction_id = db_transaction.id
                db.commit()
                
                # Récupérer les données extraites stockées dans la colonne data
                try:
                    ticket_info = json.loads(existing_ticket.data)
                    raw_text = ticket_info.get("raw_text", [])
                    items = ticket_info.get("items", [])
                    
                    # Traiter les items extraits
                    for item in items:
                        # Classifier automatiquement la catégorie
                        X = vectorizer.transform([item["label"]])
                        predicted_category = model.predict(X)[0]
                        
                        # Créer une transaction pour cet item
                        auto_transaction = Transaction(
                            user_id=current_user.id,
                            description=f"Auto-detected: {item['label']}",
                            amount=item["amount"],
                            type="expense",
                            category=predicted_category,
                            date=transaction_data.date
                        )
                        db.add(auto_transaction)
                        db.commit()
                        db.refresh(auto_transaction)
                        
                        # Créer un lien avec le ticket original
                        auto_ticket = Ticket(
                            user_id=current_user.id,  # ✅ Lier l'auto-ticket à l'utilisateur
                            transaction_id=auto_transaction.id,
                            type=existing_ticket.type,
                            file_path=f"auto_from_ticket_{existing_ticket.id}",
                            size=existing_ticket.size
                        )
                        db.add(auto_ticket)
                    
                    db.commit()
                    
                except (json.JSONDecodeError, KeyError) as e:
                    print(f"Erreur lors du traitement des données du ticket: {e}")
                    continue
                    
            else:
                # Créer un nouveau ticket (sans OCR)
                db_ticket = Ticket(
                    user_id=current_user.id,  # ✅ Lier le ticket à l'utilisateur
                    transaction_id=db_transaction.id,
                    type=ticket_data.type,
                    file_path=ticket_data.file_path,
                    size=ticket_data.size
                )
                db.add(db_ticket)
                db.commit()

    return db_transaction

@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Modifier une transaction existante"""
    # Récupérer la transaction
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")

    # Mettre à jour les champs fournis
    update_data = transaction_data.dict(exclude_unset=True)
    
    # Gestion spéciale de la classification automatique
    if 'description' in update_data and update_data['description']:
        # Si la description est mise à jour et qu'aucune catégorie n'est fournie
        if 'category' not in update_data or update_data.get('category') is None:
            try:
                # Classifier automatiquement la nouvelle description
                X = vectorizer.transform([update_data['description']])
                predicted_category = model.predict(X)[0]
                update_data['category'] = predicted_category
            except Exception as e:
                print(f"Erreur lors de la reclassification automatique: {e}")
                # Garder la catégorie existante si la classification échoue
    
    for field, value in update_data.items():
        setattr(transaction, field, value)

    db.commit()
    db.refresh(transaction)
    return transaction

@router.delete("/transactions/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprimer une transaction et ses attachments"""
    # Récupérer la transaction
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")

    # Supprimer les tickets associés
    db.query(Ticket).filter(Ticket.transaction_id == transaction_id).delete()

    # Supprimer la transaction
    db.delete(transaction)
    db.commit()

    return {"message": "Transaction supprimée avec succès"}

@router.post("/transactions/{transaction_id}/reclassify")
def reclassify_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reclassifier automatiquement une transaction existante basée sur sa description"""
    
    # Récupérer la transaction
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")

    try:
        # Classifier automatiquement la description actuelle
        X = vectorizer.transform([transaction.description])
        predicted_category = model.predict(X)[0]
        
        # Mettre à jour la catégorie
        transaction.category = predicted_category
        db.commit()
        
        return {
            "message": "Transaction reclassifiée avec succès",
            "new_category": predicted_category
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erreur lors de la reclassification: {str(e)}"
        )

@router.post("/transactions/{transaction_id}/process_ticket/{ticket_id}")
def process_ticket_with_ocr(
    transaction_id: int,
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Traiter un ticket existant avec OCR pour extraire automatiquement des transactions"""
    
    # Vérifier que la transaction appartient à l'utilisateur
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction non trouvée")
    
    # Récupérer le ticket
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id,
        Ticket.transaction_id == transaction_id
    ).first()
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket non trouvé")
    
    # Pour l'instant, on suppose que le file_path contient les données ou un chemin
    # Dans un vrai système, il faudrait lire le fichier depuis le stockage
    # Ici on simule avec un message d'erreur approprié
    raise HTTPException(
        status_code=501, 
        detail="Traitement OCR pour tickets existants nécessite l'accès aux données du fichier. Utilisez le POST transaction avec les données du fichier."
    )