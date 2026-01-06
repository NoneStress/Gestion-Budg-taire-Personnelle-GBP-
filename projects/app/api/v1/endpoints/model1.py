import logging
from pydantic import BaseModel
from .model_loader import vectorizer, model
from fastapi import APIRouter
# from app.schemas.classify import TextInput, ClassificationResponse
# from app.services.classify_service import classify_text

logger = logging.getLogger(__name__)

router = APIRouter()


class CategorizeRequest(BaseModel):
    description: str


@router.post("/classify")
def classify_endpoint(request: CategorizeRequest):
    logger.info(f"Received description: {request.description}")
    description = request.description
    X = vectorizer.transform([description])
    logger.info(f"Transformed X shape: {X.shape}")
    pred = model.predict(X)[0]
    prob = model.predict_proba(X)[0].max() * 100
    logger.info(f"Prediction: {pred}, Confidence: {prob}")
    return {"category": pred, "confidence": round(prob, 2)}


#Travailler avec des variables d'environnement plus tard