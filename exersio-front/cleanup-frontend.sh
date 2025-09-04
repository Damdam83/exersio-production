#!/bin/bash

# Script de nettoyage frontend automatique
# Basé sur l'audit complet effectué

echo "🧹 Démarrage du nettoyage frontend Exersio..."

# Composants UI à GARDER (utilisés selon audit)
KEEP_COMPONENTS=(
  "button.tsx"
  "card.tsx" 
  "badge.tsx"
  "input.tsx"
  "textarea.tsx"
  "dialog.tsx"
  "progress.tsx"
  "select.tsx"
  "separator.tsx"
  "sonner.tsx"
  "label.tsx"
  "utils.ts"
)

# Fonction pour vérifier si un fichier doit être gardé
should_keep() {
  local file="$1"
  for keep in "${KEEP_COMPONENTS[@]}"; do
    if [[ "$file" == *"$keep" ]]; then
      return 0
    fi
  done
  return 1
}

# Supprimer les composants UI inutilisés
echo "🗑️  Suppression des composants UI inutilisés..."
removed_count=0

for file in src/components/ui/*.tsx src/components/ui/*.ts; do
  if [ -f "$file" ]; then
    basename_file=$(basename "$file")
    if ! should_keep "$basename_file"; then
      echo "  - Suppression: $file"
      rm "$file"
      ((removed_count++))
    else
      echo "  ✅ Gardé: $file"
    fi
  fi
done

# Supprimer les fichiers backup/temporaires
echo "🗑️  Suppression des fichiers temporaires..."
if [ -f "src/components/SessionsPage.backup.tsx" ]; then
  rm "src/components/SessionsPage.backup.tsx"
  echo "  - Suppression: SessionsPage.backup.tsx"
  ((removed_count++))
fi

# Désinstaller packages npm inutilisés
echo "📦 Suppression des packages npm inutilisés..."
npm uninstall @capacitor/splash-screen @capacitor/status-bar

# Nettoyer le cache npm
echo "🔄 Nettoyage cache npm..."
npm cache clean --force

echo "✅ Nettoyage terminé!"
echo "📊 Statistiques:"
echo "  - Composants UI supprimés: $removed_count"
echo "  - Bundle size réduit: ~500KB+ estimé"
echo "  - Packages npm supprimés: 2"

# Vérifier que le build fonctionne encore
echo "🔍 Vérification build..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build réussi - nettoyage validé!"
else
  echo "❌ Erreur build - vérification nécessaire"
fi