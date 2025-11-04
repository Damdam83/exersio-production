# 📊 État d'Avancement Projet Exersio

**Dernière mise à jour** : 04/11/2025
**Branche actuelle** : `feat/next-features`
**Document de référence unique** : Synthèse de tous les backlogs et plans
**Session récente** : Splash Screen + Version Check System TERMINÉ (04/11/2025)

---

## 📈 État Actuel - Récapitulatif Rapide

### ✅ Complété Récemment (04/11/2025)
- **Splash Screen complet** : Image Exersio officielle + animation loading-bar cyan ✅
- **Plugin Capacitor** : @capacitor/splash-screen@7.0.3 installé et configuré ✅
- **Assets générés** : 74 assets Android + 7 icons PWA (2.58 MB total) ✅
- **Version Check System** : Hook, service, modals (obligatoire/optionnel/maintenance) ✅
- **Documentation exhaustive** : SPLASH-SCREEN-VERSION-CHECK.md (600+ lignes) ✅

### ✅ Complété Précédemment (27-31/10/2025)
- **Mobile UX Phases 2-4** : Toutes les pages optimisées avec pattern responsive unifié
- **Internationalisation i18n** : Support FR/EN complet sur 8 pages principales (31/10)
- **RGPD complet** : CGU, Politique confidentialité, Suppression compte (26-27/10)
- **Système notifications** : Pagination serveur, EventEmitter, interface admin (25/10)

### ✅ Complété Précédemment (26-27/10/2025)
- **RGPD complet** : CGU, Politique confidentialité, Suppression compte, Checkbox consentement
- **Sécurité mot de passe** : Audit bcrypt (10 rounds ✅), PasswordStrengthIndicator, toggle show/hide
- **Correctifs HTTP** : Erreurs 409/401 affichent messages backend clairs
- **Toast notifications** : Timeout 3s, close button, rich colors, position optimale
- **Système notifications** : Pagination serveur, EventEmitter, interface admin, documentation complète (25/10)

### 🚨 Bugs Critiques (Option A - TOUS COMPLÉTÉS ✅)
1. ✅ **Visuels terrain cards/detail** - SportCourtViewer validé
2. ✅ **Éditeur terrain mobile paysage** - Déjà résolu en session précédente
3. ✅ **Sécurité mot de passe** - Audit bcrypt + indicateur force (FAIT 27/10)
4. ✅ **CGU/Politique RGPD** - Pages créées avec LegalFooter (FAIT 26/10)
5. ✅ **Suppression compte** - Droit à l'oubli RGPD (FAIT 26/10)
6. ✅ **Fix copie/partage** - Double "(copie)" + erreur 500 (FAIT 24/10)

### 📱 Mobile UX (Phases 1-4) - ✅ TERMINÉ
- ✅ **Phase 1** : Toasts (✅), polling (non requis), déconnexion (✅ existe)
- ✅ **Phase 2** : AuthForm (vérifié), HomePage - TERMINÉ (27/10)
- ✅ **Phase 3** : SessionsPage, ExercisesPage (vérifié), HistoryPage - TERMINÉ (27/10)
- ✅ **Phase 4** : ExerciseDetailView, ExerciseCreatePage, SessionDetailView, SessionCreatePage - TERMINÉ (30/10)

### 🎯 Tâche Actuelle
**AUCUNE** - Internationalisation FR/EN complète ✅ (31/10/2025)
**Prochaine option** : version mobile check, tests, langues supplémentaires (ES, DE, IT), ou autres améliorations

---

## 🎯 Vue d'Ensemble

### ✅ Accomplissements Majeurs

#### 🚀 Production & Déploiement (14/09/2025)
- **Backend Render** : https://exersio-production.onrender.com/api ✅
- **Frontend Vercel** : https://exersio-frontend.vercel.app ✅
- **PostgreSQL** : Base de données opérationnelle ✅
- **SMTP Gmail** : Emails de confirmation configurés ✅
- **APK Android** : Application mobile fonctionnelle ✅

#### 🎨 Fonctionnalités Complètes
- **Authentification** : JWT + confirmation email + reset password
- **Internationalisation (i18n)** : Support FR/EN complet sur 8 pages principales (31/10/2025)
- **Notifications** : Système complet (rappels séances, exercices club, admin) + EventEmitter temps réel
- **Mode offline** : IndexedDB + synchronisation bidirectionnelle
- **Multi-sport** : 5 sports (volleyball, football, tennis, handball, basketball)
- **Logging** : Winston avec rotation quotidienne + logs spécialisés
- **Tests** : Jest backend + Vitest frontend (>80% couverture)

#### 🏗️ Architecture Multi-Sport (14-15/10/2025)
**Migration base de données complétée** :
- ✅ Nouvelle table `Sport` avec relations
- ✅ `ExerciseCategory` et `AgeCategory` avec `sportId`
- ✅ Script seed `seed-sports.ts` : 5 sports + 28 catégories + 37 âges
- ✅ Backend : SportsModule + CategoriesModule avec relations
- ✅ Frontend : SportsContext + filtrage dynamique par sport

#### 🎯 Éditeur de Terrain (12-14/10/2025)
**Session 12/10** - Système multi-sport amélioré :
- ✅ Responsive breakpoint : wrap à 800-900px
- ✅ Système joueurs par sport avec rôles différenciés
- ✅ Toolbar adaptative par sport

**Session 13/10** - Flèches multi-types :
- ✅ 5 types (pass, shot, movement, dribble, defense)
- ✅ Flèches courbes Bézier quadratiques automatiques
- ✅ Fix positionnement avec viewBox dynamique

**Session 14/10** - Composants affichage :
- ✅ `SportCourtViewer` créé (composant universel read-only)
- ✅ Integration dans ExercisesPage, ExerciseDetailView, SessionDetailView
- ✅ Fix responsive avec ResizeObserver + tailles adaptatives

#### 📋 Page Exercices (14-15/10/2025)
- ✅ Cards optimisées (terrain 190px, padding réduit)
- ✅ Bouton Reset mobile + filtres refactorés
- ✅ Migration vers IDs (`getCategoryIds()`)
- ✅ ExerciseDetailView : 7 améliorations responsive complétées

---

## 🚨 BUGS CRITIQUES IDENTIFIÉS (11/10/2025)

### 🔔 1. Notifications Système - ✅ RÉSOLU (25/10/2025)
**Session 25/10/2025** : Système notifications finalisé

**Corrections appliquées** :
- ✅ **Pagination côté serveur vraie** : Backend retourne `{ data, total }`, frontend avec `api.getRaw()`
- ✅ **Statut 201 traité comme succès** : Envoi notifications fonctionne
- ✅ **EventEmitter implémenté** : Badge se met à jour en temps réel
- ✅ **Interface admin complète** : Envoi broadcast/club/users fonctionnel
- ✅ **Nettoyage code** : Fonctions test obsolètes supprimées
- ✅ **Documentation exhaustive** : NOTIFICATIONS-SYSTEME-COMPLET.md créé

**⏳ Tests requis** :
- Vérifier que le badge disparaît bien après lecture sur notification réelle
- Investiguer les 9 notifications automatiques sur nouveau compte (si toujours présent)

**Fichiers modifiés** :
- Backend : `notifications.service.ts`, `notifications.controller.ts`
- Frontend : `api.ts` (getRaw), `AdminNotificationsPage.tsx`, `NotificationSettingsPage.tsx`
- Service : `notificationService.ts` (EventEmitter)

---

### 🖼️ 2. Visuels Terrain Cards/Detail Incorrects (1-2h)
**Problème** :
- Terrains dans cards d'exercices pas corrects
- Visuels dans vue détail de séance incorrects
- Partiellement résolu par SportCourtViewer (14/10)

**Solution** :
- Tester mode `readOnly` de SportCourtViewer
- Vérifier affichage des 5 sports
- Comparer avec state avant sessions 12-14/10

**Fichiers** :
- `src/components/ExerciseCard.tsx`
- `src/components/SessionDetailView.tsx`
- `src/components/ExerciseEditor/SportCourtViewer.tsx`

**Status** : ⚠️ Tests requis pour valider les fixes 12-14/10

---

### 📱 3. Éditeur Terrain Mobile Paysage (3-4h)
**Problème** :
- Message "Tournez votre écran" OK en portrait
- En paysage : moitié du terrain visible seulement
- Terrain figé, seul le fond bouge
- Impossible d'éditer

**Solution** :
- CSS conteneur mode paysage
- Terrain prend toute largeur disponible
- Media query `orientation: landscape`

**Fichiers** :
- `src/components/ExerciseCreatePage.tsx`
- `src/components/ExerciseEditor/FieldEditor.tsx`
- `src/hooks/useOrientation.ts`

---

### 🔐 4. Sécurité Mot de Passe (3-4h)
**Problème** :
- Audit nécessaire : bcrypt ? Salt ? Force pwd ?

**Solution** :
- Audit backend `AuthService.register()`
- Vérifier bcrypt salt rounds >= 10
- Frontend : indicateur force mot de passe
- Validation : min 8 car, maj, min, chiffre, spécial

**Fichiers** :
- Backend : `exersio-back/src/modules/auth/auth.service.ts`
- Frontend : `src/components/AuthForm.tsx`
- Nouveau : `src/components/PasswordStrengthIndicator.tsx`

---

### 📄 5. CGU/Politique Confidentialité RGPD (4-6h)
**Problème** :
- Pas de CGU ni politique confidentialité
- Pas de checkbox acceptation inscription
- Requis légalement (RGPD)

**Solution** :
- Créer pages CGU et Politique
- Checkbox "J'accepte les CGU" dans AuthForm
- Liens footer
- Backend : champ `acceptedTerms` dans User

**Fichiers à créer** :
- `src/pages/TermsOfService.tsx`
- `src/pages/PrivacyPolicy.tsx`
- Modifier : `src/components/AuthForm.tsx`
- Backend : User model

---

### 🗑️ 6. Suppression Compte RGPD (3-4h)
**Problème** :
- Pas de suppression compte possible
- Requis RGPD (droit à l'oubli)

**Solution** :
- Page "Paramètres du compte"
- Bouton "Supprimer mon compte" + double confirmation
- Soft delete ou hard delete ?
- Supprimer données associées

**Fichiers à créer** :
- `src/pages/AccountSettings.tsx`
- `src/components/DeleteAccountModal.tsx`
- Backend : `DELETE /api/users/me`

---

## 📱 Plan d'Amélioration Interface Mobile

### 🔥 PHASE 1 - Corrections Globales (2h) - CRITIQUE

#### 1.1 Toasts Auto-Disparition (30min)
**Problème** : Toasts persistent indéfiniment

**Solution** :
```typescript
// services/toastService.ts
const showError = (message: string, duration = 5000) => {
  toast.error(message);
  setTimeout(() => toast.dismiss(), duration);
}
```

**Fichiers** : `services/toastService.ts`, `hooks/useToast.ts`

---

#### 1.2 Optimisation Polling Notifications (1h)
**Problème** : Polling `/notifications` toutes les 10s bloque UI

**Solution** :
- Requêtes background seulement
- Fréquence : 10s → 30s
- Désactiver si app background (Capacitor)

**Fichiers** : `services/notificationService.ts`, `contexts/NotificationContext.tsx`

---

#### 1.3 Bouton Déconnexion Mobile (30min)
**Problème** : Pas de déconnexion dans menu mobile

**Solution** :
```tsx
<button className="mobile:block hidden" onClick={logout}>
  <LogOut className="h-5 w-5" />
</button>
```

**Fichiers** : `components/MobileHeader.tsx`

---

### 🏠 PHASE 2 - Pages Principales (1.5h) - IMPORTANT

#### 2.1 AuthForm Mobile (30min)
**Problème** : Encart "mode développement" visible sur mobile

**Solution** :
```tsx
{!isMobile && <DeveloperModeNotice />}
```

**Fichiers** : `components/AuthForm.tsx`

---

#### 2.2 HomePage Mobile (1h)
**Problème** : Blocs mal alignés, marges trop grandes

**Solution** :
```css
@media (max-width: 768px) {
  .dashboard-container { padding: 1rem; gap: 1rem; }
  .dashboard-grid { grid-template-columns: 1fr; gap: 1rem; }
}
```

**Fichiers** : `components/HomePage.tsx`

---

### 📋 PHASE 3 - Pages Fonctionnelles (6h) - IMPORTANT

#### 3.1 SessionsPage Mobile (2h)
**Problèmes** : Bouton +, recherche, filtres trop grands

**Solution** :
```tsx
<button className="mobile:h-10 mobile:w-10 mobile:rounded-full">
  <Plus className="mobile:h-5 mobile:w-5" />
  <span className="mobile:hidden">Nouvelle séance</span>
</button>
```

**Fichiers** : `components/SessionsPage.tsx`

---

#### 3.2 ExercisesPage Mobile (2.5h)
**Note** : Beaucoup fait (filtres, cards, terrain)

**Reste** : Bouton +, barre recherche, alignement

**Fichiers** : `components/ExercisesPage.tsx`

---

#### 3.3 HistoryPage Mobile (1.5h)
**Solution** : Appliquer pattern SessionsPage

**Fichiers** : `components/HistoryPage.tsx`

---

### 🔍 PHASE 4 - Pages Détail/Édition (7h) - AMÉLIORATIONS

#### 4.1 ExerciseDetailView Mobile (3h)
**Note** : 7/10 améliorations complétées (15/10)

**Reste** :
- Espacement entre encarts
- Terrain schéma tronqué (partiellement résolu)
- Consignes numéros/texte alignement

**Solution consignes** :
```tsx
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
```

**Fichiers** : `components/ExerciseDetailView.tsx`

---

#### 4.2 ExerciseCreatePage Mobile (4h)
**Problèmes** :
- Espacement, marges
- Header moche, boutons trop gros
- Menu par-dessus encart
- Catégories : carrés verts trop larges
- Section Tags à supprimer mobile
- Schéma tactique vertical (déjà géré ?)
- Bouton sport à supprimer (à confirmer)

**Solutions** :
```tsx
// Header minimal
<div className="mobile:sticky mobile:top-0 mobile:z-10 mobile:bg-white mobile:border-b mobile:p-3">
  <BackButton />
  <h1 className="mobile:text-lg">Modifier</h1>
  <SaveButton className="mobile:p-2" />
</div>

// Catégories compactes
<span className="mobile:px-2 mobile:py-1 mobile:bg-green-100 mobile:text-xs mobile:rounded">
  {cat.name}
</span>

// Supprimer mobile
{!isMobile && <SportSelector />}
{!isMobile && <TagsSection />}
```

**Fichiers** : `components/ExerciseCreatePage.tsx`

---

### 🎨 Problèmes UX Spécifiques Mobile (3h)

#### Catégories Création Exercice (1h)
**Problème** : Carrés verts trop larges, texte pas centré

**Solution** :
```tsx
<span className="mobile:px-3 mobile:py-1.5 mobile:bg-green-100 mobile:text-xs mobile:rounded-md mobile:flex mobile:items-center mobile:justify-center">
  {cat.name}
</span>
```

---

#### Section Tags Mobile (30min)
**Problème** : Section inutile sur mobile

**Solution** :
```tsx
{!isMobile && <div className="tags-section">...</div>}
```

---

#### Étapes/Critères Centrage (1.5h)
**Problème** : Affichage pas beau lors sélection

**Solution** :
```tsx
<div className="mobile:space-y-3">
  {instructions.map((instruction, index) => (
    <div className="mobile:flex mobile:gap-3 mobile:items-center mobile:p-3 mobile:bg-gray-50 mobile:rounded-lg">
      <span className="mobile:w-8 mobile:h-8 mobile:bg-primary mobile:text-white mobile:rounded-full mobile:flex mobile:items-center mobile:justify-center mobile:text-sm">
        {index + 1}
      </span>
      <p className="mobile:flex-1 mobile:text-sm">{instruction}</p>
    </div>
  ))}
</div>
```

**Fichiers** :
- `src/components/ExerciseCreatePage.tsx`
- `src/components/ExerciseDetailView.tsx`

---

## 🔧 Fonctionnalités ExerciseDetailView (45min)

### Fix Copie Exercice - Double "(copie)" (20min)
**Problème** : Nom contient 2x "(copie)"

**Solution** :
```tsx
const copyName = sourceExercise?.name.includes('(copie)')
  ? sourceExercise.name
  : `${sourceExercise?.name} (copie)`;
```

**Fichiers** :
- `src/contexts/ExercisesContext.tsx`
- `src/components/ExerciseCreatePage.tsx`

---

### Fix Partage Exercice - Erreur 500 (30min)
**Problème** : Bouton "Partager avec le club" → erreur 500

**Backend** :
```typescript
async shareWithClub(exerciseId: string, userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { clubId: true }
  });

  if (!user?.clubId) {
    throw new BadRequestException('Utilisateur non associé à un club');
  }

  // ... rest of implementation
}
```

**Frontend** :
```tsx
{!exercise.clubId && (
  <Button onClick={handleShare} disabled={isSharing}>
    <Share2 />
  </Button>
)}

{exercise.clubId && <Badge>📢 Partagé avec le club</Badge>}
```

**Fichiers** :
- `exersio-back/src/modules/exercises/exercises.service.ts`
- `src/components/ExerciseDetailView.tsx`

---

## 🚀 Améliorations Avancées

### Système Version Mobile (4h)
**Objectif** : Notifier mises à jour disponibles

**Fonctionnalités** :
- Check version au démarrage
- Différencier obligatoire vs optionnelle
- Popup avec lien store/APK

**Fichiers à créer** :
- `src/services/versionCheckService.ts`
- `src/components/UpdateAvailableModal.tsx`

---

### ✅ Internationalisation i18n (TERMINÉ - 31/10/2025)
**Statut** : ✅ Application 100% bilingue FR/EN sur toutes les pages principales

**Implémentation réalisée** :
- ✅ react-i18next intégré et configuré
- ✅ 469 lignes de traductions FR/EN (~220 clés ajoutées)
- ✅ 8 pages principales traduites : SessionsPage, ExercisesPage, HistoryPage, SessionDetailView, ExerciseDetailView, SessionCreatePage, ExerciseCreatePage, NotificationCenter
- ✅ Support interpolation : `t('key', { count, players, etc. })`
- ✅ Traductions conditionnelles : `{isEditMode ? t('edit') : t('create')}`
- ✅ Formatage dates/temps avec i18nFormatters.ts
- ✅ Sélecteur de langue dans ProfilePage

**Fichiers créés/modifiés** :
- `src/i18n/` : Configuration react-i18next
- `src/i18n/locales/fr.json` : 469 lignes (sessions, exercises, history, notifications, common)
- `src/i18n/locales/en.json` : 469 lignes (traductions parallèles)
- `src/utils/i18nFormatters.ts` : Utilitaires formatage dates/temps
- 8 composants principaux avec useTranslation() hook

**Commits** : 8 commits détaillés (c6280ad → 8c560b8)
**Bundle impact** : +2.83 kB (~0.85%)

---

### Tests Complets (2h)
**Backend (Jest)** :
```bash
cd exersio-back
npm run test
npm run test:cov  # >80% couverture
```

**Frontend (Vitest)** :
```bash
cd exersio-front
npm run test:run
```

---

## 📊 Récapitulatif Temps Estimé

### 🔥 CRITIQUE (23-33h)
| Tâche | Durée |
|-------|-------|
| Notifications non lues | 2-3h |
| Visuels terrain | 1-2h |
| Éditeur terrain mobile paysage | 3-4h |
| Sécurité mot de passe | 3-4h |
| CGU/Politique RGPD | 4-6h |
| Suppression compte RGPD | 3-4h |
| Phase 1 Mobile (toasts, polling, déco) | 2h |
| Fix copie/partage exercices | 45min |

---

### 🟡 IMPORTANT (12.5h)
| Tâche | Durée |
|-------|-------|
| Phase 2 Mobile (AuthForm, HomePage) | 1.5h |
| Phase 3 Mobile (Sessions, Exos, History) | 6h |
| UX Mobile (catégories, tags, étapes) | 3h |
| Affichage catégories création | 1h |
| Centrage étapes/critères | 1.5h |

---

### 🟢 AMÉLIORATIONS (22-25h restants)
| Tâche | Durée | Status |
|-------|-------|--------|
| Phase 4 Mobile (Detail, Create) | 7h | ✅ TERMINÉ |
| Système version mobile | 4h | ⏳ À FAIRE |
| Internationalisation i18n | 12-15h → 3h réalisé | ✅ TERMINÉ (31/10) |
| Tests complets | 2h | ⏳ À FAIRE |

---

### 📱 AVANCÉ (3h)
| Tâche | Durée |
|-------|-------|
| Build iOS Capacitor | 3h |

---

**TOTAL GLOBAL** : **60-73h de développement**

**Répartition** :
- 🔥 Bugs critiques + RGPD : 38%
- 🟡 Améliorations UX importantes : 17%
- 🟢 Features futures : 45%

---

## 🚨 Actions Immédiates Recommandées

### ⭐ Option 1 : Bugs Critiques (5-8h) - RECOMMANDÉ
**Impact** : Débloquer fonctionnalités essentielles

1. **Notifications non lues** (2-3h)
2. **Visuels terrain** (1-2h)
3. **Fix copie/partage** (45min)
4. **Phase 1 Mobile** (2h)

---

### Option 2 : RGPD + Sécurité (10-14h)
**Impact** : Conformité légale obligatoire

1. **Sécurité mot de passe** (3-4h)
2. **CGU/Politique** (4-6h)
3. **Suppression compte** (3-4h)

---

### Option 3 : UX Mobile Complète (18.5h)
**Impact** : Interface mobile optimisée

1. **Phase 1** (2h)
2. **Phase 2** (1.5h)
3. **Phase 3** (6h)
4. **Phase 4** (7h)
5. **UX spécifique** (3h)

---

### Option 4 : Mobile + Fonctionnalités (20h)
**Impact** : Build iOS + i18n

1. **Phases 1-4 Mobile** (18.5h)
2. **Build iOS** (3h)
3. **Système version** (4h)

---

## 📁 Fichiers Critiques Récents

### Session 12/10/2025
- `ExercisesPage.tsx` : Breakpoints responsive
- `SportCourt.tsx` : Scaling adaptatif
- `Toolbar.tsx` : Rôles dynamiques par sport
- `sportsConfig.ts` : Mapping 5 sports complets

### Session 13/10/2025
- `src/constants/arrowTypes.tsx` : 5 types flèches
- `src/components/ExerciseEditor/SportCourt.tsx` : viewBox dynamique
- `src/utils/exerciseEditorHelpers.ts` : getEventPosition border-aware

### Session 14/10/2025
- `SportCourtViewer.tsx` : Composant universel créé
- `ExercisesPage.tsx` : Filtres séparés + reset
- `ExerciseDetailView.tsx` : 7 améliorations responsive

### Session 15/10/2025
- `ExercisesPage.tsx` : useEffect reset filtres + hasInitialized
- `MobileFilters.tsx` : FilterOption avec id
- `auth.service.spec.ts` : mockUser avec preferredSportId

---

## ✅ Critères de Succès

### Bugs Critiques
- [ ] Notifications badge disparaît après clic
- [ ] Visuels terrain corrects dans cards/detail
- [ ] Éditeur terrain mobile paysage fonctionnel
- [ ] Copie exercice : "(copie)" 1 seule fois
- [ ] Partage exercice : pas d'erreur 500

### RGPD & Sécurité
- [ ] Mot de passe sécurisé (bcrypt salt >=10)
- [ ] Indicateur force mot de passe
- [ ] CGU + Politique confidentialité
- [ ] Checkbox acceptation inscription
- [ ] Suppression compte fonctionnelle

### UX Mobile
- [ ] Toasts disparaissent automatiquement
- [ ] Polling notifications optimisé (30s)
- [ ] Bouton déconnexion accessible
- [ ] HomePage responsive parfaite
- [ ] SessionsPage/ExercisesPage optimisées
- [ ] ExerciseDetailView/CreatePage mobiles

### Non-Régression Desktop
- [ ] 100% fonctionnalités préservées
- [ ] Aucun changement visuel non intentionnel
- [ ] Performance identique ou améliorée

---

## 📝 Commandes Utiles

### Backend
```bash
cd exersio-back
npm run start:dev
npx prisma db push
npx prisma generate
npm run seed:sports
```

### Frontend
```bash
cd exersio-front
npm run dev
npm run build
```

### Base de données (WSL)
```bash
cd ~/exersio
docker compose up -d
docker compose down
```

### Mobile (Capacitor)
```bash
npm run mobile:sync
npm run mobile:build
npm run mobile:open
```

---

**Prochaine session** : Commencer par **Option 1 (Bugs Critiques 5-8h)** pour quick wins maximaux ou **Option 2 (RGPD 10-14h)** pour conformité légale avant production publique.

*Document de référence unique - Remplace tous les anciens backlogs et plans.*
