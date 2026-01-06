import os
import joblib

# Load the model and vectorizer
model_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'ml_project', 'models', 'expense_categorizer_model.pkl')
vectorizer_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'ml_project', 'models', 'vectorizer.pkl')

model = joblib.load(model_path)
vectorizer = joblib.load(vectorizer_path)
