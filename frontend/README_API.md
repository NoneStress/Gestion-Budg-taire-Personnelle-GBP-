# Application de Gestion Financière

Application React complète de gestion des finances personnelles avec authentification et API backend.

## 🚀 Fonctionnalités

### Authentification
- ✅ Inscription avec email et mot de passe (min 8 caractères)
- ✅ Connexion avec JWT token
- ✅ Protection des routes
- ✅ Déconnexion

### Gestion des Transactions
- ✅ Ajout de transactions (revenus/dépenses)
- ✅ Catégorisation automatique
- ✅ Suppression de transactions
- ✅ Filtres par type, catégorie, date

### Gestion des Budgets
- ✅ Création de budgets mensuels par catégorie
- ✅ Suivi en temps réel des dépenses
- ✅ Alertes automatiques (seuils configurables)
- ✅ Visualisation de l'avancement

### Dashboard
- ✅ Résumé des revenus/dépenses
- ✅ Graphiques d'évolution
- ✅ Analyse par catégorie
- ✅ Statistiques détaillées

## 📋 Prérequis

- Node.js >= 18
- Backend API running sur `http://localhost:8000` (ou configuré via `.env`)

## ⚙️ Configuration

1. Copiez le fichier `.env.example` en `.env` :
```bash
cp .env.example .env
```

2. Configurez l'URL de l'API dans `.env` :
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🛠️ Installation

```bash
pnpm install
```

## 🚀 Démarrage

```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:5173`

## 📡 Endpoints API utilisés

### Authentication
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/logout` - Déconnexion
- `GET /api/v1/auth/me` - Informations utilisateur

### Transactions
- `GET /api/v1/api/transactions` - Liste des transactions
- `POST /api/v1/api/transactions` - Créer une transaction
- `PUT /api/v1/api/transactions/{id}` - Modifier une transaction
- `DELETE /api/v1/api/transactions/{id}` - Supprimer une transaction

### Budgets
- `GET /api/v1/api/budgets` - Liste des budgets
- `POST /api/v1/api/budgets` - Créer un budget
- `PUT /api/v1/api/budgets/{id}` - Modifier un budget
- `DELETE /api/v1/api/budgets/{id}` - Supprimer un budget
- `GET /api/v1/api/budgets/status` - Statut des budgets

### Dashboard
- `GET /api/v1/api/dashboard/summary` - Résumé du dashboard
- `GET /api/v1/api/categories/analysis` - Analyse par catégorie

## 🔐 Authentification

L'application utilise un système JWT Bearer Token :
- Le token est stocké dans `localStorage` sous la clé `finance_access_token`
- Toutes les requêtes authentifiées incluent le header `Authorization: Bearer {token}`
- En cas d'erreur 401, l'utilisateur est redirigé vers `/login`

## 📁 Structure du projet

```
src/
├── app/
│   ├── components/         # Composants React
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── MainAppAPI.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ...
│   ├── contexts/          # Contextes React
│   │   └── AuthContext.tsx
│   ├── services/          # Services API
│   │   └── api.ts
│   ├── types/             # Types TypeScript
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── finance.ts
│   ├── config/            # Configuration
│   │   └── api.ts
│   └── App.tsx           # Composant principal
```

## 🎨 Technologies utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Radix UI** - Composants UI
- **Recharts** - Graphiques
- **Sonner** - Notifications toast
- **Lucide React** - Icônes

## 🔄 Gestion de l'état

- **AuthContext** - Gestion de l'authentification
- **API Service** - Centralisation des appels API
- **React State** - État local des composants

## 📝 Notes de développement

### Validation côté client
- Email valide requis
- Mot de passe minimum 8 caractères
- Montants positifs
- Dates valides

### Gestion des erreurs
- Messages d'erreur explicites
- Toast notifications pour les actions
- Redirection automatique en cas d'erreur d'authentification

### Performance
- Appels API optimisés
- Chargement lazy des données
- Bouton "Actualiser" pour recharger manuellement

## 🐛 Debug

En cas de problème de connexion à l'API :
1. Vérifier que le backend est démarré
2. Vérifier l'URL dans `.env`
3. Vérifier les logs dans la console du navigateur
4. Vérifier le Network tab des DevTools

## 📄 License

MIT
