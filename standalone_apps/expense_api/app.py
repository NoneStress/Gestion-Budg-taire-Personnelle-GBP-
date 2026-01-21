from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="Expense Categorizer API")

# Load the model and vectorizer
model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_project', 'models', 'expense_categorizer_model.pkl')
vectorizer_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_project', 'models', 'vectorizer.pkl')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

class CategorizeRequest(BaseModel):
    description: str

@app.post("/categorize")
def categorize_expense(request: CategorizeRequest):
    description = request.description
    X = vectorizer.transform([description])
    pred = model.predict(X)[0]
    prob = model.predict_proba(X)[0].max() * 100
    return {"category": pred, "confidence": round(prob, 2)}