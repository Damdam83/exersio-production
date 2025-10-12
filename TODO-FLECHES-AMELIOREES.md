# 🎯 TODO - Système de Flèches Amélioré

**Date** : 12/10/2025
**Priorité** : 🟡 Important (UX)
**Durée estimée** : 5-7h

---

## 🎯 Objectifs

Remplacer le système de flèches actuel par un système amélioré avec :
1. **Types d'actions** avec styles visuels différenciés
2. **Courbes** pour trajectoires réalistes
3. **Meilleure lisibilité** visuelle
4. **Interface intuitive** de création

---

## 🚨 Problèmes Actuels

| Problème | Impact | Priorité |
|----------|--------|----------|
| Flèches moches (simple ligne SVG) | UX négative | 🔥 |
| Ne suivent pas le mouvement naturel | Réalisme faible | 🔥 |
| Pas de différenciation visuelle | Confusion actions | 🔥 |
| Pas de courbes possibles | Limitation tactique | 🟡 |

---

## 🎨 Solution Proposée : **Système Hybride**

### Phase 1 : Types d'Actions (2-3h) ⚡

Implémenter 5 types de flèches de base :

```typescript
ARROW_TYPES = {
  pass: {           // 🎯 Passe
    label: 'Passe',
    color: '#3b82f6',
    width: 3,
    style: 'solid',
    dashArray: 'none',
    marker: 'triangle',
    icon: '➡️'
  },
  shot: {           // ⚡ Tir
    label: 'Tir',
    color: '#ef4444',
    width: 4,
    style: 'solid',
    dashArray: 'none',
    marker: 'large-triangle',
    icon: '⚡'
  },
  movement: {       // 👟 Déplacement
    label: 'Déplacement',
    color: '#10b981',
    width: 2,
    style: 'dashed',
    dashArray: '8,4',
    marker: 'circle',
    icon: '👟'
  },
  dribble: {        // ⚽ Dribble
    label: 'Dribble',
    color: '#f59e0b',
    width: 2,
    style: 'dotted',
    dashArray: '2,4',
    marker: 'small-triangle',
    icon: '⚽'
  },
  defense: {        // 🛡️ Défense
    label: 'Défense',
    color: '#8b5cf6',
    width: 3,
    style: 'solid',
    dashArray: '4,2',
    marker: 'cross',
    icon: '🛡️'
  }
}
```

**UI Toolbar** :
```
[➡️ Passe] [⚡ Tir] [👟 Déplacement] [⚽ Dribble] [🛡️ Défense]
```

---

### Phase 2 : Courbes avec Bibliothèque (3-4h) 🎨

**Bibliothèques candidates à évaluer** :

#### Option A : **React Flow** ⭐ (Recommandé)
- **URL** : https://reactflow.dev/
- **Avantages** :
  - ✅ Flèches courbes natives (Bézier)
  - ✅ Drag & drop intégré
  - ✅ Éditeur visuel de courbes
  - ✅ Performance optimale (Canvas + SVG)
  - ✅ TypeScript support
  - ✅ Très populaire (30k+ stars GitHub)
- **Inconvénients** :
  - ⚠️ Bibliothèque complète (peut être overkill)
  - ⚠️ Courbe d'apprentissage moyenne

#### Option B : **Leader Line** 🎯
- **URL** : https://anseki.github.io/leader-line/
- **Avantages** :
  - ✅ Spécialisé flèches uniquement (léger)
  - ✅ Nombreux styles prédéfinis
  - ✅ Courbes automatiques entre points
  - ✅ Animations intégrées
- **Inconvénients** :
  - ⚠️ Pas React-first (vanilla JS)
  - ⚠️ Moins maintenu récemment

#### Option C : **Rough.js** 🎨
- **URL** : https://roughjs.com/
- **Avantages** :
  - ✅ Style "dessiné à la main" (unique)
  - ✅ Courbes personnalisables
  - ✅ Léger (12kb)
  - ✅ Canvas + SVG support
- **Inconvénients** :
  - ⚠️ Style artistique (peut ne pas convenir)
  - ⚠️ Pas d'éditeur intégré

#### Option D : **Konva.js / React-Konva** 💪
- **URL** : https://konvajs.org/
- **Avantages** :
  - ✅ Canvas 2D puissant
  - ✅ Courbes Bézier natives
  - ✅ Performance excellente
  - ✅ Éditeur de points de contrôle
  - ✅ React wrapper officiel
- **Inconvénients** :
  - ⚠️ Bibliothèque complète (canvas général)
  - ⚠️ Migration depuis SVG nécessaire

#### Option E : **D3.js (Curve Generators)** 📊
- **URL** : https://d3js.org/
- **Avantages** :
  - ✅ Générateurs de courbes puissants
  - ✅ Nombreux algorithmes (cardinal, catmull-rom, etc.)
  - ✅ Contrôle total
  - ✅ Très flexible
- **Inconvénients** :
  - ⚠️ Bibliothèque massive (peut importer que courbes)
  - ⚠️ API complexe
  - ⚠️ Pas d'UI intégrée

#### Option F : **Simple SVG Path (Custom)** ⚙️
- **Avantages** :
  - ✅ Contrôle total
  - ✅ Pas de dépendance externe
  - ✅ Léger
- **Inconvénients** :
  - ⚠️ Développement from scratch
  - ⚠️ Plus long (4-5h au lieu de 3-4h)

---

## 🏆 Recommandation : **React Flow** + Types Personnalisés

**Pourquoi React Flow ?**
1. ✅ Courbes Bézier natives avec UI d'édition
2. ✅ Performance optimale (utilisé par des milliers de projets)
3. ✅ TypeScript + React (s'intègre parfaitement)
4. ✅ Drag & drop de points de contrôle (UX excellente)
5. ✅ On peut styliser avec nos types d'actions

**Alternative légère** : **Leader Line** si React Flow trop complexe

---

## 📋 Plan d'Implémentation

### Étape 1 : Recherche & Décision (30min) ✅
- [x] Évaluer bibliothèques
- [ ] Tests rapides avec React Flow
- [ ] Décision finale

### Étape 2 : Types d'Actions (2-3h)
- [ ] Créer constantes `ARROW_TYPES`
- [ ] Modifier `Arrow` interface (ajouter `type`)
- [ ] Toolbar sélecteur de type
- [ ] Rendu SVG avec styles différenciés
- [ ] Tests desktop + mobile

### Étape 3 : Intégration Bibliothèque (2-3h)
- [ ] Installation `npm install reactflow`
- [ ] Wrapper composant pour terrain
- [ ] Migration flèches vers React Flow edges
- [ ] Ajout poignées de courbes
- [ ] Tests interactions

### Étape 4 : UI/UX Polish (1h)
- [ ] Toggle courbe ON/OFF
- [ ] Aide visuelle création
- [ ] Animations transitions
- [ ] Tests utilisateur

---

## 🎯 Critères de Succès

- [x] 5 types d'actions visuellement différenciés
- [ ] Courbes créables facilement
- [ ] Interface intuitive (<=2 clics pour flèche)
- [ ] Performance fluide (60fps)
- [ ] Desktop + Mobile fonctionnels
- [ ] Backwards compatible (anciennes flèches lisibles)

---

## 📊 Estimation Finale

| Phase | Durée | Complexité |
|-------|-------|------------|
| Recherche bibliothèque | 0.5h | 🟢 |
| Types d'actions | 2-3h | 🟡 |
| Intégration React Flow | 2-3h | 🟡 |
| UI/UX Polish | 1h | 🟢 |
| **TOTAL** | **5.5-7.5h** | 🟡 |

---

## 🔗 Références

- React Flow : https://reactflow.dev/
- Leader Line : https://anseki.github.io/leader-line/
- Konva.js : https://konvajs.org/
- D3 Curves : https://d3js.org/d3-shape/curve

---

*Créé le 12/10/2025 - Prêt pour implémentation*
