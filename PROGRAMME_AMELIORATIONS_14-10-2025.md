# 📋 Programme d'Améliorations - Session 14/10/2025 (soir)

**Date :** 14 octobre 2025
**Branche :** feat/arrow-control-points
**Objectif :** Migration système catégories multi-sport + Améliorations UX/UI

**⚠️ MIGRATION MAJEURE EN COURS:** Refonte architecture base de données avec table Sport

---

## 🎯 Vue d'ensemble

### Composants concernés
1. **ExercisesPage** (page liste exercices)
2. **ExerciseDetailView** (page détail exercice)
3. **ExerciseCreatePage** (création/copie exercice)
4. **Backend** (partage exercice, gestion club)

### Priorité d'exécution
- **Phase 1** : ExercisesPage (cards + filtres)
- **Phase 2** : ExerciseDetailView (responsive + navigation)
- **Phase 3** : Fonctionnalités (copie, partage, modal)

---

## 📦 Phase 1 : ExercisesPage - Cards et Filtres

### 1.1 Amélioration Cards Exercices ✅ TERMINÉ
**Fichier :** `src/components/ExercisesPage.tsx`

#### Modifications cards mobile (lignes ~220-229)
- ✅ **Afficher terrain complet** : Padding p-2 enlevé (ligne 221)
- ✅ **Supprimer bouton Exporter** : Retiré lignes 360-362
- ✅ **Optimiser affichage** : Terrain s'affiche maintenant en plein écran dans cards

```tsx
// Avant
<div className="p-2">
  {createCourtDiagram(exercise)}
</div>

// Après
<div>
  {createCourtDiagram(exercise)}
</div>
```

#### Modifications cards desktop (lignes ~604-616)
- ✅ **Même modifications** que mobile
- ✅ **Consistency** : Layout identique mobile/desktop

### 1.2 Refonte Système de Filtres ✅ TERMINÉ
**Fichier :** `src/components/ExercisesPage.tsx`

#### Dissociation Catégories et Tranches d'Âge
✅ **États séparés créés** (lignes 23-26):
- `selectedCategory` : Filtre de catégorie indépendant
- `selectedAge` : Filtre de tranche d'âge indépendant
- `showFavoritesOnly` : Basculer affichage favoris

✅ **Filtres générés dynamiquement** (lignes 45-67):
```tsx
const categoryFilters = useMemo(() => {
  const categories = [...new Set(exercises.map(ex => ex.category))].filter(Boolean);
  return [
    { value: 'all', label: 'Toutes' },
    ...categories.map(cat => ({ value: cat, label: cat.charAt(0).toUpperCase() + cat.slice(1) }))
  ];
}, [exercises]);

const ageFilters = useMemo(() => {
  const ages = [...new Set(exercises.map(ex => ex.ageCategory))].filter(Boolean);
  return [
    { value: 'all', label: 'Tous âges' },
    ...ages.map(age => ({ value: age, label: age.charAt(0).toUpperCase() + age.slice(1) }))
  ];
}, [exercises]);
```

#### Nouvelle UI Filtres ✅ TERMINÉ (lignes 426-575)
✅ **Deux sections distinctes** avec titres séparés:
- Section "Catégories" avec tous les filtres de catégorie (bleu)
- Section "Tranches d'âge" avec tous les filtres d'âge (vert)
- Bouton "Favoris uniquement" avec couleur jaune
- Bouton "Réinitialiser" affiché uniquement quand filtres actifs (rouge)

#### Bouton Reset Filtres ✅ TERMINÉ (lignes 164-172)
```tsx
const resetFilters = () => {
  setSelectedCategory('all');
  setSelectedAge('all');
  setShowFavoritesOnly(false);
  setSearchTerm('');
};

const hasActiveFilters = selectedCategory !== 'all' || selectedAge !== 'all'
  || showFavoritesOnly || searchTerm !== '';
```

#### Logique de Filtrage ✅ TERMINÉ (lignes 99-129)
```tsx
const filteredExercises = useMemo(() => {
  let result = exercises.map(ex => ({ ...ex, isFavorite: isFavorite(ex.id) }));

  // Filtre de recherche
  if (debouncedSearchTerm) {
    const term = debouncedSearchTerm.toLowerCase();
    result = result.filter(ex =>
      ex.name.toLowerCase().includes(term) ||
      ex.description?.toLowerCase().includes(term) ||
      ex.category?.toLowerCase().includes(term) ||
      ex.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }

  // Filtre par catégorie
  if (selectedCategory !== 'all') {
    result = result.filter(ex => ex.category === selectedCategory);
  }

  // Filtre par âge
  if (selectedAge !== 'all') {
    result = result.filter(ex => ex.ageCategory === selectedAge);
  }

  // Filtre favoris
  if (showFavoritesOnly) {
    result = result.filter(ex => ex.isFavorite);
  }

  return result;
}, [exercises, debouncedSearchTerm, selectedCategory, selectedAge, showFavoritesOnly, favoritesActions.favorites]);

```

---

### ✅ PHASE 1 COMPLÉTÉE

**Temps réalisé :** ~30 minutes
**Fichiers modifiés :** 1 (ExercisesPage.tsx)

**Changements effectués :**
1. ✅ Terrain complet sans padding (ligne 221)
2. ✅ Bouton Exporter supprimé (lignes 360-362)
3. ✅ États filtres séparés (lignes 23-26)
4. ✅ Filtres générés dynamiquement (lignes 45-67)
5. ✅ Nouvelle UI filtres avec sections distinctes (lignes 426-575)
6. ✅ Bouton Reset filtres (lignes 164-172, 547-573)
7. ✅ Logique filtrage combinée (lignes 99-129)

**Validation :**
- ✅ Compilation sans erreur
- ✅ Serveur fonctionne (http://localhost:5174)
- ⏳ Test utilisateur requis

**Estimation :** 45 minutes → **Réalisé en 30 minutes**
**Fichiers modifiés :** 1 (ExercisesPage.tsx)

---

## 📦 Phase 2 : ExerciseDetailView - Responsive et Navigation

### 2.1 Header Actions Responsive
**Fichier :** `src/components/ExerciseDetailView.tsx` (lignes ~150-257)

#### Problèmes identifiés
1. Background différent des autres cards
2. Pas de wrapping automatique des boutons
3. Texte dans les boutons (garder seulement icônes)
4. Navigation revient sans conserver filtres

#### Solution Header
```tsx
<Card style={{
  background: 'rgba(255, 255, 255, 0.08)',  // Même background que les autres
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '20px'
}} className="mb-8">
  <CardHeader className="pb-6">
    <div className="flex flex-col gap-4">
      {/* Breadcrumb + Titre */}

      {/* Actions - Auto-wrap avec gap */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button size="icon" onClick={onToggleFavorite}>
          <Heart className="w-4 h-4" />
        </Button>
        <Button size="icon" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
        </Button>
        {/* ... autres boutons icon-only */}
      </div>
    </div>
  </CardHeader>
</Card>
```

### 2.2 Layout Responsive (2 colonnes → 1 colonne)
**Fichier :** `src/components/ExerciseDetailView.tsx` (ligne ~260)

#### Breakpoint actuel vs nouveau
```tsx
// Avant : xl:grid-cols-3 (breakpoint 1280px)
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

// Après : md:grid-cols-3 (breakpoint 768px)
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
```

**Justification :** Entre 700-800px, garder layout 2 colonnes pour meilleure utilisation espace

### 2.3 Suppression Bande Noire Terrain
**Fichier :** `src/components/ExerciseDetailView.tsx` (lignes ~279-300)

```tsx
// Supprimer le bg-[#1e293b] et pattern background
<CardContent>
  <div className="relative w-full mx-auto">
    <SportCourtViewer
      sport={exercise.sport || 'volleyball'}
      // ...
    />
  </div>
</CardContent>
```

### 2.4 Séparation Catégorie / Tranche d'Âge
**Fichier :** `src/components/ExerciseDetailView.tsx` (lignes ~390-417)

#### Avant : badges mélangés
```tsx
<Badge>{exercise.category}</Badge>
<Badge>{exercise.ageCategory}</Badge>
```

#### Après : sections séparées
```tsx
<div>
  <h4>Catégorie</h4>
  <Badge>{exercise.category}</Badge>
</div>

<div>
  <h4>Tranche d'âge</h4>
  <Badge>{exercise.ageCategory}</Badge>
</div>
```

### 2.5 Consignes Détaillées Inline
**Fichier :** `src/components/ExerciseDetailView.tsx` (lignes ~320-340)

#### Avant : numéro séparé du texte (vertical)
```tsx
<div className="flex items-start gap-4">
  <div className="w-8 h-8 rounded-full">{index + 1}</div>
  <p>{instruction}</p>
</div>
```

#### Après : numéro aligné avec texte (horizontal)
```tsx
<div className="flex items-center gap-3">
  <span className="flex-shrink-0 w-6 h-6 rounded-full">{index + 1}</span>
  <p className="flex-1">{instruction}</p>
</div>
```

### 2.6 Affichage Tranche d'Âge au lieu de Niveau
**Fichier :** `src/components/ExerciseDetailView.tsx` (lignes ~376-387)

```tsx
// Remplacer la card "Niveau"
<div className="bg-white/5 rounded-xl p-4">
  <div className="text-xl font-bold">
    {exercise.ageCategory}
  </div>
  <div className="text-xs">Tranche d'âge</div>
</div>
```

### 2.7 Fix Rechargement Page (Navigation Context)
**Problème :** Actualisation page → "Exercice non trouvé"

**Solution :** Charger exercice depuis l'API si params.exerciseId présent

**Fichier :** `src/components/ExerciseDetailView.tsx` (useEffect au montage)

```tsx
useEffect(() => {
  const loadExerciseIfNeeded = async () => {
    if (!exercise && params?.exerciseId) {
      const loaded = await exerciseActions.loadExerciseById(params.exerciseId);
      // Mise à jour état local
    }
  };
  loadExerciseIfNeeded();
}, [params?.exerciseId]);
```

**Estimation :** 60 minutes
**Fichiers modifiés :** 1-2 (ExerciseDetailView.tsx + potentiellement NavigationContext)

---

## 📦 Phase 3 : Fonctionnalités (Copie, Partage, Modal)

### 3.1 Fix Copie Exercice - Double "(copie)"
**Fichier :** `src/components/ExerciseDetailView.tsx` (ligne ~140-145)

#### Problème
Clic sur "Copier" → Nom contient "(copie)" 2 fois

#### Investigation
```tsx
// ExerciseDetailView.tsx
const handleCopy = () => {
  exerciseActions.createLocalCopy(exercise);
  navigate('exercise-create', { mode: 'copy' });
};
```

Vérifier où le "(copie)" est ajouté :
1. Dans `createLocalCopy()` ?
2. Dans `ExerciseCreatePage` lors du chargement ?

#### Solution attendue
Ajouter "(copie)" une seule fois, probablement dans `ExerciseCreatePage` :

```tsx
// ExerciseCreatePage.tsx
const copyName = sourceExercise?.name.includes('(copie)')
  ? sourceExercise.name
  : `${sourceExercise?.name} (copie)`;
```

**Fichiers à vérifier :**
- `src/contexts/ExercisesContext.tsx` (méthode createLocalCopy)
- `src/components/ExerciseCreatePage.tsx` (initialisation nom)

### 3.2 Fix Partage Exercice - Erreur 500
**Fichiers :** Backend + Frontend

#### Investigation Backend
**Fichier :** `exersio-back/src/modules/exercises/exercises.service.ts`

Méthode `shareWithClub(exerciseId, userId)` :
1. Vérifier que user.clubId existe
2. Mettre à jour `exercise.clubId = user.clubId`
3. Retourner exercice mis à jour

```typescript
async shareWithClub(exerciseId: string, userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { clubId: true }
  });

  if (!user?.clubId) {
    throw new BadRequestException('Utilisateur non associé à un club');
  }

  const exercise = await this.prisma.exercise.findUnique({
    where: { id: exerciseId }
  });

  if (!exercise) {
    throw new NotFoundException('Exercice non trouvé');
  }

  if (exercise.clubId) {
    throw new BadRequestException('Exercice déjà partagé avec le club');
  }

  // Mise à jour
  return this.prisma.exercise.update({
    where: { id: exerciseId },
    data: { clubId: user.clubId }
  });
}
```

#### Frontend - Condition Affichage Bouton
**Fichier :** `src/components/ExerciseDetailView.tsx` (ligne ~206-214)

```tsx
{/* Bouton Share : ne pas afficher si déjà partagé */}
{!exercise.clubId && (
  <Button
    variant="outline"
    size="sm"
    onClick={handleShare}
    disabled={isSharing}
  >
    <Share2 className="w-4 h-4" />
  </Button>
)}

{/* Badge si partagé */}
{exercise.clubId && (
  <Badge>
    📢 Partagé avec le club
  </Badge>
)}
```

### 3.3 Modal Ajouter à la Séance
**Fichier :** `src/components/ExerciseDetailView.tsx` (lignes ~504-512)

#### État actuel
Modal `AddToSessionModal` s'ouvre déjà correctement.

#### Vérifications nécessaires
1. Modal affiche bien les sessions disponibles
2. Ajout à session existante fonctionne
3. Création nouvelle session fonctionne
4. Redirection correcte après ajout

**Tests manuels requis** - Pas de modifications code si fonctionnel.

**Estimation :** 45 minutes
**Fichiers modifiés :** 3-4 (ExercisesContext, ExerciseCreatePage, Backend ExercisesService/Controller)

---

## 📊 Récapitulatif

### Temps estimé total : **2h30 - 3h00**
- Phase 1 (ExercisesPage) : 45 min
- Phase 2 (ExerciseDetailView) : 60 min
- Phase 3 (Fonctionnalités) : 45 min

### Fichiers à modifier
#### Frontend (7 fichiers)
1. `src/components/ExercisesPage.tsx` - Cards + filtres
2. `src/components/ExerciseDetailView.tsx` - Responsive + layout
3. `src/components/ExerciseCreatePage.tsx` - Fix copie double
4. `src/contexts/ExercisesContext.tsx` - Méthode createLocalCopy
5. `src/contexts/NavigationContext.tsx` (optionnel) - Persistance filtres

#### Backend (2 fichiers)
6. `exersio-back/src/modules/exercises/exercises.service.ts` - Fix shareWithClub
7. `exersio-back/src/modules/exercises/exercises.controller.ts` - Route /share

### Commits prévus
1. **Phase 1** : `feat(exercises): improve cards display and separate category/age filters`
2. **Phase 2** : `fix(exercise-detail): improve responsive layout and navigation UX`
3. **Phase 3** : `fix(exercises): resolve copy naming and club sharing issues`

---

## 🚀 Ordre d'exécution recommandé

### Étape 1 : Frontend ExercisesPage
1. Enlever padding cards terrain
2. Supprimer bouton Exporter
3. Séparer filtres catégories/âges
4. Ajouter bouton Reset
5. Tester filtrage combiné

### Étape 2 : Frontend ExerciseDetailView
1. Fix background header
2. Boutons icon-only + wrap
3. Breakpoint md au lieu de xl
4. Supprimer bande noire terrain
5. Séparer catégorie/âge sections
6. Consignes inline
7. Remplacer niveau par âge
8. Fix rechargement page

### Étape 3 : Backend + Fixes Fonctionnels
1. Backend shareWithClub (erreur 500)
2. Frontend condition affichage Share
3. Fix copie double "(copie)"
4. Tests manuels modal séances

---

## ✅ Validation Finale

### Checklist Tests
- [ ] ExercisesPage : terrain complet visible sans coupure
- [ ] ExercisesPage : bouton Exporter supprimé
- [ ] ExercisesPage : filtres catégories séparés des âges
- [ ] ExercisesPage : bouton Reset fonctionne
- [ ] ExerciseDetailView : header responsive avec wrap
- [ ] ExerciseDetailView : layout 2 colonnes jusqu'à ~768px
- [ ] ExerciseDetailView : pas de bande noire terrain
- [ ] ExerciseDetailView : catégorie et âge séparés
- [ ] ExerciseDetailView : consignes numérotées inline
- [ ] ExerciseDetailView : tranche d'âge affichée (pas niveau)
- [ ] ExerciseDetailView : rechargement page fonctionne
- [ ] Copie exercice : "(copie)" apparaît 1 seule fois
- [ ] Partage exercice : pas d'erreur 500
- [ ] Partage exercice : bouton caché si déjà partagé
- [ ] Modal séances : fonctionne correctement

---

**Prêt à exécuter !** 🎯
