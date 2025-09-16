# 🔧 Configuration des Environnements Exersio

Documentation complète des fichiers d'environnement et commandes utiles.

## 📁 Structure des Fichiers d'Environnement

### Frontend (`exersio-front/`)

| Fichier | Usage | Description |
|---------|-------|-------------|
| `.env` | **Développement principal** | Configuration locale par défaut |
| `.env.development` | **Développement explicite** | Mode développement avec debug activé |
| `.env.production` | **Production** | Mode production avec URL Render |
| `.env.mobile` | **Mobile/Émulateur** | Configuration pour tests mobiles locaux |

### Backend (`exersio-back/`)

| Fichier | Usage | Description |
|---------|-------|-------------|
| `.env` | **Développement local** | Base de données locale + JWT dev |

---

## 🎯 Configurations Actuelles

### 🖥️ Frontend - Développement Local
**Fichier**: `.env` + `.env.development`
```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Exersio
VITE_APP_VERSION=0.1.0
VITE_DEBUG=true
```

### 🚀 Frontend - Production
**Fichier**: `.env.production`
```bash
VITE_API_URL=https://exersio-production.onrender.com/api
VITE_APP_NAME=Exersio
VITE_APP_VERSION=0.1.0
VITE_DEBUG=false
```

### 📱 Frontend - Mobile Local
**Fichier**: `.env.mobile`
```bash
VITE_API_URL=http://10.0.2.2:3000/api  # Émulateur Android → localhost
```

### 🗄️ Backend - Développement Local
**Fichier**: `.env`
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/exersio?schema=public"
JWT_SECRET="dev_super_secret_change_me"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

**✅ CONFIGURATION CORRECTE**: Port PostgreSQL 5433 pour éviter conflit avec instance système

---

## 🔨 Commandes Principales

### 📦 Installation et Setup
```bash
# Backend
cd exersio-back
npm install
npx prisma generate
npx prisma db push

# Frontend
cd exersio-front
npm install
```

### 🚀 Développement Local
```bash
# 1. Démarrer base de données (WSL)
wsl -- bash -c "cd ~/exersio && docker compose up -d"

# 2. Backend
cd exersio-back
npm run start:dev

# 3. Frontend
cd exersio-front
npm run dev
```

### 🏗️ Build et Tests

#### Frontend
```bash
cd exersio-front

# Build développement (utilise .env)
npm run build

# Build production (utilise .env.production)
npx vite build --mode production

# Tests
npm run test
npm run test:coverage
```

#### Backend
```bash
cd exersio-back

# Build
npm run build

# Tests
npm run test
npm run test:e2e
```

### 📱 Mobile Android

#### Setup Initial
```bash
cd exersio-front

# Initialiser Capacitor (une seule fois)
npm run mobile:init

# Ajouter plateforme Android (une seule fois)
npm run mobile:add
```

#### Build et Test Mobile
```bash
cd exersio-front

# Build mobile avec configuration production
npx vite build --mode production
npx cap sync android

# Build APK debug
cd android
./gradlew assembleDebug

# APK générée: android/app/build/outputs/apk/debug/app-debug.apk

# Ouvrir Android Studio
npm run mobile:open
```

### 🌐 Déploiement Production

#### Frontend (Vercel)
```bash
cd exersio-front
npx vite build --mode production
# Auto-déployé via GitHub → Vercel
```

#### Backend (Render)
```bash
cd exersio-back
npm run build
# Auto-déployé via GitHub → Render
```

---

## 🔍 Debugging et Logs

### Logs Backend (Winston)
```bash
cd exersio-back/logs

# Tous les logs
tail -f combined-$(date +%Y-%m-%d).log

# Erreurs uniquement
tail -f error-$(date +%Y-%m-%d).log

# Authentification
tail -f auth-$(date +%Y-%m-%d).log

# Emails
tail -f email-$(date +%Y-%m-%d).log
```

### Debug Frontend
```bash
# Console développement
npm run dev
# Puis F12 → Console

# Debug mobile
adb logcat | grep Capacitor
```

---

## 🌍 URLs Importantes

### 🚀 Production
- **Frontend**: https://exersio-frontend.vercel.app
- **Backend**: https://exersio-production.onrender.com/api
- **Database**: PostgreSQL sur Render

### 🔧 Développement Local
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000/api
- **Database**: postgresql://localhost:5433/exersio

---

## 🚨 Corrections Nécessaires

### 1. **Port PostgreSQL Backend** ✅
**Configuration**: Port 5433 utilisé pour éviter conflit avec PostgreSQL système
**Status**: Correct, pas de modification nécessaire

### 2. **Cohérence des Environnements**
- Vérifier que tous les `.env.*` sont cohérents
- Documenter clairement quand utiliser chaque fichier

### 3. **Scripts NPM Manquants**
Ajouter dans `package.json` frontend:
```json
{
  "scripts": {
    "build:dev": "vite build --mode development",
    "build:prod": "vite build --mode production",
    "mobile:build-prod": "npm run build:prod && npx cap sync android && cd android && ./gradlew assembleDebug"
  }
}
```

---

## 💡 Bonnes Pratiques

1. **Toujours utiliser le bon mode de build**:
   - Développement: `npm run build` ou `--mode development`
   - Production: `--mode production`

2. **Mobile toujours en mode production** pour tester la vraie API

3. **Tester localement avant déploiement**:
   ```bash
   npm run build:prod
   npm run preview
   ```

4. **Branches Git**:
   - `development` → Tests et développements
   - `master` → Production protégée

---

*Dernière mise à jour: $(date) - Claude Code*