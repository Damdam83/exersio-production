# 📋 Plan de Déploiement Production - Version 1.1.0

**Date de création** : 04/11/2025
**Branche source** : `feat/next-features` (71 commits)
**Branche cible** : `development` → `master`
**Version actuelle prod** : 1.0.0
**Nouvelle version** : 1.1.0

---

## 🎯 Résumé des Changements Majeurs

### Nouvelles Fonctionnalités (27 features)
1. ✅ **Internationalisation FR/EN** - 8 pages traduites complètement
2. ✅ **Splash Screen** - Image officielle + animation + version check
3. ✅ **RGPD Complet** - CGU, Politique confidentialité, Suppression compte
4. ✅ **Sécurité mot de passe** - Indicateur force, toggle show/hide
5. ✅ **Mobile UX Phases 2-4** - Toutes pages optimisées responsive
6. ✅ **Système multi-sport** - 5 sports avec catégories DB
7. ✅ **Flèches multi-types** - 5 types avec courbes Bézier
8. ✅ **Notifications système** - Pagination, EventEmitter, admin
9. ✅ **Mode offline complet** - IndexedDB + synchronisation
10. ✅ **Critères de réussite** - Champ exercices avec UI

### Correctifs Critiques (15+ fixes)
- Fix boucles infinies API (auth/refresh, exercises)
- Fix localStorage pollué
- Fix double "(Copie)" dans noms
- Fix erreur 500 partage exercice
- Fix scope par défaut exercices
- Fix positionnement flèches terrain
- Fix responsive mobile (toasts, spacing)

---

## 🗄️ Changements Base de Données (CRITIQUE)

### Nouvelles Tables/Colonnes Prisma

**⚠️ MIGRATIONS REQUISES - Backup obligatoire avant !**

#### 1. Table `Sport` (nouvelle)
```prisma
model Sport {
  id                String   @id @default(cuid())
  name              String   @unique
  slug              String   @unique
  icon              String?
  order             Int      @default(0)
  exerciseCategories ExerciseCategory[]
  ageCategories     AgeCategory[]
  exercises         Exercise[]
  sessions          Session[]
  users             User[]   @relation("UserPreferredSport")
}
```

#### 2. Table `ExerciseCategory` (modifiée)
- ✅ Ajout `sportId String` + relation Sport
- ✅ Ajout `@@unique([slug, sportId])`

#### 3. Table `AgeCategory` (modifiée)
- ✅ Ajout `sportId String` + relation Sport
- ✅ Ajout `@@unique([slug, sportId])`

#### 4. Table `Exercise` (modifiée)
- ✅ Ajout `successCriteria String[]` (critères de réussite)
- ✅ Ajout `sportId String?` + relation Sport
- ✅ Ajout `sportRef String?` (legacy)
- ✅ Ajout `ageCategoryId String?` + relation AgeCategory

#### 5. Table `Session` (modifiée)
- ✅ Ajout `sportId String?` + relation Sport
- ✅ Ajout `sportRef String?` (legacy)

#### 6. Table `User` (modifiée)
- ✅ Ajout `preferredSportId String?` + relation Sport
- ✅ Ajout `acceptedTerms Boolean @default(false)` (RGPD)
- ✅ Modifié `emailConfirmed Boolean @default(false)`

#### 7. Aucun changement aux tables
- `Notification` - Inchangée
- `UserNotificationSettings` - Inchangée
- `UserPushToken` - Inchangée
- `Club` - Inchangée

### Script de Migration

**Commande Render** :
```bash
# 1. Backup base de données OBLIGATOIRE
pg_dump $DATABASE_URL > backup_before_1.1.0.sql

# 2. Appliquer le schema Prisma
npx prisma db push

# 3. Seed des sports et catégories
npm run seed:sports
```

**⚠️ DONNÉES EXISTANTES** :
- Les exercices/sessions sans `sportId` restent valides (champ optionnel)
- Les catégories existantes doivent être migrées manuellement
- Backup permet rollback si problème

---

## 📦 Changements Dependencies

### Backend (`exersio-back/package.json`)
```json
{
  "scripts": {
    "seed:sports": "tsx prisma/seed-sports.ts"  // NOUVEAU
  }
}
```
- Aucune nouvelle dépendance critique

### Frontend (`exersio-front/package.json`)
```json
{
  "dependencies": {
    "@capacitor/splash-screen": "^7.0.3",  // NOUVEAU
    "i18next": "^25.6.0",                  // NOUVEAU
    "i18next-browser-languagedetector": "^8.2.0",  // NOUVEAU
    "react-i18next": "^16.2.3"             // NOUVEAU
  }
}
```

**Impact** : +3 nouvelles dépendances i18n (~200KB gzipped)

---

## 🔧 Variables d'Environnement

### Backend (Render)
**Aucune nouvelle variable requise** ✅

Variables existantes à vérifier :
- `DATABASE_URL` - OK
- `JWT_SECRET` - OK
- `SMTP_*` - OK (Gmail configuré)
- `FRONTEND_URL` - OK
- `CORS_ORIGIN` - ⚠️ Vérifier `capacitor://localhost` présent

### Frontend (Vercel)
**Aucune nouvelle variable requise** ✅

Variables existantes :
- `VITE_API_BASE_URL` - OK

---

## 🚀 Plan d'Exécution Étape par Étape

### Phase 1 : Préparation (30 min)

**1.1 Tests locaux** ✅
- [x] Frontend build réussi
- [x] Backend build réussi
- [x] Tests unitaires passent
- [ ] Tests E2E critiques

**1.2 Backup Production**
```bash
# Backup base de données Render
heroku pg:backups:capture --app exersio-production
# OU via Render dashboard
```

**1.3 Documentation**
- [x] PLAN-DEPLOIEMENT-PRODUCTION.md créé
- [x] CLAUDE.md mis à jour
- [ ] Release notes préparées

---

### Phase 2 : Merge vers Development (15 min)

```bash
# 1. Checkout development
git checkout development

# 2. Pull derniers changements
git pull origin development

# 3. Merge feat/next-features
git merge feat/next-features --no-ff -m "chore: merge feat/next-features into development

71 commits merged with major features:
- Internationalisation FR/EN complete
- Splash screen + version check system
- RGPD compliance (CGU, privacy, account deletion)
- Mobile UX optimization (all pages)
- Multi-sport system with DB relations
- Offline mode with IndexedDB
- Notifications system improvements

Version bump: 1.0.0 → 1.1.0"

# 4. Vérifier aucun conflit
git status

# 5. Push development
git push origin development
```

---

### Phase 3 : Tests sur Development (30 min)

**Backend Development** :
- [ ] Déployer sur environnement de staging (si disponible)
- [ ] Vérifier endpoints `/api/app/version` et `/api/app/maintenance`
- [ ] Tester authentification + email confirmation
- [ ] Tester système notifications
- [ ] Vérifier logs Winston

**Frontend Development** :
- [ ] Déployer sur Vercel preview
- [ ] Tester splash screen
- [ ] Tester i18n FR/EN
- [ ] Tester responsive mobile
- [ ] Vérifier mode offline

---

### Phase 4 : Merge vers Master (15 min)

```bash
# 1. Checkout master
git checkout master

# 2. Pull derniers changements
git pull origin master

# 3. Merge development
git merge development --no-ff -m "release: version 1.1.0

Major release with 71 commits including:

Features:
- Internationalization FR/EN (8 pages)
- Splash screen with version check
- RGPD compliance complete
- Password security enhancements
- Mobile UX optimization (all pages)
- Multi-sport system with database
- Advanced notifications system

Fixes:
- API infinite loops resolved
- Offline mode IndexedDB caching
- Exercise sharing error 500
- Mobile responsive issues

Breaking Changes:
- Prisma schema migrations required
- New Sport table + relations
- successCriteria field added to Exercise

Database migrations:
1. Backup production database
2. npx prisma db push
3. npm run seed:sports

Version: 1.0.0 → 1.1.0"

# 4. Tag la release
git tag -a v1.1.0 -m "Release v1.1.0 - Internationalization, Splash Screen, RGPD, Mobile UX"

# 5. Push master + tags
git push origin master
git push origin v1.1.0
```

---

### Phase 5 : Déploiement Backend (30 min)

#### 5.1 Render - Backend

**Ordre d'exécution** :
1. **Backup DB** (CRITIQUE)
   ```bash
   # Via Render dashboard ou CLI
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Variables d'environnement**
   - Vérifier `CORS_ORIGIN` contient `capacitor://localhost`
   - Toutes autres variables OK

3. **Déploiement automatique**
   - Push master déclenche auto-deploy Render
   - Attendre fin build (~5-10 min)

4. **Migration Prisma**
   ```bash
   # Via Render Shell
   npx prisma db push
   npm run seed:sports
   ```

5. **Vérifications**
   - GET https://exersio-production.onrender.com/api/health
   - GET https://exersio-production.onrender.com/api/app/version
   - POST https://exersio-production.onrender.com/api/auth/login

---

### Phase 6 : Déploiement Frontend (15 min)

#### 6.1 Vercel - Frontend

**Ordre d'exécution** :
1. **Déploiement automatique**
   - Push master déclenche auto-deploy Vercel
   - Attendre fin build (~3-5 min)

2. **Vérifications**
   - Splash screen s'affiche correctement
   - i18n FR/EN fonctionne
   - Version check mobile (si testable)
   - Mode offline avec IndexedDB

3. **Test complet utilisateur**
   - Inscription nouveau compte
   - Confirmation email
   - Création exercice multi-sport
   - Création session
   - Test notifications
   - Suppression compte (RGPD)

---

### Phase 7 : Post-Déploiement (30 min)

#### 7.1 Monitoring

**Backend (Render)** :
- [ ] Vérifier logs pour erreurs
- [ ] Vérifier métriques CPU/RAM
- [ ] Tester tous endpoints critiques
- [ ] Vérifier emails de confirmation envoyés

**Frontend (Vercel)** :
- [ ] Vérifier analytics build
- [ ] Tester responsive mobile
- [ ] Vérifier bundle size acceptable
- [ ] Tester PWA icons

#### 7.2 Mise à jour Version Backend

**Fichier** : `exersio-back/src/modules/app/app-version.controller.ts`

```typescript
const versionInfo: AppVersionInfo = {
  currentVersion: '1.1.0',       // Mise à jour
  minimumVersion: '1.0.0',       // Garde compatibilité
  latestVersion: '1.1.0',        // Nouvelle version
  updateRequired: false,         // Optionnel pour 1.0.0
  updateOptional: true,          // Notification dispo
  releaseNotes: 'Version 1.1.0 :\n• Internationalisation FR/EN\n• Splash screen professionnel\n• RGPD complet (CGU, confidentialité)\n• Optimisations mobile complètes\n• Système multi-sport\n• Mode offline amélioré',
  downloadUrl: {
    android: 'https://github.com/exersio/app/releases/latest/download/exersio-release.apk',
    ios: 'https://apps.apple.com/app/exersio/id123456789'
  },
  maintenanceMode: false
};
```

**Commit** :
```bash
git checkout master
# Modifier app-version.controller.ts
git add exersio-back/src/modules/app/app-version.controller.ts
git commit -m "chore: bump version to 1.1.0 in version controller"
git push origin master
```

#### 7.3 Documentation

- [ ] Mettre à jour CHANGELOG.md
- [ ] Créer release GitHub avec notes
- [ ] Mettre à jour README.md si nécessaire
- [ ] Notifier équipe du déploiement

---

## ⚠️ Points d'Attention Critiques

### 🔴 CRITIQUE - À faire AVANT déploiement

1. **Backup base de données production** - NON NÉGOCIABLE
2. **Tester migration Prisma sur copie de la DB** - Recommandé
3. **Vérifier CORS_ORIGIN** - Inclut capacitor://localhost
4. **Préparer rollback plan** - En cas de problème

### 🟡 IMPORTANT - Vérifier pendant déploiement

1. **Logs backend** - Surveiller erreurs Prisma
2. **Emails confirmation** - Vérifier envoi fonctionne
3. **Notifications** - Tester système temps réel
4. **i18n** - Vérifier basculement FR/EN
5. **Mode offline** - Tester IndexedDB

### 🟢 RECOMMANDÉ - Post-déploiement

1. **APK Android** - Rebuild avec nouvelle version
2. **Analytics** - Vérifier métriques utilisateurs
3. **Performance** - Comparer avec version précédente
4. **Feedback** - Collecter retours utilisateurs

---

## 🔄 Plan de Rollback (Si Problème)

### Rollback Backend

```bash
# 1. Restaurer backup DB
psql $DATABASE_URL < backup_before_1.1.0.sql

# 2. Redéployer version précédente
git checkout v1.0.0
git push origin master --force  # DANGER - Seulement si critique

# 3. Render redéploie automatiquement
```

### Rollback Frontend

```bash
# 1. Via Vercel Dashboard
# - Aller sur Deployments
# - Sélectionner déploiement précédent
# - Cliquer "Promote to Production"

# OU via CLI
vercel rollback
```

---

## 📊 Checklist Complète

### Pré-Déploiement
- [ ] Backup DB production créé
- [ ] Tests locaux passent (build + unit tests)
- [ ] Variables d'environnement vérifiées
- [ ] Plan de rollback préparé
- [ ] Documentation à jour

### Merge & Deploy
- [ ] feat/next-features → development (merge + push)
- [ ] Tests sur development OK
- [ ] development → master (merge + push)
- [ ] Tag v1.1.0 créé et pushé
- [ ] Auto-deploy Render déclenché
- [ ] Auto-deploy Vercel déclenché

### Migrations & Config
- [ ] npx prisma db push exécuté
- [ ] npm run seed:sports exécuté
- [ ] CORS_ORIGIN vérifié
- [ ] Version controller mis à jour

### Vérifications Post-Deploy
- [ ] Backend /health OK
- [ ] Backend /api/app/version OK
- [ ] Frontend splash screen OK
- [ ] i18n FR/EN OK
- [ ] Notifications système OK
- [ ] Mode offline OK
- [ ] Emails confirmation OK
- [ ] RGPD (suppression compte) OK

### Documentation & Communication
- [ ] CHANGELOG.md mis à jour
- [ ] Release GitHub créée
- [ ] Équipe notifiée
- [ ] Monitoring actif 24h

---

## 📝 Notes Finales

**Durée estimée totale** : 2h30 - 3h
**Risque** : MOYEN (migrations DB + 71 commits)
**Impact** : MAJEUR (nouvelles fonctionnalités + RGPD)

**Recommandations** :
1. ✅ Faire le déploiement hors heures de pointe
2. ✅ Prévoir 1h de monitoring post-deploy
3. ✅ Avoir accès aux dashboards Render + Vercel
4. ✅ Tester sur mobile réel après déploiement

**Contacts urgence** :
- Render Support : support@render.com
- Vercel Support : support@vercel.com
- PostgreSQL : Backup automatique Render

---

**Document créé par** : Claude Code
**Dernière mise à jour** : 04/11/2025
**Version** : 1.0
