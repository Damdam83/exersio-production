# 🐛 Issues - Exersio

Problèmes connus, solutions appliquées et éléments à surveiller.

---

## 🚨 Problèmes critiques résolus

### 1. ❌ API Favorites manquante
**Symptôme :** `Cannot GET /api/user/favorites/exercises`
**Impact :** Impossible d'utiliser les favoris, erreurs en console
**Status :** ✅ **RÉSOLU**
**Solution :** 
- Créé module favorites complet (service + controller + module)
- Ajouté modèle `UserExerciseFavorite` au schema Prisma
- Migration appliquée avec `prisma db push`

### 2. ❌ Crash SessionCreatePage  
**Symptôme :** `TypeError: Cannot read properties of null (reading 'sessionId')`
**Impact :** Page de création de séance inutilisable
**Status :** ✅ **RÉSOLU** 
**Solution :**
- Ajouté optional chaining `params?.sessionId`
- Optimisé les dépendances useEffect

### 3. ❌ Requêtes dupliquées au démarrage
**Symptôme :** 2 requêtes identiques favorites/exercises au login
**Impact :** Performance dégradée, erreurs console
**Status :** ✅ **RÉSOLU**
**Solution :**
- Supprimé chargement automatique dans App.tsx 
- Favoris chargés uniquement à la navigation

---

## ⚠️ Problèmes mineurs résolus

### 4. 🟡 Instructions manquantes lors de copie
**Symptôme :** Étapes d'exercices absentes dans le formulaire copie
**Impact :** Perte de données utilisateur
**Status :** ✅ **RÉSOLU**
**Solution :** Utilisation de `instructions` au lieu de `steps`

### 5. 🟡 Warning React clés dupliquées
**Symptôme :** `Warning: Encountered two children with the same key`
**Impact :** Messages console, performance dégradée
**Status :** ✅ **RÉSOLU**
**Solution :** Déduplication des tags avec `[...new Set(allTags)]`

---

## 🔍 Problèmes à surveiller

### 6. 🟡 Performance générale
**Symptôme :** Temps de réponse parfois lents
**Impact :** UX dégradée
**Status :** 🕐 **À SURVEILLER**
**Actions possibles :**
- Analyser les requêtes les plus lentes
- Implémenter de la pagination côté serveur
- Optimiser les re-renders React

### 7. 🟡 Validation formulaires
**Symptôme :** Validations parfois incohérentes
**Impact :** Données invalides possibles
**Status :** 🕐 **À AMÉLIORER**
**Actions possibles :**
- Standardiser avec react-hook-form + zod
- Messages d'erreur plus clairs
- Validation temps réel

### 8. 🟡 Gestion d'erreurs API
**Symptôme :** Messages d'erreur techniques exposés
**Impact :** UX dégradée, sécurité
**Status :** 🕐 **À AMÉLIORER**
**Actions possibles :**
- Messages d'erreur utilisateur friendly
- Logging centralisé côté serveur
- Retry automatique pour certaines erreurs

---

## 🧪 Problèmes de développement

### 9. 🔵 Tests manquants
**Symptôme :** Aucune couverture de tests
**Impact :** Risque de régression
**Status :** 📝 **TODO**
**Actions possibles :**
- Tests unitaires pour les contextes React
- Tests d'intégration pour l'API
- Tests E2E avec Playwright

### 10. 🔵 Documentation API incomplète
**Symptôme :** Swagger partiellement configuré
**Impact :** Difficile pour nouveaux développeurs
**Status :** 📝 **TODO**
**Actions possibles :**
- Compléter les décorateurs Swagger
- Exemples de requêtes/réponses
- Documentation des codes d'erreur

---

## 🔧 Guide de résolution

### Pour les erreurs TypeScript
1. Vérifier les imports et types
2. Utiliser optional chaining pour les objets nullable
3. Vérifier les dépendances useEffect/useMemo

### Pour les erreurs d'API  
1. Vérifier que le backend fonctionne (http://localhost:3000)
2. Contrôler les tokens d'authentification
3. Vérifier les endpoints dans les services

### Pour les erreurs de base de données
1. Vérifier que Docker Compose tourne dans WSL
2. Appliquer les migrations Prisma si nécessaire
3. Vérifier les variables d'environnement

---

## 📊 Statistiques

- **Problèmes critiques résolus :** 3/3 (100%)
- **Problèmes mineurs résolus :** 2/2 (100%) 
- **Éléments à surveiller :** 3
- **Améliorations futures :** 2

**Dernière mise à jour :** 25/08/2025

---

*Fichier maintenu par Claude Code - Ajoutez les nouveaux problèmes découverts ici.*