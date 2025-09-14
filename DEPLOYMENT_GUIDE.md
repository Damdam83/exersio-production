# 🚀 Guide de Déploiement Exersio

## 📋 Étapes de Déploiement Production

### ✅ Étape 1: Git Repository (Terminé)

- [x] Fichiers .gitignore créés
- [x] Repository Git initialisé avec commit initial

---

## 🗄️ Étape 2: Configuration Supabase (PostgreSQL)

### 2.1 Créer le projet Supabase

1. **Aller sur** : https://supabase.com
2. **S'inscrire/Se connecter** avec GitHub recommandé
3. **Créer un nouveau projet** :
   - **Name** : `exersio-production`
   - **Database Password** : Générer et **SAUVEGARDER** ⚠️
   - **Region** : `Europe (West)` pour la France
   - **Plan** : Free (suffisant pour commencer)

### 2.2 Récupérer les informations de connexion

Après création du projet :

1. **Aller dans** : Settings → Database
2. **Noter ces informations** :

   ```
   Database URL: postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```

3. **Aller dans** : Settings → API
4. **Noter ces clés** :
   ```
   Project URL: https://[PROJECT-ID].supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2.3 Configurer les variables d'environnement

1. **Copier** le fichier `.env.production` :

   ```bash
   cd exersio-back
   cp .env.production .env.prod
   ```

2. **Éditer** `.env.prod` avec vos vraies valeurs Supabase

### 2.4 Migrer le schéma vers Supabase

1. **Arrêter** votre base locale :

   ```bash
   # Dans WSL
   cd ~/exersio
   docker compose down
   ```

2. **Configurer** Prisma pour Supabase :

   ```bash
   cd exersio-back

   # Backup de votre .env local
   cp .env .env.local.backup

   # Utiliser la config Supabase temporairement
   cp .env.prod .env

   # Générer le client Prisma
   npx prisma generate

   # Appliquer le schéma à Supabase
   ```

3. **Vérifier** la migration dans Supabase :

   - Aller dans Database → Tables
   - Vérifier que toutes vos tables sont présentes

4. **Restaurer** votre .env local :
   ```bash
   cp .env.local.backup .env
   ```

### 2.5 Test de connexion (optionnel)

Pour tester la connexion Supabase :

```bash
# Temporary test avec Supabase
npm run start:dev
```

---

## 📧 Étape 3: Configuration Gmail SMTP

### 3.1 Activer l'authentification 2 facteurs

1. **Aller sur** : https://myaccount.google.com/security
2. **Activer** l'authentification à 2 facteurs si pas déjà fait

### 3.2 Générer un mot de passe d'application

1. **Aller sur** : https://myaccount.google.com/apppasswords
2. **Sélectionner** "Mail" comme app
3. **Générer** le mot de passe
4. **Copier et sauvegarder** ce mot de passe ⚠️

### 3.3 Configurer les variables email

Dans `.env.prod` :

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="votre-email@gmail.com"
SMTP_PASS="[le-mot-de-passe-app-généré]"
```

---

## 🚂 Étape 4: Déploiement Backend sur Railway

### 4.1 Créer le projet sur Railway

1. **Aller sur** : https://railway.app
2. **S'inscrire/Se connecter** avec GitHub
3. **Cliquer** "New Project" → "Deploy from GitHub repo"
4. **Sélectionner** ce repository (`Exersio/front`)
5. **Choisir** le dossier `exersio-back` comme source

### 4.2 Configuration automatique Railway

Railway détecte automatiquement :

- **Runtime** : Node.js (package.json détecté)
- **Build Command** : `npm run build`
- **Start Command** : `npm start`
- **Port** : 3000 (ou variable PORT)

### 4.3 Variables d'environnement Railway

Dans Railway Dashboard → Settings → Variables, ajouter :

```env
# Database Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Application
JWT_SECRET=[GENERATED-SECRET]
NODE_ENV=production
PORT=3000

# Email Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=[APP-PASSWORD-16-CHARS]

# Frontend URL (sera configuré après Vercel)
CORS_ORIGIN=https://[YOUR-APP].vercel.app
```

### 4.4 Premier déploiement

1. **Push** votre code sur GitHub (déjà fait ✅)
2. **Railway** build automatiquement
3. **Récupérer** l'URL de déploiement : `https://[APP-NAME].railway.app`
4. **Tester** l'API : `https://[APP-NAME].railway.app/api/health`

### 4.5 Appliquer le schéma Prisma

Une fois déployé, il faut appliquer le schéma à Supabase :

1. **Option 1 - Local avec DB prod** :

   ```bash
   cd exersio-back
   # Utiliser temporairement la DB prod
   cp .env.production .env
   npx prisma db push
   cp .env.local.backup .env  # restaurer config locale
   ```

2. **Option 2 - Railway CLI** (recommandé) :

   ```bash
   # Installer Railway CLI
   npm install -g @railway/cli

   # Se connecter
   railway login

   # Exécuter Prisma sur Railway
   railway run npx prisma db push
   ```

---

## 🌐 Étape 5: Déploiement Frontend sur Vercel

### 5.1 Créer le projet sur Vercel

1. **Aller sur** : https://vercel.com
2. **S'inscrire/Se connecter** avec GitHub
3. **Cliquer** "New Project"
4. **Import** depuis GitHub → Sélectionner ce repository
5. **Configurer** :
   - **Framework Preset** : Vite (détecté automatiquement)
   - **Root Directory** : `exersio-front`
   - **Build Command** : `npm run build` (détecté)
   - **Output Directory** : `dist` (détecté)
   - **Install Command** : `npm install` (détecté)

### 5.2 Variables d'environnement Vercel

Dans Vercel Dashboard → Settings → Environment Variables :

```env
# URL Backend Railway (remplacer après déploiement Railway)
VITE_API_URL=https://[YOUR-RAILWAY-APP].railway.app/api

# Configuration app
VITE_APP_NAME=Exersio
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
```

### 5.3 Premier déploiement

1. **Cliquer** "Deploy" sur Vercel
2. **Attendre** la build (2-5 minutes)
3. **Récupérer** l'URL : `https://[YOUR-APP].vercel.app`
4. **Tester** l'application

### 5.4 Mettre à jour CORS Backend

Une fois Vercel déployé, il faut autoriser le domaine dans Railway :

**Dans Railway** → Variables → Modifier :

```env
CORS_ORIGIN=https://[YOUR-APP].vercel.app
```

### 5.5 Configuration domaine personnalisé (optionnel)

Si vous avez un domaine :

1. **Vercel** → Settings → Domains
2. **Add Domain** → Saisir votre domaine
3. **Configurer DNS** selon instructions Vercel

---

## 🌍 Étape 6: Configuration Domaine (Optionnel)

### 6.1 Choix du domaine

**Option 1: URLs gratuites (recommandé) ✅**

- Frontend : `https://[votre-app].vercel.app`
- Backend : `https://[votre-app].railway.app`
- ✅ Gratuit, HTTPS automatique, prêt immédiatement

**Option 2: Domaine personnalisé 💰**

- Frontend : `https://exersio.com`
- Backend : `https://api.exersio.com`
- 💰 ~10-15€/an + configuration DNS

### 6.2 Si domaine personnalisé - Acheter le domaine

Registrars recommandés :

- **Namecheap** : https://www.namecheap.com (€9-12/an)
- **Cloudflare** : https://www.cloudflare.com (€8-10/an)
- **OVH** : https://www.ovh.com (€10-15/an)

### 6.3 Configuration DNS

**Pour le frontend (Vercel) :**

1. **Vercel Dashboard** → Settings → Domains
2. **Add Domain** → Saisir `exersio.com`
3. **Suivre** les instructions DNS (CNAME ou A record)

**Pour le backend (Railway) :**

1. **Railway Dashboard** → Settings → Domains
2. **Custom Domain** → Saisir `api.exersio.com`
3. **Configurer** CNAME chez votre registrar

### 6.4 Exemple configuration DNS

```
Type    Name        Value
CNAME   @           cname.vercel-dns.com
CNAME   api         [your-app].railway.app
```

### 6.5 Mettre à jour les variables après domaine

**Variables à changer :**

- Railway `CORS_ORIGIN` → `https://exersio.com`
- Vercel `VITE_API_URL` → `https://api.exersio.com/api`

---

## ✅ Checklist Finale

### Tests de Fonctionnement

- [ ] Backend accessible via URL Railway
- [ ] Frontend accessible via URL Vercel
- [ ] Connexion à la base Supabase OK
- [ ] Login/Register fonctionnel
- [ ] Emails de confirmation envoyés
- [ ] CRUD exercices/sessions OK
- [ ] Mode offline/online sync OK

### Sécurité Production

- [ ] JWT_SECRET différent de dev
- [ ] CORS_ORIGIN configuré pour Vercel
- [ ] Clés Supabase en variables d'environnement
- [ ] Mot de passe Gmail app-specific

---

## 🚨 Points d'Attention

### Performance

- **Free tiers** : Railway (500h/mois), Vercel (100GB bandwidth)
- **Base Supabase** : 500MB storage, 2GB bandwidth

### Monitoring

- Surveiller les quotas des services gratuits
- Logs disponibles dans chaque dashboard

### Backup

- Supabase : backup automatique 7 jours sur free tier
- Code : sauvegardé sur GitHub

---

_Guide généré automatiquement - Mis à jour lors du déploiement_
