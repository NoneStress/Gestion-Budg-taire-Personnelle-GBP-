from fastapi import APIRouter, UploadFile, HTTPException, File
from app.services.ocr_service import extract_items, extract_text_from_image
from app.db.session import get_db
from app.models.user import Ticket
from sqlalchemy.orm import Session
from fastapi import Depends
from app.dependencies.auth import get_current_user
from app.models.user import User
import json

router = APIRouter()

@router.post("/process_ticket")
async def process_and_store_ticket(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Traite une image avec OCR et stocke les données extraites.
    
    Retourne:
    {
        "ticket_id": 123,
        "raw_text": ["ligne1", "ligne2", ...],
        "items": [
            {"label": "Pain", "amount": 2.50},
            {"label": "Essence", "amount": 45.00}
        ],
        "message": "Ticket traité et stocké avec succès"
    }
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Format non supporté")
    
    # Lire les bytes de l'image
    image_bytes = await file.read()
    
    try:
        # Extraire le texte brut
        raw_text = extract_text_from_image(image_bytes)
        
        # Nettoyer le texte
        # cleaned_text = clean_receipt_lines(raw_text)
        
        # Extraire les items
        items = extract_items(raw_text)
        
        # ✅ AMÉLIORATION: Formater les items pour correspondre au frontend
        formatted_items = []
        for item in items:
            formatted_items.append({
                "label": item.get("label", item.get("description", "")),
                "amount": float(item.get("amount", 0))
            })
        
        # Stocker dans la table ticket avec les données extraites
        db_ticket = Ticket(
            user_id=current_user.id,
            transaction_id=None,  # Sera défini lors de la création de transaction
            type=file.content_type,
            file_path=f"processed_{file.filename}",
            data=json.dumps({
                "raw_text": raw_text,
                "items": formatted_items,  # ✅ Format standardisé
                "filename": file.filename,
                "processed": True,
                "processed_items": []  # ✅ Nouveau: liste des items déjà traités
            }),
            size=len(image_bytes)
        )
        
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        
        # ✅ Retourner le format attendu par le frontend
        return {
            "ticket_id": db_ticket.id,
            "raw_text": raw_text,
            "items": formatted_items,  # ✅ Format: [{"label": "...", "amount": ...}]
            "message": "Ticket traité et stocké avec succès"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement OCR: {str(e)}")



# Pytest pour quelques tests unitaire
# Github action optionnel
# DOCKER contenaire
# Creer des visuels avec PowerBI ou Python