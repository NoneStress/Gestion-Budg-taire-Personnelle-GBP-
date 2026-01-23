# app/services/ocr_service.py
from PIL import Image
import numpy as np
from io import BytesIO
import re

# Initialiser le reader OCR UNE SEULE FOIS (ne pas le faire à chaque appel)

def extract_text_from_image(image_bytes):
    """
    Extract text from image bytes using OCR.
    
    Args:
        image_bytes: bytes - Les données binaires de l'image (pas un chemin!)
    
    Returns:
        str - Le texte extrait de l'image
    """
    import easyocr
    reader = easyocr.Reader(['fr', 'en'])
    try:
        # ✅ Convertir les bytes en image PIL
        # ❌ NE PAS faire: image_bytes.decode('utf-8')
        image = Image.open(BytesIO(image_bytes))
        
        # Convertir en array numpy pour easyocr
        image_np = np.array(image)
        
        # Faire l'OCR
        results = reader.readtext(image_np)
        
        # Extraire le texte
        extracted_text = ' '.join([text for (_, text, _) in results])
        
        return extracted_text
    
    except Exception as e:
        raise Exception(f"Erreur extraction OCR: {str(e)}")


def extract_items(text):
    items = []

    if not text or len(text.strip()) == 0:
        return items

    # On peut ignorer les lignes, on scanne tout le texte
    pattern = r'(\d+)\s+([A-ZÀ-ÿ0-9\s]+?)\s+(\d+[.,]\d{2})'
    
    matches = re.findall(pattern, text)
    
    for _, description, amount_str in matches:
        description = description.strip()
        amount_str = amount_str.replace(',', '.')
        try:
            amount = float(amount_str)
            items.append({
                "label": description,
                "amount": amount,
                "description": description
            })
        except ValueError:
            continue

    return items
