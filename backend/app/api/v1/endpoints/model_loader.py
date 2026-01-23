import os
import joblib
from dotenv import load_dotenv

load_dotenv()
# Load the pipeline
# pipe_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'backend', 'ml_models', 'pipeline.pkl')
pipe_path = os.getenv("MODEL_PATH")
pipeline = joblib.load(pipe_path)
print("✅ pipeline loaded succesfully")

# model_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'ml_project', 'models', 'expense_categorizer_model.pkl')
# vectorizer_path = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', 'ml_project', 'models', 'vectorizer.pkl')
# model = joblib.load(model_path)
# vectorizer = joblib.load(vectorizer_path)




