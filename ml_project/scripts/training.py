import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report
import joblib

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

# Tester avec un autre model eventuellement
# Hugging Face Transformers (ou bibliothèques basées sur les “transformers” / embeddings modernes)

# Si tu cherches des représentations plus “riches” que TF-IDF — c.-à-d. des embeddings contextuels : pour capturer le sens, les synonymes, les relations sémantiques — Transformers offre des modèles pré-entraînés (BERT, RoBERTa, etc.) très puissants pour classification, similarité, embedding de phrases/documents. 
# ActiveTech Systems
# +2
# textpulse
# +2

# Cela peut donner de bien meilleurs résultats que TF-IDF + modèle classique, surtout si la sémantique / le contexte a de l’importance (dans ton cas, les descriptions immobilières, sujets NLP, etc.).


df = pd.read_csv("../data/dataset_enhanced_fr.csv")

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

grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
grid_search.fit(X_train, y_train)

print("Best parameters found:", grid_search.best_params_)
print("Best cross-validation score:", grid_search.best_score_)

# Extract best estimator components
best_vectorizer = grid_search.best_estimator_.named_steps['tfidf']
best_clf = grid_search.best_estimator_.named_steps['clf']

# Evaluate model
y_pred = grid_search.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")
print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# Test confidence scores on sample data
print("\n🔍 Sample Confidence Tests:")
test_samples = ["je suis allé a la pharmacie", "J'ai payé une  tasse de thé", "J'ai regardé un film au cinema", "je suis rentré en taxi"]
for sample in test_samples:
    X_test_sample = best_vectorizer.transform([sample])
    pred = best_clf.predict(X_test_sample)[0]
    prob = best_clf.predict_proba(X_test_sample)[0].max() * 100
    print(f"   '{sample}' → {pred} ({prob:.1f}% confidence)")

# ajouter cinema au dataset sous categorie divertiissement 
# ameliorer la categorie cinema pour demain 

# Save best model and vectorizer
# joblib.dump(best_clf, "models/expense_categorizer_model.pkl")
# joblib.dump(best_vectorizer, "models/vectorizer.pkl")

# print(f"\n✅ Model trained and saved successfully!")
# print(f"📈 Training samples: {len(df)}")
# print(f"🏷️  Categories: {', '.join(df['categories'].unique())}")

# Dataset ameliore pour l'instant avec de meilleures resultats et pret a etre teste avec streamlit demain mation 
# Prochaine etape mettre en place l'Api via FastAPI "Creer uune route pour tester le modele avec swagger"
# streamlite 
# OCR 
# Frontend