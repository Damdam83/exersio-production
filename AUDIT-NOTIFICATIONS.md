# 📊 Audit Complet - Système de Notifications

**Date** : 24/10/2025
**Objectif** : Analyser l'état actuel et définir les corrections nécessaires

---

## 🔍 ÉTAT ACTUEL

### ✅ Ce qui fonctionne (Backend)

**Base de données :**
- ✅ Table `Notification` avec colonnes : id, userId, type, title, message, data, isRead, createdAt
- ✅ Table `UserNotificationSettings` pour préférences utilisateur
- ✅ Table `UserPushToken` pour push notifications mobile

**API Endpoints :**
- ✅ `GET /notifications` - Liste notifications avec filtres
- ✅ `PUT /notifications/:id/read` - Marquer comme lu (fonctionne)
- ✅ `PUT /notifications/read-all` - Marquer tout comme lu
- ✅ `GET /notifications/settings` - Récupérer paramètres utilisateur
- ✅ `PUT /notifications/settings` - Mettre à jour paramètres
- ✅ `POST /notifications/push-token` - Enregistrer token mobile
- ✅ `POST /admin/send-notification` - Envoi admin (existe mais non testé)

**Types de notifications supportés (Prisma) :**
```typescript
enum NotificationType {
  session_reminder         // Rappel de séance
  exercise_added_to_club   // Nouvel exercice au club
  system_notification      // Notification système/admin
}
```

**Logique métier implémentée :**
- ✅ Rappels de séances automatiques (scheduler avec cron job)
- ✅ Notification lors ajout exercice au club
- ✅ Respect des préférences utilisateur (sessionReminders, exerciseNotifications, systemNotifications)

---

## ❌ PROBLÈMES IDENTIFIÉS

### 1. 🖥️ DESKTOP - Pas d'icône notifications
**Problème** : Navigation desktop entièrement commentée (ligne 154-197 Navigation.tsx)
**Impact** : Utilisateurs desktop ne peuvent pas accéder aux notifications
**Fichier** : `src/components/Navigation.tsx`

### 2. 🎨 UI - Background modal blanc
**Problème** : Modal NotificationCenter a fond blanc, pas cohérent avec le site
**Ligne** : NotificationCenter.tsx ligne 100-110 environ
**Besoin** : Adapter couleurs au thème général (gris/slate)

### 3. 🚨 ERREUR 500 - GET /notifications/settings
**Problème** : 2 appels simultanés retournent 500
**Cause potentielle** :
- Table `UserNotificationSettings` n'existe pas en DB
- OU migration Prisma non appliquée
- OU champs manquants dans le schema

**À vérifier** :
```bash
cd exersio-back
npx prisma db push  # Vérifier si schema sync
```

### 4. 💥 CRASH - Boutons page paramètres
**Problème** : Boutons dans NotificationSettingsPage font crasher l'app
**Boutons concernés** :
- "Tester une notification locale" (ligne 349)
- "Tester les rappels de séances" (ligne 357)

**Cause probable** :
- `testNotification()` appelle Capacitor APIs non disponibles en web
- `testSessionReminders()` appelle API qui n'existe pas ou crashe

### 5. 🔔 Badge non mis à jour
**Problème** : Badge reste "9" même après lecture notifications
**Cause** : NotificationBadge n'écoute pas les événements de mise à jour
**Fichiers** :
- `NotificationCenter.tsx` lignes 39-51 (markAsRead met à jour state local)
- `NotificationCenter.tsx` lignes 251-285 (Badge charge count une seule fois)

### 6. ❓ 9 notifications sur nouveau compte
**Problème** : Compte neuf a 9 notifications non lues
**À investiguer** :
- Qui crée ces notifications automatiquement ?
- seed-sports.ts ? Création de compte ? Autres ?

---

## 📋 TYPES DE NOTIFICATIONS ATTENDUS

### 🎯 Notifications à implémenter/vérifier

**1. Rappel de séance** ✅ IMPLÉMENTÉ
- Déclenché X heures avant la séance (défaut 24h, paramétrable)
- Géré par `notification-scheduler.service.ts` avec cron job
- Respecte préférence `sessionReminders`

**2. Nouvel exercice ajouté au club** ✅ IMPLÉMENTÉ
- Quand un membre partage un exercice avec le club
- Notifie tous les membres du club
- Respecte préférence `exerciseNotifications`

**3. Nouveau membre dans le club** ❌ NON IMPLÉMENTÉ
- Quand un membre rejoint le club
- Notifier les admins et/ou tous les membres ?
- Type Prisma : `NotificationType.member_joined_club` (À CRÉER)

**4. Notification admin globale** ⚠️ PARTIELLEMENT IMPLÉMENTÉ
- Endpoint existe : `POST /notifications/admin/send-notification`
- Pas de protection admin (TODO dans le code ligne 93)
- Pas d'interface pour envoyer

---

## 🛠️ PLAN DE CORRECTION

### Phase 1 - Bugs Critiques (2-3h)

#### 1.1 Fix Navigation Desktop (30min)
- Décommenter navigation desktop
- Ajouter NotificationBadge avec icône Bell
- Tester affichage

#### 1.2 Fix Background Modal (15min)
- Changer couleurs NotificationCenter
- Palette gris/slate cohérente
- Tester dark mode si applicable

#### 1.3 Fix Erreur 500 Settings (45min)
**Vérifications** :
1. Schéma Prisma contient `UserNotificationSettings` ?
2. Migration appliquée en DB locale ?
3. Migration appliquée en production ?

**Actions** :
```bash
# Local
cd exersio-back
npx prisma db push

# Production (si besoin)
# Vérifier Render logs
```

#### 1.4 Fix/Supprimer Boutons Test (30min)
**Option A** : Supprimer complètement (RECOMMANDÉ)
- Retirer boutons "Tester" ligne 346-359

**Option B** : Corriger l'implémentation
- Wrap dans `if (Capacitor.isNativePlatform())`
- Désactiver sur web

#### 1.5 Fix Badge Non Mis à Jour (1h)
**Solution EventEmitter** :
```typescript
// Créer EventEmitter simple
class NotificationEvents {
  private listeners = new Set<() => void>();

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit() {
    this.listeners.forEach(cb => cb());
  }
}

export const notificationEvents = new NotificationEvents();
```

**Modifications** :
- NotificationCenter : appeler `notificationEvents.emit()` après markAsRead
- NotificationBadge : écouter événements et recharger count

---

### Phase 2 - Nouvelles Fonctionnalités (3-4h)

#### 2.1 Notification "Nouveau membre" (1.5h)
1. Ajouter type Prisma : `member_joined_club`
2. Créer méthode `notifyNewMember()` dans service
3. Appeler lors de l'ajout membre au club
4. Tester

#### 2.2 Interface Admin Notifications Globales (2h)
1. Créer page `AdminNotificationsPage.tsx`
2. Form : titre, message, destinataires (all/club/specific)
3. Appeler `POST /admin/send-notification`
4. Ajouter guard admin sur endpoint backend
5. Tester envoi à tous les utilisateurs

#### 2.3 Investigation 9 notifications (30min)
1. Logger création notifications (déjà fait dans service)
2. Créer compte test frais
3. Vérifier logs backend
4. Identifier source
5. Supprimer si seed ou bug

---

### Phase 3 - Améliorations UX (2h)

#### 3.1 Polling Léger (30min)
- Réactiver polling 30-60s
- Uniquement si app active (visibility API)
- Silencieux (skipGlobalLoading)

#### 3.2 Indicateurs Visuels (30min)
- Animation badge quand nouveau
- Son/vibration sur mobile (optionnel)
- Toast discret "Nouvelle notification"

#### 3.3 Filtres Notifications (1h)
- Filtre par type (séances, exercices, système)
- Filtre par date
- Recherche dans notifications

---

## 📊 RÉCAPITULATIF

**Bugs critiques** : 6 identifiés
**Fonctionnalités manquantes** : 2 (nouveau membre, interface admin)
**Temps estimé total** : 7-9h
- Phase 1 (bugs) : 2-3h
- Phase 2 (features) : 3-4h
- Phase 3 (UX) : 2h

**Priorités recommandées** :
1. 🔥 Fix navigation desktop + badge refresh (1.5h) - URGENT
2. 🔥 Fix erreur 500 settings (45min) - URGENT
3. 🟡 Supprimer boutons test + fix background (45min) - IMPORTANT
4. 🟡 Investigation 9 notifications (30min) - IMPORTANT
5. 🟢 Reste selon besoins métier

---

## ❓ QUESTIONS À VALIDER

1. **Nouveau membre au club** - Qui notifier ? Admins only ou tous les membres ?
2. **Notifications admin** - Qui peut envoyer ? Juste super-admin ou admin club ?
3. **Polling** - Voulez-vous polling auto ou seulement refresh manuel ?
4. **Push notifications mobile** - Activer Firebase Cloud Messaging ?
5. **Rétention** - Garder notifs combien de temps ? 30j ? 90j ? Infini ?

