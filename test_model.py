import joblib
import os

model_path = 'ml_project/models/expense_categorizer_model.pkl'
vectorizer_path = 'ml_project/models/vectorizer.pkl'

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)

print("Model classes:", model.classes_)

test_descriptions = ["bought groceries", "paid for taxi", "restaurant bill"]

for desc in test_descriptions:
    X = vectorizer.transform([desc])
    pred = model.predict(X)[0]
    prob = model.predict_proba(X)[0].max() * 100
    print(f"Description: {desc}")
    print(f"Prediction: {pred}, Confidence: {prob}")
    print(f"Proba: {model.predict_proba(X)[0]}")
    print()