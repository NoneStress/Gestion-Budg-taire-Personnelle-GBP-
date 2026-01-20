from fastapi import APIRouter, UploadFile, HTTPException, File
from app.services.ocr_service import extract_items, extract_text_from_image
from app.utils.helpers import clean_receipt_lines
from app.db.session import get_db
from app.models.user import Ticket
from sqlalchemy.orm import Session
from fastapi import Depends
from app.dependencies.auth import get_current_user
from app.models.user import User
import json

router = APIRouter()

router = APIRouter()

# @router.get("/")
# def ocr_check():
#     return {"status": "ocr endpoint"}

# @router.post("/extract_text/image")
# async def extract_receipt_from_image(file: UploadFile = File(...)):
#     if not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="Format non supporté")
    
#     image_bytes = await file.read()

#     raw_text = extract_text_from_image(image_bytes)
#     cleaned_text = clean_receipt_lines(raw_text)
#     items = extract_items(cleaned_text)

#     return {"items" : items, 
            # "count" : len(items)}

# @router.post("/extract_raw_text/image")
# async def extract_raw_text_from_image(file: UploadFile = File(...)):
#     """Extrait uniquement le texte brut d'une image pour utilisation dans transactions"""
#     if not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="Format non supporté")
    
#     image_bytes = await file.read()

#     raw_text = extract_text_from_image(image_bytes)

#     return {"raw_text": raw_text}

@router.post("/process_ticket")
async def process_and_store_ticket(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Traite une image avec OCR et stocke les données extraites dans la table ticket"""
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
        # items = extract_items(cleaned_text)
        
        # Stocker dans la table ticket avec les données extraites
        db_ticket = Ticket(
            user_id=current_user.id,  # ✅ Lier le ticket à l'utilisateur
            transaction_id=None,  # Sera défini lors de la création de la transaction
            type=file.content_type,
            file_path=f"processed_{file.filename}",
            data=json.dumps({
                "raw_text": raw_text,
                # "items": items,
                "filename": file.filename,
                "processed": True  # Marqueur pour identifier les tickets traités
            }),
            size=len(image_bytes)
        )
        
        db.add(db_ticket)
        db.commit()
        db.refresh(db_ticket)
        
        return {
            "ticket_id": db_ticket.id,
            "raw_text": raw_text,
            # "items": items,
            # "count": len(items),
            "message": "Ticket traité et stocké avec succès"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du traitement OCR: {str(e)}")


# HTML CSS pour le frontend avec quelques outils de generation
# Pytest pour quelques tests unitaire
# Github action optionnel
# DOCKER contenaire
# Creer des visuels avec PowerBI ou Python



