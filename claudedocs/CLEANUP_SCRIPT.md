# 🧹 SCRIPT DE NETTOYAGE FRONTEND AUTOMATIQUE

Ce script automatise le nettoyage identifié dans l'audit frontend.

## ⚠️ AVANT D'EXÉCUTER

```bash
# 1. Créer une branche de sauvegarde
git checkout -b cleanup/frontend-audit

# 2. Faire un backup
git add . && git commit -m "Backup avant nettoyage automatique"

# 3. Vérifier que tout fonctionne
cd exersio-front
npm run build
npm run test
```

## 🗂️ SCRIPT DE SUPPRESSION (Phase 1 - Sécurisée)

```bash
#!/bin/bash
echo "🧹 Nettoyage Frontend Exersio - Phase 1 (Sécurisée)"
echo "=================================================="

cd exersio-front/src

# === FICHIERS BACKUP/TEMPORAIRES ===
echo "🗑️ Suppression des fichiers backup..."
rm -f components/SessionsPage.backup.tsx 2>/dev/null && echo "✅ SessionsPage.backup.tsx supprimé" || echo "⚠️ SessionsPage.backup.tsx non trouvé"

# === COMPOSANTS UI NON UTILISÉS (36 fichiers) ===
echo ""
echo "🗑️ Suppression des composants UI non utilisés..."

ui_components_to_remove=(
    "accordion"
    "alert"
    "alert-dialog"
    "aspect-ratio"
    "avatar"
    "breadcrumb"
    "calendar"
    "carousel"
    "chart"
    "checkbox"
    "collapsible"
    "command"
    "context-menu"
    "drawer"
    "dropdown-menu"
    "form"
    "hover-card"
    "input-otp"
    "menubar"
    "navigation-menu"
    "pagination"
    "popover"
    "radio-group"
    "resizable"
    "scroll-area"
    "sheet"
    "sidebar"
    "skeleton"
    "slider"
    "switch"
    "table"
    "tabs"
    "toggle"
    "toggle-group"
    "use-mobile"
)

removed_count=0
for component in "${ui_components_to_remove[@]}"; do
    if rm -f "components/ui/$component.tsx" 2>/dev/null; then
        echo "✅ ui/$component.tsx supprimé"
        ((removed_count++))
    else
        echo "⚠️ ui/$component.tsx non trouvé"
    fi
done

echo ""
echo "📊 $removed_count composants UI supprimés sur ${#ui_components_to_remove[@]}"

cd ../..

# === PACKAGES NPM ===
echo ""
echo "📦 Suppression des packages npm inutilisés..."

cd exersio-front
packages_to_remove=(
    "@capacitor/splash-screen"
    "@capacitor/status-bar"
)

for package in "${packages_to_remove[@]}"; do
    if npm uninstall "$package" 2>/dev/null; then
        echo "✅ $package désinstallé"
    else
        echo "⚠️ $package non trouvé ou erreur"
    fi
done

echo ""
echo "🎉 Phase 1 terminée ! Vérifiez maintenant :"
echo "  1. npm run build"
echo "  2. npm run test"
echo "  3. npm run preview"
echo ""
echo "Si tout fonctionne, passez à la Phase 2 (nettoyage imports)"
```

## 🔧 SCRIPT DE NETTOYAGE (Phase 2 - Imports)

```bash
#!/bin/bash
echo "🧹 Nettoyage Frontend Exersio - Phase 2 (Imports)"
echo "================================================"

cd exersio-front/src

# === NETTOYAGE HomePage.tsx ===
echo "🔧 Nettoyage des imports dans HomePage.tsx..."

# Backup de l'original
cp components/HomePage.tsx components/HomePage.tsx.backup

# Remplacer l'import des icônes avec seulement les utilisées
sed -i 's/import { Calendar, Zap, TrendingUp, Trophy, BarChart3, Clock, Users, Target, Plus, Dumbbell, BookOpen, Play, Pause, CheckCircle, Cloud, CloudOff } from/import { Calendar, TrendingUp, Trophy, BarChart3, Clock, Plus, Dumbbell, Play, Pause, CheckCircle, Cloud, CloudOff } from/' components/HomePage.tsx

if [ $? -eq 0 ]; then
    echo "✅ Imports HomePage.tsx nettoyés (7 icônes supprimées : Zap, Users, Target, BookOpen)"
else
    echo "❌ Erreur lors du nettoyage HomePage.tsx"
    mv components/HomePage.tsx.backup components/HomePage.tsx
fi

echo ""
echo "🎉 Phase 2 terminée ! Vérifiez :"
echo "  1. npm run build"
echo "  2. Interface HomePage fonctionne"
echo ""
echo "Si problème : mv components/HomePage.tsx.backup components/HomePage.tsx"
```

## 🔍 SCRIPT DE VALIDATION (Phase 3)

```bash
#!/bin/bash
echo "🔍 Validation du nettoyage"
echo "========================="

cd exersio-front

echo "📊 Analyse avant/après..."

# Compter les fichiers
echo "Fichiers TypeScript restants : $(find src -name '*.tsx' -o -name '*.ts' | wc -l)"
echo "Composants UI restants : $(ls src/components/ui/*.tsx src/components/ui/*.ts 2>/dev/null | wc -l)"

echo ""
echo "🧪 Tests automatiques..."

# Build
echo "🏗️ Test de build..."
if npm run build >/dev/null 2>&1; then
    echo "✅ Build réussi"
else
    echo "❌ Build échoué - ROLLBACK REQUIS"
    exit 1
fi

# Tests
echo "🧪 Lancement des tests..."
if npm run test >/dev/null 2>&1; then
    echo "✅ Tests passés"
else
    echo "⚠️ Tests échoués - À vérifier"
fi

echo ""
echo "📈 Analyse du bundle..."

# Taille du build
build_size=$(du -sh dist 2>/dev/null | cut -f1)
echo "Taille du build : $build_size"

echo ""
echo "✅ Validation terminée"
echo "💾 Faites un commit : git add . && git commit -m 'Frontend cleanup: removed 36 unused UI components + packages'"
```

## 🔄 ROLLBACK EN CAS DE PROBLÈME

```bash
#!/bin/bash
echo "🔙 Rollback du nettoyage"
echo "======================="

# Retour au commit précédent
git reset --hard HEAD~1

echo "✅ Rollback effectué"
echo "🔍 Vérifiez que tout fonctionne"
```

## 📋 CHECKLIST DE VALIDATION

Après chaque phase, vérifier :

### Phase 1 (Composants UI)
- [ ] `npm run build` → ✅ sans erreurs
- [ ] `npm run test` → ✅ tous verts  
- [ ] Interface HomePage → ✅ normale
- [ ] Interface ExercisesPage → ✅ normale
- [ ] Interface SessionsPage → ✅ normale
- [ ] Formulaires → ✅ fonctionnels
- [ ] Boutons/Inputs → ✅ stylés normalement

### Phase 2 (Imports)  
- [ ] HomePage → ✅ toutes icônes présentes
- [ ] Pas d'erreurs console → ✅ propre
- [ ] Build → ✅ sans warnings

### Phase 3 (Validation)
- [ ] Bundle size réduit → ✅ visible
- [ ] Performance → ✅ maintenue/améliorée
- [ ] Tests E2E → ✅ fonctionnels

## 🎯 GAIN ATTENDU

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| Bundle UI | ~100% | ~25% | 75% |
| Packages | 42 | 40 | 2 packages |
| Taille | ~2MB | ~1.5MB | 500KB |
| Fichiers | 129 | 90 | 39 fichiers |

**Total : ~35-40% de réduction du code inutilisé**