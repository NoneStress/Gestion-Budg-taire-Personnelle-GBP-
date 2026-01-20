# import easyocr  # Temporarily commented for testing
import numpy as np
import re
import os
from PIL import Image
from io import BytesIO


# Crée un dossier local pour les modèles dans ton projet
model_dir = os.path.join(os.path.dirname(__file__), "easyocr_models")
os.makedirs(model_dir, exist_ok=True)


PRICE_PATTERN = r"(.+?)\s+(\d+[.,]\d{2})\s*€?$"


def extract_text_from_image(image_bytes: bytes) -> list[str]:
    """
    Convertit une image en liste de lignes de texte.
    Mock function for testing - returns sample receipt data
    """
    # Mock OCR result for testing
    return [
        "SUPERMARCHE EXPRESS",
        "Pain 2.50€",
        "Lait 1.20€",
        "Bananes 3.40€",
        "TOTAL: 7.10€"
    ]


# Fonction de separtion des elements de l'image en format article : prix 
def extract_items(lines: list[str]) -> list[dict]:
    items = []

    for line in lines:
        match = re.search(PRICE_PATTERN, line)
        if match:
            label = match.group(1).strip()
            amount = float(match.group(2).replace(",", "."))

            items.append({
                "label": label,
                "amount": amount
            })

    return items



# def extract_text_from_image(image_path):
#     # Initialize OCR reader
#     reader = easyocr.Reader(['fr', 'en'])  # Support French and English
#     """Extract text from an image using OCR."""
#     image = Image.open(image_path)
#     image_np = np.array(image)
#     results = reader.readtext(image_np)
#     extracted_text = ' '.join([text for (_, text, _) in results])
#     return extracted_text

# def categorize_description(description):
#     """Categorize the expense description."""
#     X = vectorizer.transform([description])
#     pred = model.predict(X)[0]
#     prob = model.predict_proba(X)[0].max() * 100
#     return pred, prob

# if __name__ == "__main__":
#     # Example usage
#     image_path = input("Enter the path to the image: ")
#     if os.path.exists(image_path):
#         text = extract_text_from_image(image_path)
#         print(f"Extracted Text: {text}")
#         if text.strip():
#             category, confidence = categorize_description(text)
#             print(f"Predicted Category: {category}")
#             print(f"Confidence: {confidence:.2f}%")
#         else:
#             print("No text extracted from the image.")
#     else:
#         print("Image path does not exist.")

