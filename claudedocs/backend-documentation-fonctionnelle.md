# Documentation Fonctionnelle - Backend Exersio

> Documentation fonctionnelle complète du système backend Exersio pour stakeholders business
> 
> **Version :** 1.0  
> **Date :** Septembre 2025  
> **Audience :** Product Owners, Business Analysts, Stakeholders

---

## 🎯 Vue d'ensemble d'Exersio

**Exersio** est une plateforme digitale de gestion d'entraînements sportifs conçue pour les coachs, clubs sportifs et leurs athlètes. L'application permet de :

- **Créer et partager** des exercices d'entraînement avec schémas visuels
- **Planifier et organiser** des séances d'entraînement structurées
- **Gérer des clubs** avec système de rôles et permissions multi-niveaux
- **Suivre les performances** et favoris des athlètes
- **Communiquer** via notifications et invitations automatisées

### Utilisateurs cibles
- **Entraîneurs/Coachs** : Création d'exercices, planification séances, gestion équipes
- **Athlètes** : Accès aux entraînements, suivi personnel, favoris
- **Administrateurs de club** : Gestion membres, permissions, organisation globale

---

## 🏗️ Architecture Fonctionnelle

Le backend Exersio s'organise autour de **12 modules fonctionnels** interconnectés :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UTILISATEURS  │────│     CLUBS       │────│  INVITATIONS    │
│   Profils       │    │   Multi-tenant  │    │  Gestion accès  │
│   Authentificat.│    │   Rôles         │    │  Expiration     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   EXERCICES     │────│    SÉANCES      │    │  NOTIFICATIONS  │
│   CRUD + Share  │    │   Planification │    │   Automatiques  │
│   Favoris       │    │   Duplication   │    │   CRON Jobs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CATÉGORIES    │    │    UPLOADS      │    │   VERSIONING    │
│   Classification│    │    AWS S3       │    │   App Mobile    │
│   Âge/Niveau    │    │    Médias       │    │   MAJ Forcées   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📋 Fonctionnalités Détaillées par Module

### 🔐 Module Authentification

**Objectif** : Sécuriser l'accès à la plateforme avec un système d'authentification robuste

#### Fonctionnalités clés
- **Inscription sécurisée** avec validation email obligatoire
- **Connexion JWT** avec tokens de session
- **Récupération mot de passe** par email avec liens temporaires
- **Confirmation email** automatique avec relance possible
- **Sécurité renforcée** : tokens expirables, hash bcrypt, protection CSRF

#### Workflow utilisateur type
1. **Inscription** → Email de confirmation → Activation compte
2. **Connexion** → Génération token JWT → Accès sécurisé 
3. **Mot de passe oublié** → Email reset → Nouveau mot de passe → Connexion

#### Règles métier
- Email obligatoire et unique par utilisateur
- Mot de passe minimum 8 caractères avec complexité
- Token de confirmation valide 24h, reset password valide 1h
- Maximum 5 tentatives de connexion avant blocage temporaire

---

### 👥 Module Utilisateurs

**Objectif** : Gérer les profils utilisateurs avec système de rôles hiérarchiques

#### Fonctionnalités clés
- **Profils complets** : nom, email, photo, préférences
- **Système de rôles** : Admin, Coach, Athlete, Guest
- **Gestion CRUD** : création, lecture, modification, suppression
- **Permissions granulaires** selon le rôle et l'appartenance club
- **Historique activité** : dernière connexion, actions importantes

#### Rôles et permissions
- **Admin** : Accès total, gestion tous utilisateurs et clubs
- **Coach** : Gestion athlètes de son club, création exercices/séances
- **Athlete** : Lecture exercices/séances, gestion favoris personnels
- **Guest** : Accès limité en lecture seule

#### Règles métier
- Un utilisateur peut appartenir à plusieurs clubs avec des rôles différents
- Seuls les admins peuvent modifier les rôles
- Suppression utilisateur = anonymisation des données (RGPD)

---

### 🏃‍♂️ Module Exercices

**Objectif** : Bibliothèque centrale d'exercices avec partage et collaboration

#### Fonctionnalités clés
- **Création d'exercices** : nom, description, schéma visuel, durée, matériel
- **Critères de réussite** : objectifs mesurables et indicateurs de performance
- **Catégorisation** : sport, niveau, âge, compétences travaillées
- **Partage intelligent** : privé, club, public avec permissions
- **Système de favoris** : bookmarking personnel des exercices préférés
- **Duplication et adaptation** : cloner un exercice pour le personnaliser

#### Workflow création d'exercice
1. **Conception** → Ajout détails + schéma → Définition critères réussite
2. **Catégorisation** → Tags + niveau + âge cible
3. **Partage** → Choix visibilité (privé/club/public)
4. **Utilisation** → Intégration dans séances + favoris athlètes

#### Règles métier
- Exercices privés : visibles uniquement par le créateur
- Exercices club : visibles par tous les membres du club
- Exercices publics : visibles par tous les utilisateurs
- Seul le créateur peut modifier un exercice (sauf admins)
- Exercices utilisés dans des séances ne peuvent être supprimés

---

### 📅 Module Séances

**Objectif** : Planification et organisation d'entraînements structurés

#### Fonctionnalités clés
- **Planification séances** : date, horaire, lieu, durée totale
- **Composition exercices** : ajout multiple d'exercices avec séquençage
- **Échauffement/récupération** : sections spécialisées de la séance
- **Duplication intelligente** : cloner séances pour réutilisation
- **Historique complet** : traçabilité des séances passées
- **Attribution équipes** : assigner séances à groupes d'athlètes

#### Types de séances
- **Entraînement standard** : séance classique avec exercices variés
- **Évaluation** : séance test avec critères de mesure
- **Compétition** : séance match/tournoi avec objectifs spécifiques
- **Récupération** : séance légère post-effort intense

#### Workflow planification
1. **Création séance** → Définition cadre (date/lieu/durée)
2. **Ajout exercices** → Sélection + ordre + temps par exercice
3. **Validation** → Vérification cohérence + durée totale
4. **Publication** → Notification athlètes concernés

#### Règles métier
- Une séance doit contenir au minimum 1 exercice
- Durée totale calculée automatiquement (somme exercices + transitions)
- Seuls coaches et admins peuvent créer des séances
- Séances passées non modifiables (historique préservé)

---

### 🏛️ Module Clubs

**Objectif** : Gestion multi-tenant avec isolation des données par organisation

#### Fonctionnalités clés
- **Création clubs** : nom, logo, description, coordonnées
- **Gestion membres** : ajout/suppression avec rôles spécifiques
- **Isolation données** : chaque club voit uniquement ses contenus
- **Paramétrage club** : préférences, thème, configuration notifications
- **Statistiques** : nombre membres, exercices, séances actives

#### Hiérarchie club type
```
Club Sportif XYZ
├── Administrateurs (gestion globale)
├── Entraîneurs (création contenu, gestion athlètes)  
├── Athlètes Équipe A (accès exercices équipe A)
├── Athlètes Équipe B (accès exercices équipe B)
└── Invités (accès lecture limitée)
```

#### Règles métier
- Un utilisateur peut appartenir à plusieurs clubs
- Les données sont isolées par club (exercices, séances, statistiques)
- Seuls les admins club peuvent inviter de nouveaux membres
- Suppression club = transfert ou suppression de toutes les données

---

### ⭐ Module Favoris

**Objectif** : Personnalisation de l'expérience utilisateur par bookmarking

#### Fonctionnalités clés
- **Favoris exercices** : marquer les exercices préférés pour accès rapide
- **Collections personnelles** : organiser les favoris par thème
- **Synchronisation** : favoris accessibles sur tous les devices
- **Partage favoris** : recommandations entre athlètes du même club

#### Workflow favoris
1. **Découverte exercice** → Clic favori → Ajout collection personnelle
2. **Organisation** → Création collections thématiques (cardio, force, etc.)
3. **Utilisation** → Accès rapide via page favoris
4. **Partage** → Recommandation à autres membres du club

#### Règles métier
- Favoris strictement personnels (pas de partage automatique)
- Suppression exercice = suppression automatique des favoris
- Limite de 500 favoris par utilisateur (performance)

---

### 🔔 Module Notifications

**Objectif** : Communication automatisée et engagement utilisateur

#### Fonctionnalités clés
- **Notifications temps réel** : nouvelle séance, modification exercice
- **Rappels automatiques** : séance dans 2h, confirmation présence
- **Notifications push mobile** : alertes sur application mobile
- **Préférences utilisateur** : personnalisation fréquence et types
- **Historique notifications** : consultation messages passés

#### Types de notifications
- **Séances** : nouvelle séance planifiée, modification, annulation
- **Exercices** : nouvel exercice partagé, exercice favori modifié
- **Club** : nouvelle invitation, changement de rôle
- **Rappels** : séance dans 2h, évaluation à faire
- **Système** : maintenance, nouvelle version disponible

#### Règles automatisation (CRON Jobs)
- **Rappel 2h avant** : notification push + email pour séances
- **Résumé hebdomadaire** : statistiques personnelles chaque lundi
- **Exercices populaires** : suggestions basées sur les favoris
- **Inactivité** : relance utilisateurs non connectés depuis 15 jours

#### Règles métier
- Utilisateur peut désactiver tous types de notifications
- Notifications critiques (sécurité) non désactivables
- Rétention historique 6 mois maximum (RGPD)

---

### 📧 Module Email

**Objectif** : Communication externe automatisée et templates professionnels

#### Fonctionnalités clés
- **Templates HTML** : emails visuellement attractifs et responsives
- **Envoi automatique** : confirmation inscription, reset password, invitations
- **Suivi livraison** : statuts d'envoi et erreurs de délivrance
- **Personnalisation** : emails adaptés au club et à l'utilisateur
- **Configuration SMTP** : support Gmail, SendGrid, services tiers

#### Types d'emails automatiques
- **Authentification** : confirmation compte, reset password
- **Invitations** : invitation rejoindre club avec lien d'activation
- **Notifications** : résumé séances, rappels importants
- **Marketing** : nouvelles fonctionnalités, conseils entraînement

#### Templates disponibles
- Email de bienvenue avec présentation Exersio
- Confirmation d'inscription avec lien d'activation
- Reset password sécurisé avec expiration
- Invitation club personnalisée avec logo
- Notifications séances avec détails et planning

#### Règles métier
- Tous les emails transactionnels (auth) sont prioritaires
- Emails marketing désactivables via préférences
- Conservation logs d'envoi 1 an (audit et support)
- Rate limiting : maximum 100 emails/jour par utilisateur

---

### 🗂️ Module Catégories

**Objectif** : Classification et organisation du contenu pour faciliter la découverte

#### Fonctionnalités clés
- **Catégories exercices** : force, cardio, souplesse, technique, stratégie
- **Niveaux** : débutant, intermédiaire, avancé, expert
- **Classes d'âge** : U10, U12, U15, U18, Senior, Vétéran
- **Sports** : football, basketball, tennis, natation, etc.
- **Matériel** : ballon, cône, échelle, médecine-ball, aucun

#### Hiérarchie de classification
```
Sport (Football)
├── Catégorie (Technique)
│   ├── Niveau (Intermédiaire)  
│   │   └── Âge (U15-U18)
│   │       └── Exercices correspondants
└── Catégorie (Physique)
    ├── Niveau (Avancé)
    │   └── Âge (Senior)
    │       └── Exercices correspondants
```

#### Règles métier
- Exercice peut avoir plusieurs catégories (multi-tag)
- Filtrage intelligent par combinaison de critères
- Catégories modifiables uniquement par admins
- Suppression catégorie = recatégorisation obligatoire des exercices

---

### 💌 Module Invitations

**Objectif** : Gestion sécurisée de l'accueil de nouveaux membres

#### Fonctionnalités clés
- **Invitations par email** : lien sécurisé avec token d'activation temporaire
- **Gestion expiration** : invitations valides 7 jours par défaut
- **Suivi statuts** : envoyée, acceptée, expirée, annulée
- **Relance automatique** : rappel 24h avant expiration
- **Attribution rôle** : définition du rôle lors de l'invitation

#### Workflow invitation
1. **Admin club** → Saisie email + rôle → Génération lien sécurisé
2. **Envoi email** → Template personnalisé avec lien d'activation  
3. **Clic lien** → Page inscription pré-remplie + club auto-assigné
4. **Validation** → Compte créé + ajout automatique au club

#### Types d'invitations
- **Invitation coach** : droits création exercices/séances
- **Invitation athlète** : droits consultation + favoris
- **Invitation admin** : droits gestion membres (délégation)
- **Invitation invité** : droits lecture seule temporaire

#### Règles métier
- Une invitation par email par club (pas de doublons)
- Expiration automatique après 7 jours
- Utilisateur existant = ajout direct au club (pas de re-inscription)
- Seuls admins et coaches peuvent inviter

---

### 📁 Module Uploads

**Objectif** : Gestion centralisée des médias avec stockage cloud sécurisé

#### Fonctionnalités clés
- **Upload sécurisé** : validation type/taille avant stockage AWS S3
- **Gestion photos profil** : avatar utilisateur avec redimensionnement
- **Schémas d'exercices** : images/diagrammes pour illustrer les mouvements
- **Logos clubs** : branding personnalisé pour chaque organisation
- **Optimisation automatique** : compression et formats multiples

#### Types de fichiers supportés
- **Images** : JPG, PNG, GIF (max 5MB)
- **Documents** : PDF pour guides d'exercices (max 10MB)
- **Vidéos** : MP4 pour démonstrations (max 50MB)

#### Pipeline de traitement
```
Upload fichier → Validation → Scan virus → Compression → 
AWS S3 → Génération URL → Liaison base de données
```

#### Sécurité et performance
- **Scan antivirus** automatique de tous les uploads
- **CDN** : distribution mondiale pour temps de chargement optimaux
- **Permissions** : accès fichiers selon rôles utilisateur
- **Sauvegarde** : réplication multi-zone AWS pour haute disponibilité

#### Règles métier
- Seuls utilisateurs authentifiés peuvent upload
- Fichiers privés accessibles uniquement par le propriétaire
- Fichiers club accessibles par tous les membres
- Suppression automatique après 2 ans d'inactivité (optimisation coûts)

---

### 📱 Module Versioning App

**Objectif** : Gestion des versions mobiles avec mises à jour contrôlées

#### Fonctionnalités clés
- **Vérification version** : check automatique au démarrage de l'app
- **Mises à jour optionnelles** : nouvelles fonctionnalités non-critiques
- **Mises à jour obligatoires** : correctifs sécurité et bugs critiques
- **Messages personnalisés** : notes de version avec détails des améliorations
- **Rollback** : possibilité de revenir à version stable en cas de problème

#### Types de mises à jour
- **Patch (1.0.X)** : corrections bugs, améliorations mineures
- **Minor (1.X.0)** : nouvelles fonctionnalités, améliorations UX
- **Major (X.0.0)** : refonte architecture, changements majeurs

#### Workflow mise à jour
1. **Check version** → Comparaison version app vs serveur
2. **Notification** → Popup avec détails de la mise à jour
3. **Choix utilisateur** → Maintenant, plus tard, ou obligatoire
4. **Download** → Téléchargement depuis store officiel

#### Règles métier
- Versions obsolètes (>6 mois) forcent la mise à jour
- Rollback possible uniquement vers version N-1
- Messages multilingues selon préférences utilisateur
- Statistiques d'adoption pour monitoring du déploiement

---

## 🔄 Workflows Utilisateur Complets

### Workflow Coach : De l'inscription à la première séance

```
1. INSCRIPTION
   └─ Inscription → Email confirmation → Activation compte ✓

2. CRÉATION CLUB / REJOINDRE CLUB
   ├─ Option A: Créer nouveau club → Devenir admin
   └─ Option B: Recevoir invitation → Rejoindre comme coach

3. CRÉATION D'EXERCICES
   └─ Nouvel exercice → Détails + schéma → Catégorisation → Partage club

4. PLANIFICATION SÉANCE  
   └─ Nouvelle séance → Ajout exercices → Définition timing → Publication

5. GESTION ÉQUIPE
   └─ Invitation athlètes → Attribution séances → Suivi favoris
```

### Workflow Athlète : Découverte et engagement

```
1. ACCÈS PLATEFORME
   └─ Réception invitation → Inscription → Confirmation email → Connexion

2. DÉCOUVERTE CONTENU
   └─ Navigation exercices → Filtrage par catégorie → Ajout favoris

3. PARTICIPATION SÉANCES
   └─ Consultation planning → Séance détaillée → Critères réussite

4. SUIVI PERSONNEL
   └─ Historique séances → Exercices favoris → Progression personnelle
```

### Workflow Admin Club : Gestion complète

```
1. CONFIGURATION CLUB
   └─ Création club → Logo + paramètres → Invitation premier coach

2. GESTION MEMBRES
   └─ Invitations en masse → Attribution rôles → Suivi activité

3. SUPERVISION CONTENU  
   └─ Validation exercices → Organisation séances → Statistiques usage

4. ADMINISTRATION
   └─ Paramètres club → Notifications → Gestion permissions
```

---

## ⚖️ Règles Métier Transversales

### Sécurité et Confidentialité
- **Isolation club** : chaque club accède uniquement à ses données
- **Chiffrement** : toutes les communications API en HTTPS
- **Audit trail** : logs de toutes les actions sensibles (création, modification, suppression)
- **RGPD compliance** : droit à l'oubli, portabilité des données, consentement

### Performance et Scalabilité  
- **Rate limiting** : limitation requêtes API (1000/heure/utilisateur)
- **Cache intelligent** : mise en cache des exercices et séances populaires
- **Pagination** : limitation résultats (50 éléments max par page)
- **Optimisation images** : compression automatique et formats multiples

### Qualité des Données
- **Validation stricte** : tous les inputs utilisateur validés côté serveur
- **Cohérence référentielle** : integrity constraints en base de données
- **Nettoyage automatique** : suppression données orphelines (CRON nightly)
- **Backup quotidien** : sauvegarde complète chaque nuit avec rétention 30 jours

---

## 🔌 Intégrations Externes

### Service Email (NodeMailer)
- **SMTP configurable** : support Gmail, SendGrid, Mailgun
- **Templates HTML** : emails responsives avec branding club
- **Tracking** : suivi taux d'ouverture et clics (optionnel)
- **Anti-spam** : respect RFC et bonnes pratiques délivrabilité

### Stockage Cloud (AWS S3)
- **Stockage sécurisé** : chiffrement at-rest et in-transit
- **CDN global** : CloudFront pour performance mondiale
- **Backup automatique** : réplication multi-région
- **Optimisation coûts** : lifecycle policies et archivage

### Notifications Push (Firebase)
- **Multi-plateforme** : iOS + Android + Web
- **Ciblage intelligent** : par rôle, club, préférences utilisateur
- **Analytics** : taux d'engagement et conversion
- **A/B testing** : optimisation messages et timing

---

## 📊 Métriques et KPIs Business

### Engagement Utilisateur
- **Utilisateurs actifs** : DAU, MAU par club et global
- **Temps de session** : durée moyenne d'utilisation
- **Actions par session** : exercices consultés, favoris ajoutés
- **Rétention** : pourcentage utilisateurs actifs après 1, 7, 30 jours

### Contenu et Adoption
- **Exercices créés** : nombre par coach, par club, par catégorie
- **Séances planifiées** : fréquence et participation moyenne
- **Favoris** : exercices les plus populaires, tendances
- **Partage** : ratio exercices privés vs club vs publics

### Performance Technique
- **Temps de réponse API** : moyenne <200ms pour 95% des requêtes
- **Disponibilité** : uptime 99.9% avec monitoring 24/7
- **Erreurs** : taux d'erreur <0.1% avec alerting automatique
- **Scalabilité** : support 10 000 utilisateurs concurrent avec auto-scaling

---

## 🚀 Roadmap Fonctionnelle Future

### Court Terme (3 mois)
- **Analytics avancées** : dashboard personnalisé pour coaches
- **Mode hors connexion** : synchronisation exercices/séances offline
- **Notifications intelligentes** : IA pour timing optimal des rappels
- **Export/Import** : sauvegarde et migration données club

### Moyen Terme (6 mois)  
- **Gamification** : badges, points, classements motivationnels
- **Intégration calendriers** : sync Google Calendar, Outlook
- **API publique** : webhooks pour intégrations tiers
- **Multi-langue** : support français, anglais, espagnol

### Long Terme (12 mois)
- **IA recommandations** : suggestions exercices personnalisées  
- **Analyse vidéo** : reconnaissance mouvement et feedback automatique
- **Intégration capteurs** : données cardio et performance temps réel
- **Marketplace** : économie de contenu entre clubs et coaches

---

*Cette documentation fonctionnelle constitue la référence business d'Exersio. Elle est maintenue à jour avec l'évolution du produit et sert de base pour les spécifications techniques et les décisions produit.*