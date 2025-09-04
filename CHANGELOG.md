# 📝 Changelog - Exersio

Toutes les modifications notables du projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [En cours] - 2025-08-25

### ✅ Ajouté
- **Documentation Claude** - Fichiers CLAUDE.md, CHANGELOG.md, ISSUES.md pour maintenir le contexte
- **Module Favorites** - Système complet de favoris d'exercices avec API
  - Modèle `UserExerciseFavorite` dans Prisma
  - Endpoints GET/POST/DELETE `/api/user/favorites/exercises`
  - Service et contrôleur NestJS complets
- **Configuration VS Code** - Environnement de développement optimisé
  - Tâches pour lancer DB + Backend + Frontend
  - Configuration de debug multi-applications
  - Settings workspace avec support TypeScript et TailwindCSS

### 🔧 Corrigé
- **Requêtes API dupliquées** - Suppression des appels automatiques au démarrage
  - Les favoris et exercices ne se chargent plus au login
  - Chargement uniquement lors de la navigation vers la page Exercices
- **Instructions manquantes** - Copie d'exercices préserve maintenant les étapes/consignes
  - Utilisation de `instructions` au lieu de `steps` dans ExerciseCreatePage
  - Maintien de la compatibilité avec l'ancien champ `steps`
- **Warning React** - Suppression du warning "Encountered two children with the same key"
  - Déduplication des tags de filtres dans ExercisesPage
- **Crash SessionCreatePage** - Correction de l'erreur TypeError
  - Ajout d'optional chaining pour `params?.sessionId`
  - Optimisation des dépendances useEffect

### 🗃️ Base de données
- **Migration Prisma** - Ajout de la table `UserExerciseFavorite`
  - Relation many-to-many entre User et Exercise
  - Index pour optimisation des requêtes
  - Contrainte unique pour éviter les doublons

### 📱 Interface utilisateur
- **Messages d'état améliorés** - Page Exercices avec états vides et chargement
  - Animation de chargement pendant les requêtes
  - Messages contextuels selon les filtres appliqués
  - Bouton d'action pour créer le premier exercice

---

## Format des entrées

### Types de modifications
- **✅ Ajouté** - Nouvelles fonctionnalités
- **🔧 Corrigé** - Corrections de bugs
- **📝 Modifié** - Modifications de fonctionnalités existantes
- **🗑️ Supprimé** - Fonctionnalités retirées
- **🔒 Sécurité** - Corrections de vulnérabilités
- **🗃️ Base de données** - Modifications de schéma
- **📱 Interface utilisateur** - Améliorations UX/UI
- **⚡ Performance** - Optimisations

---

*Fichier maintenu par Claude Code - Ajoutez vos modifications ici pour garder l'historique.*