# Standalone Applications

Ce dossier contient les applications autonomes du projet de gestion financière.

## Applications disponibles

### 1. expense_api
API FastAPI pour la catégorisation automatique des dépenses.
- **Technologies**: FastAPI, scikit-learn, joblib
- **Démarrage**: `uvicorn app:app --reload`
- **Port par défaut**: 8000

### 2. expense_categorizer_app
Application Streamlit pour la catégorisation des dépenses avec interface utilisateur.
- **Technologies**: Streamlit, scikit-learn, joblib
- **Démarrage**: `streamlit run app.py`

### 3. gradient-generator
Générateur de gradients CSS interactif.
- **Technologies**: HTML, CSS, JavaScript
- **Démarrage**: Ouvrir `index.html` dans un navigateur

### 4. ocr_app
Application pour l'extraction de texte à partir d'images (OCR).
- **Technologies**: À définir dans requirements.txt

## Structure du projet

```
standalone_apps/
├── expense_api/              # API de catégorisation
├── expense_categorizer_app/  # Interface Streamlit
├── gradient-generator/       # Générateur de gradients
└── ocr_app/                  # Application OCR
```

## Modèles ML

Les applications utilisent les modèles entraînés situés dans `../../ml_project/models/`.