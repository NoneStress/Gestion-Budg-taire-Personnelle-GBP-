import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
import mlflow
import psycopg2
import joblib
import os
from dotenv import load_dotenv

load_dotenv()

db_uri = os.getenv("MLFLOW_BACKEND_STORE_URI")
mlflow.set_tracking_uri(db_uri)

# Artifact store : où stocker les fichiers
artifact_uri = os.getenv("MLFLOW_ARTIFACT_STORE_URI")
os.makedirs(artifact_uri, exist_ok=True)
os.environ["MLFLOW_ARTIFACT_ROOT"] = artifact_uri

# configs MlFLOW
# mlflow.set_tracking_uri(os.environ["MLFLOW_TRACKING_URI"])
mlflow.set_experiment("MLOps File Rouge -v4")

models_path = "C:/Users/lenovo/Desktop/file_rouge_new/ml_project/models"
data_path = "C:/Users/lenovo/Desktop/file_rouge_new/ml_project/data/dataset_enhanced_fr.csv"

french_stopwords = [
    "a", "à", "afin", "ah", "ai", "aie", "ainsi", "alors", "après", "as",
    "au", "aucun", "aura", "aussi", "autre", "aux", "avec", "avoir", "bah",
    "beaucoup", "bien", "car", "ce", "cela", "ces", "cet", "cette", "ceux",
    "chaque", "ci", "comme", "d", "dans", "de", "des", "du", "donc",
    "elle", "elles", "en", "encore", "est", "et", "eux",
    "faire", "fait", "fois", "haut", "hors",
    "ici", "il", "ils",
    "je", "jusqu", "l", "la", "le", "les", "leur", "lui",
    "ma", "mais", "me", "même", "mes", "moi", "mon",
    "ne", "ni", "nos", "notre", "nous",
    "on", "ou", "où",
    "par", "pas", "peu", "plus", "pour", "pourquoi", "près",
    "qu", "que", "qui",
    "sa", "se", "ses", "si", "son", "sous", "sur",
    "ta", "te", "tes", "toi", "ton", "toujours", "tout",
    "un", "une", "vos", "votre", "vous", "y"
]

# Parameter grid for GridSearchCV (TfidfVectorizer and MultinomialNB hyperparameters)
param_grid = {
    'tfidf__ngram_range': [(1, 1), (1, 2), (1, 3)],
    'tfidf__min_df': [1, 2, 5],
    'tfidf__max_df': [0.8, 0.9, 1.0],
    'tfidf__max_features': [None, 1000, 2000],
    'clf__alpha': [0.01, 0.05, 0.1, 0.5, 1.0]
}

# Chargement de la dataset
df = pd.read_csv(data_path)

print("Data chargee avec succes ✔")

# Prepare data
X = df['description']
y = df['categories']

# Split data with stratification to maintain category distribution
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Create pipeline and perform grid search for hyperparameter tuning
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(stop_words=french_stopwords, lowercase=True)),
    ('clf', MultinomialNB())
])

# training
grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
# grid_search.fit(X_train, y_train)

# Indiquer explicitement à MLflow où enregistrer/chercher les runs
with mlflow.start_run():
    grid_search.fit(X_train, y_train)

    best_pipeline = grid_search.best_estimator_
    best_params = grid_search.best_params_
    best_score = grid_search.best_score_

    
    mlflow.log_params(best_params)
    mlflow.log_metric("best_accuracy", best_score)
    mlflow.sklearn.log_model(best_pipeline, artifact_path="model")

    # Score sur test set
    test_acc = grid_search.score(X_test, y_test)
    mlflow.log_metric("test_accuracy", test_acc)

print("Best parameters found:", grid_search.best_params_)
print("Best cross-validation score:", grid_search.best_score_)

# best_pipeline = grid_search.best_estimator_
# predictions = best_pipeline.predict(X_test)

# Extract best estimator components
vectorizer = best_pipeline.named_steps['tfidf']
classifier = best_pipeline.named_steps['clf']


# Evaluate model
# y_pred = best_pipeline.predict(X_test)
# accuracy = accuracy_score(y_test, y_pred)
# print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")
# print("\n📊 Classification Report:")
# print(classification_report(y_test, y_pred))

# Test confidence scores on sample data
# print("\n🔍 Sample Confidence Tests:")
# test_samples = ["je suis allé a la pharmacie", "J'ai payé une  tasse de thé", "J'ai regardé un film au cinema", "je suis rentré en taxi"]
# for sample in test_samples:
#     X_test_sample = best_pipeline.predict([sample])
#     prob = best_pipeline.predict_proba(X_test_sample)[0].max() * 100
#     print(f"   '{sample}' → {X_test_sample} ({prob:.1f}% confidence)")


# Save best model and vectorizer
joblib.dump(classifier, f"{models_path}/expense_categorizer_model.pkl")
joblib.dump(vectorizer, f"{models_path}/vectorizer.pkl")
joblib.dump(best_pipeline, f"{models_path}/pipeline.pkl")
joblib.dump(best_pipeline, "C:/Users/lenovo/Desktop/file_rouge_new/ml_models/pipeline.pkl")

print(f"/n✅ Model trained and saved successfully!")

