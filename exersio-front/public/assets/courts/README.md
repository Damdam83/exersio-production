# 🏐 Assets Terrains de Sport - Exersio

Ce dossier contient les images de fond des terrains pour l'éditeur d'exercices.

---

## 📁 Structure

```
courts/
├── volleyball-court-dark.webp  (ou .png)
├── football-field-dark.webp
├── tennis-court-dark.webp
├── handball-court-dark.webp
├── basketball-court-dark.webp
├── PROMPTS-GENERATION-IA.md    (prompts originaux)
├── PROMPTS-DARK-THEME.md       (prompts adaptés design Exersio)
└── README.md                    (ce fichier)
```

---

## 🎨 Spécifications Images

### Format
- **Principal** : WebP (meilleur compression)
- **Fallback** : PNG (support navigateurs anciens)

### Taille
- **Résolution** : 1200x800px minimum (ratio ~3:2)
- **Poids cible** : 150-300 KB par image
- **Poids maximum** : 500 KB

### Qualité
- **WebP** : Qualité 80-85%
- **PNG** : Compression optimale (TinyPNG)

---

## 🔄 Workflow Génération

1. **Générer images** avec ChatGPT DALL-E 3
   - Utiliser prompts de `PROMPTS-DARK-THEME.md`
   - Télécharger images (~2.5 MB chacune)

2. **Compresser images** sur https://squoosh.app/
   - Upload image
   - Export en WebP qualité 80%
   - Télécharger (~200 KB)

3. **Nommer correctement**
   ```
   volleyball-court-dark.webp
   football-field-dark.webp
   tennis-court-dark.webp
   handball-court-dark.webp
   basketball-court-dark.webp
   ```

4. **Placer dans ce dossier** (`public/assets/courts/`)

---

## 🎯 Design System Exersio

### Couleurs du terrain
- **Background sombre** : `#1e2731` → `#283544` → `#3d4a5c`
- **Accent teal** : `#00d4aa` → `#00b894`
- **Lignes blanches** : `#ffffff` (épaisses et contrastées)

### Style
- Moderne / Tech / Futuriste
- Ambiance nocturne
- Glow teal subtil sur bords

---

## 📊 Ratio Aspect par Sport

| Sport       | Dimensions réelles | Ratio  | Résolution image recommandée |
|-------------|-------------------|--------|------------------------------|
| Volleyball  | 18m x 9m          | 2:1    | 1200x600 ou 1600x800        |
| Football    | Variable          | 3:2    | 1200x800 ou 1500x1000       |
| Tennis      | 23.77m x 10.97m   | 2.2:1  | 1200x545 ou 1760x800        |
| Handball    | 40m x 20m         | 2:1    | 1200x600 ou 1600x800        |
| Basketball  | 28m x 15m         | 1.9:1  | 1200x632 ou 1520x800        |

**Note** : Ratio flexible, l'important est la cohérence visuelle et le style dark theme.

---

## 🔍 Validation Qualité

Avant d'accepter une image, vérifier :

✅ **Vue top-down** parfaite (pas d'angle)
✅ **Fond sombre** (#1e2731 ou similaire)
✅ **Lignes blanches** épaisses et visibles
✅ **Accent teal** subtil (#00d4aa)
✅ **Pas de joueurs** ni texte
✅ **Poids < 300 KB** (WebP optimisé)
✅ **Résolution ≥ 1200x800**
✅ **Style moderne** cohérent

---

## 🛠️ Utilisation dans le Code

Les images sont chargées automatiquement par `CourtBackgroundImage.tsx` :

```typescript
import { CourtBackgroundImage } from './CourtBackgroundImage';

// Dans le composant terrain
<CourtBackgroundImage sport={sport} loading="lazy" />
```

Le composant gère :
- Format WebP avec fallback PNG
- Lazy loading pour performance
- Z-index correct (fond en arrière-plan)
- Aspect ratio automatique par sport

---

## ⚠️ Important

### Fallback si image manquante
Si une image n'est pas disponible, le terrain affiche :
- Couleur de fond du `sportsConfig.ts` (ex: `#2d5016` pour volleyball)
- Gradient vers `#1e2731` (design system Exersio)

### Cache navigateur
Les images sont mises en cache par le navigateur pour performance.
Pour forcer rechargement après remplacement :
- Vider cache navigateur (Ctrl+Shift+Del)
- Ou renommer fichier (ex: `volleyball-court-dark-v2.webp`)

---

## 📝 Changelog

**11/10/2025** :
- Création structure assets terrains
- Ajout composant `CourtBackgroundImage.tsx`
- Intégration dans `SportCourt.tsx`
- Documentation prompts IA (dark theme)

---

**Pour questions** : Voir documentation technique dans `src/components/ExerciseEditor/CourtBackgroundImage.tsx`
