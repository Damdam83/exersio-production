# 🚀 Splash Screen & Version Check System

**Date de création** : 04/11/2025
**Status** : ✅ Implémenté et fonctionnel

---

## 📋 Vue d'ensemble

Système complet de splash screen avec vérification de version automatique au démarrage de l'application mobile Exersio.

### Fonctionnalités implémentées

✅ **Splash Screen React**
- Animation de chargement élégante avec logo Exersio
- Gradient de fond (slate-900 → slate-800)
- Barre de progression indéterminée
- Fade out automatique après durée minimale
- Support mobile et desktop

✅ **Système de vérification de version**
- Check automatique au démarrage (mobile uniquement)
- Détection de mises à jour obligatoires vs optionnelles
- Modal d'information avec notes de version
- Liens de téléchargement (Android/iOS)
- Mode maintenance avec blocage d'accès

✅ **Backend API**
- Endpoint `/api/app/version` - Informations de version
- Endpoint `/api/app/maintenance` - Statut maintenance
- Documentation Swagger complète

---

## 🎨 Composants Frontend

### 1. SplashScreen Component (`src/components/SplashScreen.tsx`)

Composant React avec animation de splash screen.

**Props:**
```typescript
interface SplashScreenProps {
  isVisible: boolean;
  onComplete?: () => void;
  minDuration?: number; // Par défaut: 1500ms
}
```

**Éléments visuels:**
- Logo Exersio (icône Dumbbell) dans un cercle bleu avec ombre
- Animation ping sur le fond du logo
- Nom "Exersio" en grand titre
- Slogan "Votre assistant d'entraînement sportif"
- Barre de progression animée (loading-bar animation)
- Version de l'app en footer
- Fade out fluide après durée minimale

**Animation CSS (tailwind.config.js):**
```javascript
animation: {
  'loading-bar': 'loading-bar 1.5s ease-in-out infinite',
}
keyframes: {
  'loading-bar': {
    '0%': { transform: 'translateX(-100%)' },
    '50%': { transform: 'translateX(0%)' },
    '100%': { transform: 'translateX(100%)' },
  },
}
```

---

### 2. Version Check Hook (`src/hooks/useVersionCheck.ts`)

Hook pour gérer la vérification de version au démarrage.

**Fonctionnalités:**
- Appel automatique au montage (mobile uniquement)
- Comparaison de versions (semver)
- Gestion mises à jour obligatoires/optionnelles
- Rappel automatique après 24h pour mises à jour optionnelles
- États: `isChecking`, `hasChecked`, `showUpdateModal`, `showMaintenanceModal`

**Actions:**
- `handleUpdateNow()` - Ouvrir le lien de téléchargement
- `handleUpdateLater()` - Reporter de 24h (optionnel uniquement)
- `closeUpdateModal()` - Fermer modal (optionnel uniquement)

---

### 3. Update Modals (`src/components/UpdateModal.tsx`)

Deux modals pour gérer les mises à jour et la maintenance.

#### UpdateModal
**Affichage:**
- Version actuelle vs nouvelle version
- Type de mise à jour (obligatoire/optionnelle)
- Notes de version (releaseNotes)
- Bouton "Mettre à jour maintenant" avec icône ExternalLink
- Bouton "Plus tard" (optionnel uniquement)

**Comportement:**
- Mise à jour obligatoire: modal non-fermable, bloque l'app
- Mise à jour optionnelle: modal fermable, rappel après 24h

#### MaintenanceModal
**Affichage:**
- Message de maintenance
- Durée estimée
- Icône AlertTriangle orange
- Non-fermable (bloque l'accès complet)

---

### 4. Version Service (`src/services/versionService.ts`)

Service singleton pour gérer les appels API de version.

**Méthodes principales:**
```typescript
setCurrentVersion(version: string)           // Définir version actuelle
getVersionInfo(): Promise<AppVersionInfo>    // Récupérer infos serveur
getMaintenanceStatus(): Promise<MaintenanceInfo> // Statut maintenance
checkForUpdates(): Promise<VersionCheckResult>  // Vérifier mises à jour
performStartupCheck(): Promise<...>          // Check complet au démarrage
```

**Comparaison de versions:**
- Parse semver (major.minor.patch)
- Normalisation des longueurs
- Comparaison numérique par composant

---

## 🔧 Backend API

### Endpoints

#### GET /api/app/version
Retourne les informations de version de l'application.

**Réponse (AppVersionInfo):**
```json
{
  "currentVersion": "1.0.0",
  "minimumVersion": "1.0.0",
  "latestVersion": "1.0.0",
  "updateRequired": false,
  "updateOptional": false,
  "releaseNotes": "Version actuelle 1.0.0 :\n• Internationalisation FR/EN complète\n• Système de notifications temps réel\n• Mode hors connexion avec synchronisation\n• Interface mobile optimisée\n• Splash screen au démarrage",
  "downloadUrl": {
    "android": "https://github.com/exersio/app/releases/latest/download/exersio-release.apk",
    "ios": "https://apps.apple.com/app/exersio/id123456789"
  },
  "maintenanceMode": false
}
```

**Logique de mise à jour:**
- `updateRequired = true` si `currentVersion < minimumVersion`
- `updateOptional = true` si `currentVersion < latestVersion` et pas required

#### GET /api/app/maintenance
Retourne le statut de maintenance.

**Réponse (MaintenanceInfo):**
```json
{
  "maintenanceMode": false,
  "message": null,
  "estimatedDuration": null
}
```

**En cas de maintenance:**
```json
{
  "maintenanceMode": true,
  "message": "Maintenance programmée pour améliorer les performances",
  "estimatedDuration": "2 heures"
}
```

---

## 🔄 Flux d'exécution

### Au démarrage de l'app

1. **App.tsx** affiche `<SplashScreen isVisible={true} />`
2. **useVersionCheck** appelle `performStartupCheck()`
3. Appels parallèles à `/api/app/version` et `/api/app/maintenance`
4. Comparaison de versions avec version locale (1.0.0)
5. Mise à jour états: `hasChecked = true`, `isChecking = false`

### Scénarios possibles

**✅ Aucune mise à jour (état actuel)**
- `latestVersion = currentVersion = 1.0.0`
- `updateRequired = false`, `updateOptional = false`
- Splash screen disparaît après 1.5s
- App démarre normalement

**⚠️ Mise à jour optionnelle disponible**
- `latestVersion > currentVersion` (ex: 1.1.0 > 1.0.0)
- `minimumVersion <= currentVersion`
- UpdateModal s'affiche avec bouton "Plus tard"
- Rappel automatique après 24h

**🚨 Mise à jour obligatoire**
- `minimumVersion > currentVersion` (ex: 1.1.0 > 1.0.0)
- UpdateModal non-fermable bloque l'accès
- Seul le bouton "Mettre à jour maintenant" est disponible
- Redirige vers lien de téléchargement

**🔧 Mode maintenance**
- `maintenanceMode = true`
- MaintenanceModal bloque l'accès complet
- Message et durée estimée affichés
- Aucune action possible

---

## 📱 Configuration Capacitor

### capacitor.config.ts

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,        // Durée splash natif
    backgroundColor: "#0f172a",      // Couleur de fond (slate-900)
    showSpinner: false,              // Pas de spinner natif
    androidSpinnerStyle: 'small',
    splashFullScreen: true,
    splashImmersive: true
  }
}
```

**Notes:**
- Le splash natif Capacitor s'affiche pendant le chargement de l'app
- Notre SplashScreen React prend le relais dès que React est prêt
- Transition fluide entre les deux grâce au même backgroundColor

---

## 🎯 Pour les développeurs

### Mettre à jour la version de l'app

#### 1. Frontend (package.json)
```json
{
  "version": "1.1.0"
}
```

#### 2. Backend (app-version.controller.ts)
```typescript
const versionInfo: AppVersionInfo = {
  currentVersion: '1.0.0',      // Version de référence (actuelle en prod)
  minimumVersion: '1.0.0',      // Version minimum acceptée
  latestVersion: '1.1.0',       // Nouvelle version disponible
  updateRequired: false,        // true si breaking changes
  updateOptional: true,         // true si nouvelle version dispo
  releaseNotes: '...',          // Notes de version
  downloadUrl: { ... }          // Liens de téléchargement
}
```

#### 3. Capacitor (capacitor.config.ts)
- Pas de changement nécessaire (config indépendante)

### Tester les scénarios

**Test mise à jour optionnelle:**
```typescript
// Backend
latestVersion: '1.1.0'
minimumVersion: '1.0.0'
```

**Test mise à jour obligatoire:**
```typescript
// Backend
latestVersion: '1.1.0'
minimumVersion: '1.1.0'  // Force l'update
```

**Test mode maintenance:**
```typescript
// Backend
maintenanceMode: true
message: "Maintenance en cours..."
estimatedDuration: "30 minutes"
```

---

## 🚀 Installation du plugin Capacitor SplashScreen

### Commandes

```bash
cd exersio-front
npm install @capacitor/splash-screen
npx cap sync android
```

### Génération des assets splash screen

```bash
# Générer automatiquement tous les assets
npx @capacitor/assets generate --splash splash-source.png
```

**Assets requis:**
- Portrait (1668x2224px ou plus)
- Landscape (2732x2048px ou plus)
- Format PNG avec transparence
- Logo centré sur fond #0f172a (slate-900)

---

## ✅ Checklist de test

**Mode développement (web):**
- [x] SplashScreen s'affiche avec animation
- [x] Fade out après 1.5s
- [x] Aucun appel API version (desktop)
- [x] App démarre normalement

**Mode mobile (Android):**
- [ ] Splash natif Capacitor s'affiche au lancement
- [ ] Transition fluide vers SplashScreen React
- [ ] Appel API `/api/app/version` au démarrage
- [ ] Appel API `/api/app/maintenance` au démarrage
- [ ] Aucune modal si pas de mise à jour
- [ ] UpdateModal s'affiche si mise à jour dispo
- [ ] MaintenanceModal bloque si maintenance active

**Scénarios de mise à jour:**
- [ ] Mise à jour optionnelle: modal fermable, bouton "Plus tard"
- [ ] Mise à jour obligatoire: modal non-fermable, pas de "Plus tard"
- [ ] Lien de téléchargement Android s'ouvre correctement
- [ ] Rappel après 24h pour mises à jour optionnelles

**Mode maintenance:**
- [ ] Modal maintenance bloque l'accès complet
- [ ] Message et durée affichés correctement
- [ ] Aucune action possible sauf fermer l'app

---

## 📝 TODO Future

### Améliorations possibles

**Backend:**
- [ ] Stocker versions dans base de données
- [ ] Interface admin pour gérer versions/maintenance
- [ ] Historique des versions déployées
- [ ] Planification de maintenance programmée
- [ ] Notifications push avant maintenance

**Frontend:**
- [ ] Support iOS avec liens App Store
- [ ] Téléchargement auto des APK (Android)
- [ ] Barre de progression téléchargement
- [ ] Changelog interactif avec filtres
- [ ] Cache des release notes en offline

**Assets:**
- [ ] Logo Exersio vectoriel professionnel
- [ ] Splash screens personnalisés par plateforme
- [ ] Animations Lottie pour splash screen
- [ ] Variations de splash (dark/light mode)

---

## 🔗 Fichiers concernés

### Frontend
- `src/components/SplashScreen.tsx` - Composant splash screen
- `src/components/UpdateModal.tsx` - Modals mises à jour
- `src/hooks/useVersionCheck.ts` - Hook vérification version
- `src/services/versionService.ts` - Service API version
- `src/App.tsx` - Intégration splash screen
- `tailwind.config.js` - Animation loading-bar

### Backend
- `src/modules/app/app-version.controller.ts` - Controller version
- `src/modules/app/app.module.ts` - Module App
- `src/app.module.ts` - Import AppVersionModule

### Configuration
- `capacitor.config.ts` - Config splash screen natif
- `package.json` - Version de l'app (1.0.0)

---

**Document maintenu par** : Claude Code
**Dernière mise à jour** : 04/11/2025
