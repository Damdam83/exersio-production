# 🚀 Backlog Complet Améliorations Exersio

**Date de création** : 11/10/2025
**Dernière mise à jour** : 11/10/2025
**Branche de travail** : `development`

---

## 📊 Vue d'Ensemble

### Status Général du Projet
- ✅ **Production déployée** : Backend Render + Frontend Vercel + DB PostgreSQL
- ✅ **App mobile** : APK Android générée et fonctionnelle
- ✅ **Fonctionnalités core** : Auth, Exercices, Séances, Historique, Mode offline
- 🚨 **Problème critique** : Éditeur de terrain cassé (multi-sport)
- 🔧 **Améliorations UX** : Liste complète ci-dessous

---

## 🚨 BUGS CRITIQUES À CORRIGER

### 🎯 1. Éditeur de Terrain Cassé (PRIORITÉ MAXIMALE)
**Problème** :
Suite aux modifications multi-sport, l'éditeur de terrain ne fonctionne plus correctement.

**Symptômes** :
- Les outils de sélection (joueur/flèche/ballon/zone) sont défaillants
- L'interaction avec les éléments du terrain ne fonctionne pas
- Impossible de créer/modifier des schémas tactiques

**Impact** :
🔥 **BLOQUANT** - Fonctionnalité principale de l'application inutilisable

**Solution proposée** :
- Restaurer complètement l'ancien FieldEditor fonctionnel
- Identifier les modifications multi-sport qui ont cassé l'éditeur
- Tests approfondis de chaque outil après correction

**Fichiers concernés** :
- `src/components/ExerciseEditor/FieldEditor.tsx`
- `src/components/ExerciseEditor/SportCourt.tsx`
- `src/components/ExerciseEditor/SportToolbar.tsx`
- `src/constants/sportsConfig.ts`

**Estimation** : 8-12h

---

### 🔐 2. Authentification Locale en Développement
**Status** : ✅ **ANNULÉ** - Pas nécessaire (utilisateur OK avec workaround curl)

---

## 📱 AMÉLIORATIONS UX MOBILE (Plan original du 16/09/2025)

### 🔥 PHASE 1 - Corrections Globales (Priorité Critique)

#### 1.1 Système de Toast Auto-Disparition
**Problème** : Toasts d'erreur persistent indéfiniment

**Solution** :
```typescript
// services/toastService.ts
const showError = (message: string, duration = 5000) => {
  toast.error(message);
  setTimeout(() => toast.dismiss(), duration);
}
```

**Fichiers** : `services/toastService.ts`, `hooks/useToast.ts`
**Impact** : Global - améliore UX sur toutes les pages
**Estimation** : 0.5h

---

#### 1.2 Optimisation Requêtes Background
**Problème** : Polling `/notifications` toutes les 10s bloque l'UI

**Solution** :
- Requêtes notifications en background seulement
- Réduire fréquence : 10s → 30s
- Désactiver si app en background (Capacitor)

**Fichiers** : `services/notificationService.ts`, `contexts/NotificationContext.tsx`
**Estimation** : 1h

---

#### 1.3 Bouton Déconnexion Navigation Mobile
**Problème** : Pas d'option déconnexion dans menu mobile

**Solution** :
```tsx
// components/MobileHeader.tsx
<button className="mobile:block hidden" onClick={logout}>
  <LogOut className="h-5 w-5" />
</button>
```

**Fichiers** : `components/MobileHeader.tsx`
**Estimation** : 0.5h

---

### 🏠 PHASE 2 - Pages Principales

#### 2.1 Page de Connexion (AuthForm)
**Problèmes** :
- Encart "mode développement" visible sur mobile
- Layout pas optimisé pour petit écran

**Solutions** :
```tsx
{!isMobile && <DeveloperModeNotice />}
```

**Fichiers** : `components/AuthForm.tsx`
**Estimation** : 0.5h

---

#### 2.2 Tableau de Bord (HomePage)
**Problèmes** :
- Blocs mal alignés
- Pas d'espace entre les blocs
- Marges écran trop grandes

**Solutions** :
```css
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
    gap: 1rem;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
```

**Fichiers** : `components/HomePage.tsx`
**Estimation** : 1h

---

### 📋 PHASE 3 - Pages Fonctionnelles

#### 3.1 Page Séances (SessionsPage)
**Problèmes** :
- Bouton + trop grand et moche
- Logo et texte recherche mal alignés
- Encart filtres trop grand
- Boutons filtres trop gros (sélectionnés)

**Solutions** :
```tsx
// Bouton + mobile optimisé
<button className="mobile:h-10 mobile:w-10 mobile:rounded-full">
  <Plus className="mobile:h-5 mobile:w-5" />
  <span className="mobile:hidden">Nouvelle séance</span>
</button>

// Barre recherche mobile compacte
<div className="mobile:flex-col mobile:gap-2">
  <Search className="mobile:h-4 mobile:w-4" />
  <input className="mobile:text-sm mobile:py-2" />
</div>

// Filtres mobile compacts
<button className="mobile:px-2 mobile:py-1 mobile:text-xs mobile:rounded-md">
```

**Fichiers** : `components/SessionsPage.tsx`
**Estimation** : 2h

---

#### 3.2 Page Exercices (ExercisesPage)
**Problèmes** : Identiques à SessionsPage + terrain card serré

**Solutions** : Similaires à SessionsPage + fix terrain
```tsx
<div className="mobile:aspect-video mobile:min-h-24">
  <FieldEditor className="mobile:scale-90" readOnly sport={exercise.sport} />
</div>
```

**Fichiers** : `components/ExercisesPage.tsx`, `components/ExerciseCard.tsx`
**Estimation** : 2.5h

---

#### 3.3 Page Historique (HistoryPage)
**Problèmes** : Similaires à SessionsPage

**Solutions** : Appliquer même pattern que SessionsPage

**Fichiers** : `components/HistoryPage.tsx`
**Estimation** : 1.5h

---

### 🔍 PHASE 4 - Pages Détail/Édition

#### 4.1 Vue Exercice (ExerciseDetailView)
**Problèmes** :
- Pas d'espace entre encarts
- Marges écran trop grandes
- Encart du haut trop gros, boutons mal positionnés
- Terrain schéma tronqué
- Consignes : numéros et texte mal alignés
- Informations mal positionnées
- Remonter catégories et description

**Solutions** :
```tsx
// Layout mobile optimisé
<div className="mobile:p-3 mobile:space-y-3">
  {/* Header compact */}
  <div className="mobile:flex mobile:justify-between mobile:items-center mobile:p-3">
    <h1 className="mobile:text-lg" />
    <div className="mobile:flex mobile:gap-2">
      <FavoriteButton className="mobile:h-8 mobile:w-8" />
      <ShareButton className="mobile:h-8 mobile:w-8" />
    </div>
  </div>

  {/* Terrain responsive */}
  <div className="mobile:aspect-video mobile:bg-gray-50 mobile:rounded-lg">
    <FieldEditor className="mobile:h-full mobile:w-full" readOnly />
  </div>

  {/* Consignes alignées */}
  <div className="mobile:space-y-2">
    {instructions.map((instruction, index) => (
      <div className="mobile:flex mobile:gap-3 mobile:items-start">
        <span className="mobile:w-6 mobile:h-6 mobile:bg-primary mobile:text-white mobile:rounded-full mobile:flex mobile:items-center mobile:justify-center mobile:text-xs">
          {index + 1}
        </span>
        <p className="mobile:flex-1 mobile:text-sm">{instruction}</p>
      </div>
    ))}
  </div>
</div>
```

**Fichiers** : `components/ExerciseDetailView.tsx`
**Estimation** : 3h

---

#### 4.2 Édition Exercice (ExerciseCreatePage)
**Problèmes** :
- Pas d'espace entre encarts, marges trop larges
- Encart du haut moche, boutons trop gros
- Menu par-dessus l'encart
- Catégories : carré vert trop large, texte pas centré
- Enlever Tags et nouveau tags + bouton
- Schéma tactique indisponible en vertical
- Bouton changement sport à supprimer

**Solutions** :
```tsx
// Header mobile minimal
<div className="mobile:sticky mobile:top-0 mobile:z-10 mobile:bg-white mobile:border-b mobile:p-3">
  <div className="mobile:flex mobile:justify-between mobile:items-center">
    <BackButton />
    <h1 className="mobile:text-lg">Modifier</h1>
    <div className="mobile:flex mobile:gap-2">
      <SaveButton className="mobile:p-2" />
      <MenuButton className="mobile:p-2" />
    </div>
  </div>
</div>

// Catégories compactes
<div className="mobile:flex mobile:flex-wrap mobile:gap-2">
  <span className="mobile:px-2 mobile:py-1 mobile:bg-green-100 mobile:text-xs mobile:rounded">
    {cat.name}
  </span>
</div>

// Schéma tactique conditionnel
{isLandscape ? (
  <FieldEditor sport={sport} />
) : (
  <div className="mobile:bg-gray-100 mobile:p-4 mobile:rounded mobile:text-center">
    <RotateIcon className="mobile:mx-auto mobile:mb-2" />
    Tournez votre écran pour éditer le schéma tactique
  </div>
)}

// Supprimer sur mobile
{!isMobile && <SportSelector />}
{!isMobile && <TagsSection />}
```

**Fichiers** : `components/ExerciseCreatePage.tsx`
**Estimation** : 4h

---

## 🔧 AMÉLIORATIONS TECHNIQUES

### 📦 Configuration Production

#### Variable CORS Manquante sur Render
**Status** : ✅ **FAIT** - Variable déjà configurée en production

---

### 📱 Système de Vérification Version Mobile

**Objectif** : Notifier les utilisateurs mobile des mises à jour disponibles

**Fonctionnalités** :
- Check version au démarrage de l'app
- Différencier mise à jour obligatoire vs optionnelle
- Popup avec lien vers le store/téléchargement APK

**Fichiers à créer** :
- `src/services/versionCheckService.ts`
- `src/components/UpdateAvailableModal.tsx`

**Estimation** : 4h

---

### 🧪 Suite de Tests à Exécuter

**Tests backend (Jest)** :
```bash
cd exersio-back
npm run test
npm run test:cov  # Couverture >80%
```

**Tests frontend (Vitest)** :
```bash
cd exersio-front
npm run test:run
```

**Estimation** : 2h (exécution + corrections si échecs)

---

## 📊 PLANNING D'EXÉCUTION MIS À JOUR

### 🔥 Priorité CRITIQUE (à traiter en premier)

| # | Tâche | Durée | Status |
|---|-------|-------|--------|
| 1 | Réparer éditeur de terrain (desktop + mobile) | 8-12h | ⏳ À faire |
| 2 | Notifications non lues (badge + API) | 2-3h | ⏳ À faire |
| 3 | Éditeur terrain mobile paysage | 3-4h | ⏳ À faire |
| 4 | Sécurité mot de passe (audit + indicateur) | 3-4h | ⏳ À faire |
| 5 | CGU/Politique confidentialité + RGPD | 4-6h | ⏳ À faire |
| 6 | Suppression compte utilisateur (RGPD) | 3-4h | ⏳ À faire |

**Sous-total CRITIQUE** : 23-33h

---

### 🟡 Priorité IMPORTANTE (UX mobile)

| # | Tâche | Durée | Status |
|---|-------|-------|--------|
| 7 | Phase 1 - Corrections globales (toasts, déco) | 2h | ⏳ À faire |
| 8 | Phase 2 - Pages principales (login, home) | 1.5h | ⏳ À faire |
| 9 | Phase 3 - Pages fonctionnelles (sessions, exos) | 6h | ⏳ À faire |
| 10 | Affichage catégories création exercice | 1h | ⏳ À faire |
| 11 | Supprimer section tags mobile | 0.5h | ⏳ À faire |
| 12 | Centrage étapes/critères réussite | 1.5h | ⏳ À faire |

**Sous-total IMPORTANT** : 12.5h

---

### 🟢 Priorité MOYENNE (features futures)

| # | Tâche | Durée | Status |
|---|-------|-------|--------|
| 13 | Phase 4 - Pages détail/édition | 7h | ⏳ À faire |
| 14 | Système version mobile | 4h | ⏳ À faire |
| 15 | Internationalisation (i18n) FR/EN | 12-15h | ⏳ À faire |
| 16 | Exécution suite tests complète | 2h | ⏳ À faire |

**Sous-total MOYEN** : 25-28h

---

### ✅ Tâches Déjà Faites

| # | Tâche | Status |
|---|-------|--------|
| - | Auth dev locale (bouton activation) | ✅ ANNULÉ (pas nécessaire) |
| - | Variable CORS Render | ✅ FAIT |

---

**TOTAL GLOBAL ESTIMÉ** : **60-73h de développement**

### Répartition par catégorie
- 🔥 Bugs critiques + RGPD : 23-33h (38%)
- 🟡 Améliorations UX importantes : 12.5h (17%)
- 🟢 Features futures : 25-28h (45%)

---

## 🎯 NOUVELLES OBSERVATIONS - Test du 11/10/2025

### 🔔 1. Notifications Non Lues (BUG CRITIQUE)
**Problème** :
- Badge chiffre rouge reste affiché même après clic sur notification
- Notifications ne passent pas en "lu" au clic
- 9 notifications non lues sur compte nouvellement créé (anormal)

**Solution proposée** :
- Vérifier appel API `/api/notifications/:id/read` lors du clic
- Vérifier mise à jour du state dans `NotificationContext`
- Investiguer pourquoi 9 notifs créées automatiquement

**Fichiers concernés** :
- `src/contexts/NotificationContext.tsx`
- `src/components/NotificationsPanel.tsx`
- Backend : `exersio-back/src/modules/notifications/notifications.service.ts`

**Priorité** : 🔥 CRITIQUE
**Estimation** : 2-3h

---

### 📱 2. Éditeur Terrain Mobile en Paysage (BUG CRITIQUE)
**Problème** :
- Message "Tournez votre écran" s'affiche correctement en portrait
- En mode paysage : seulement la moitié du terrain visible
- Terrain figé, seul le fond bouge
- Impossible d'éditer le schéma tactique

**Solution proposée** :
- Vérifier le CSS du conteneur en mode paysage
- S'assurer que le terrain prend toute la largeur disponible
- Tester avec `orientation: landscape` media query

**Fichiers concernés** :
- `src/components/ExerciseCreatePage.tsx`
- `src/components/ExerciseEditor/FieldEditor.tsx`
- `src/hooks/useOrientation.ts`

**Priorité** : 🔥 CRITIQUE (lié au bug éditeur terrain)
**Estimation** : 3-4h

---

### 🎨 3. Affichage Catégories dans Création Exercice
**Problème** :
- Affichage des catégories sélectionnées pas esthétique
- Carrés verts trop larges, texte pas centré (problème déjà identifié dans plan original)

**Solution proposée** :
```tsx
<div className="mobile:flex mobile:flex-wrap mobile:gap-2">
  <span className="mobile:px-3 mobile:py-1.5 mobile:bg-green-100 mobile:text-green-800 mobile:text-xs mobile:rounded-md mobile:flex mobile:items-center mobile:justify-center">
    {cat.name}
  </span>
</div>
```

**Fichiers concernés** :
- `src/components/ExerciseCreatePage.tsx`

**Priorité** : 🟡 IMPORTANT
**Estimation** : 1h

---

### 🏷️ 4. Section Tags à Supprimer
**Problème** :
- Section "Tags" et bouton "Nouveau tag" inutiles sur mobile
- Prend de la place inutilement

**Solution proposée** :
```tsx
{!isMobile && (
  <div className="tags-section">
    {/* Tout le contenu tags */}
  </div>
)}
```

**Fichiers concernés** :
- `src/components/ExerciseCreatePage.tsx`

**Priorité** : 🟡 IMPORTANT
**Estimation** : 0.5h

---

### 📝 5. Affichage Étapes/Instructions Mal Centré
**Problème** :
- Lorsqu'on sélectionne une étape, l'affichage n'est pas beau
- Éléments pas centrés horizontalement
- Même problème pour les critères de réussite

**Solution proposée** :
```tsx
// Étapes/Instructions
<div className="mobile:space-y-3">
  {instructions.map((instruction, index) => (
    <div className="mobile:flex mobile:gap-3 mobile:items-center mobile:justify-start mobile:p-3 mobile:bg-gray-50 mobile:rounded-lg">
      <span className="mobile:flex-shrink-0 mobile:w-8 mobile:h-8 mobile:bg-primary mobile:text-white mobile:rounded-full mobile:flex mobile:items-center mobile:justify-center mobile:text-sm mobile:font-medium">
        {index + 1}
      </span>
      <p className="mobile:flex-1 mobile:text-sm mobile:text-center">{instruction}</p>
    </div>
  ))}
</div>

// Critères de réussite (même pattern)
<div className="mobile:space-y-2">
  {criteria.map((criterion, index) => (
    <div className="mobile:flex mobile:gap-3 mobile:items-center mobile:p-3 mobile:bg-green-50 mobile:rounded-lg">
      <CheckCircle className="mobile:w-5 mobile:h-5 mobile:text-green-600" />
      <p className="mobile:flex-1 mobile:text-sm mobile:text-center">{criterion}</p>
    </div>
  ))}
</div>
```

**Fichiers concernés** :
- `src/components/ExerciseCreatePage.tsx`
- `src/components/ExerciseDetailView.tsx`

**Priorité** : 🟡 IMPORTANT
**Estimation** : 1.5h

---

### 🌍 6. Absence d'Internationalisation (i18n)
**Problème** :
- Toute l'application est en français hardcodé
- Pas de système de traduction

**Solution proposée** :
- Intégrer `react-i18next` ou `react-intl`
- Créer fichiers de traduction FR/EN minimum
- Wrapper tous les textes avec fonction de traduction

**Fichiers concernés** :
- TOUS les composants (refactoring massif)
- Nouveau dossier : `src/locales/`
- Configuration : `src/i18n.ts`

**Priorité** : 🟢 MOYEN (feature future)
**Estimation** : 12-15h (refactoring complet)

---

### 🖼️ 7. Visuels Terrain dans Cards/Detail Incorrects
**Problème** :
- Terrains affichés dans les cards d'exercices pas corrects
- Visuels dans la vue détail de séance aussi incorrects
- Probablement lié au bug général de l'éditeur terrain

**Solution proposée** :
- À traiter en même temps que la correction de l'éditeur terrain principal
- Vérifier le mode `readOnly` du FieldEditor
- Tester l'affichage des 5 sports différents

**Fichiers concernés** :
- `src/components/ExerciseCard.tsx`
- `src/components/SessionDetailView.tsx`
- `src/components/ExerciseEditor/FieldEditor.tsx`

**Priorité** : 🔥 CRITIQUE (dépend de fix éditeur terrain)
**Estimation** : Inclus dans fix éditeur (8-12h total)

---

### 🔒 8. Sécurité Mot de Passe à Vérifier
**Problème** :
- Besoin de vérifier si le mot de passe est bien sécurisé
- Hash bcrypt ? Salt ? Validation force du mot de passe ?

**Solution proposée** :
- Audit du backend : `AuthService.register()`
- Vérifier : bcrypt avec salt rounds >= 10
- Frontend : ajouter indicateur force du mot de passe
- Validation : min 8 caractères, majuscule, minuscule, chiffre, caractère spécial

**Fichiers concernés** :
- Backend : `exersio-back/src/modules/auth/auth.service.ts`
- Frontend : `src/components/AuthForm.tsx`
- Nouveau composant : `src/components/PasswordStrengthIndicator.tsx`

**Priorité** : 🔥 CRITIQUE (sécurité)
**Estimation** : 3-4h (audit + améliorations)

---

### 📄 9. CGU/Politique Confidentialité Manquantes
**Problème** :
- Pas de conditions générales d'utilisation
- Pas de politique de confidentialité
- Pas de checkbox acceptation lors de l'inscription
- Requis légalement (RGPD)

**Solution proposée** :
- Créer pages CGU et Politique de Confidentialité
- Ajouter checkbox "J'accepte les CGU" dans AuthForm (inscription)
- Liens dans footer vers ces pages
- Validation côté backend aussi

**Fichiers à créer** :
- `src/pages/TermsOfService.tsx`
- `src/pages/PrivacyPolicy.tsx`
- Modifier : `src/components/AuthForm.tsx`
- Backend : Ajouter champ `acceptedTerms` dans User model

**Priorité** : 🔥 CRITIQUE (légal RGPD)
**Estimation** : 4-6h (rédaction + implémentation)

---

### 🗑️ 10. Suppression de Compte Utilisateur
**Problème** :
- Pas de possibilité pour l'utilisateur de supprimer son compte
- Requis RGPD (droit à l'oubli)

**Solution proposée** :
- Ajouter page "Paramètres du compte"
- Bouton "Supprimer mon compte" avec confirmation double
- Backend : soft delete ou hard delete ?
- Supprimer toutes les données associées (RGPD)

**Fichiers à créer** :
- `src/pages/AccountSettings.tsx`
- `src/components/DeleteAccountModal.tsx`
- Backend : endpoint `DELETE /api/users/me`

**Priorité** : 🔥 CRITIQUE (légal RGPD)
**Estimation** : 3-4h

---

## ✅ CRITÈRES DE SUCCÈS

### UX Mobile
- [ ] Navigation fluide sur toutes les pages
- [ ] Lisibilité optimale (textes, boutons, espacements)
- [ ] Performance identique ou meilleure
- [ ] Design cohérent sur mobile

### Non-Régression Desktop
- [ ] 100% des fonctionnalités préservées
- [ ] Aucun changement visuel non intentionnel
- [ ] Performance identique ou meilleure

### Fonctionnalités Critiques
- [ ] Éditeur de terrain complètement fonctionnel
- [ ] Auth locale facile en développement
- [ ] App mobile connectée en production

### Qualité Code
- [ ] Code mobile/desktop clairement séparé
- [ ] Composants réutilisables
- [ ] Tests passent avec >80% couverture

---

## 📝 NOTES DE SESSION

### Session du 11/10/2025
- Frontend lancé sur http://localhost:5173/
- Backend lancé sur http://localhost:3000/api
- Database PostgreSQL opérationnelle
- Création de ce backlog complet
- En attente : Tour complet de l'application pour identifier nouveaux problèmes

---

*Document vivant - À mettre à jour au fur et à mesure de l'avancement*