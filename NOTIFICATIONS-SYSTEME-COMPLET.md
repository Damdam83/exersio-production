# 📱 Système de Notifications - Documentation Complète

**Date** : 25/10/2025
**Statut** : ✅ Fonctionnel et opérationnel

---

## 📊 RÉCAPITULATIF SESSION 25/10/2025

### ✅ Corrections appliquées

1. **Pagination côté serveur vraie**
   - Backend : Endpoints acceptent `limit`/`offset`, retournent `{ data, total }`
   - Frontend : Créé `api.getRaw()` pour récupérer réponse complète
   - AdminNotificationsPage : Pagination réelle avec appels API

2. **Statut 201 traité comme succès**
   - Envoi de notification retourne 201 (Created) au lieu de 200
   - Frontend traite maintenant 201 comme succès

3. **Nettoyage code**
   - Supprimé fonctions test obsolètes (`testNotification`, `testSessionReminders`)
   - Gardé section "Test Notifications (DEV)" fonctionnelle

---

## 🏗️ ARCHITECTURE SYSTÈME

### Backend (NestJS)

#### Base de données (Prisma)

**Table `Notification`**
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  data      Json?    // Données supplémentaires (sessionId, exerciseId, etc.)
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum NotificationType {
  session_reminder         // Rappel de séance
  exercise_added_to_club   // Nouvel exercice au club
  system_notification      // Notification admin/système
}
```

**Table `UserNotificationSettings`**
```prisma
model UserNotificationSettings {
  id                     String   @id @default(cuid())
  userId                 String   @unique
  sessionReminders       Boolean  @default(true)
  exerciseNotifications  Boolean  @default(true)
  systemNotifications    Boolean  @default(true)
  reminderHours          Int      @default(24)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Table `UserPushToken`** (Pour notifications push mobile)
```prisma
model UserPushToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  String   // 'ios', 'android', 'web'
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### API Endpoints

**Notifications utilisateur**
- `GET /notifications` - Liste notifications (params: limit, offset, unreadOnly)
- `PUT /notifications/:id/read` - Marquer comme lu
- `PUT /notifications/read-all` - Marquer tout comme lu
- `GET /notifications/settings` - Récupérer paramètres
- `PUT /notifications/settings` - Mettre à jour paramètres
- `POST /notifications/push-token` - Enregistrer token push

**Notifications admin** (Guard: @Roles('admin'))
- `POST /notifications/admin/send-notification` - Envoi broadcast/club/users
- `GET /notifications/admin/recent?limit=10&offset=0` - Notifications récentes
- `GET /notifications/admin/stats` - Statistiques notifications

#### Services backend

**NotificationsService** (`notifications.service.ts`)
- `create()` - Créer une notification
- `getRecentNotifications(limit, offset)` - Pagination serveur
- `createSessionReminder()` - Créer rappel séance
- `createExerciseAddedNotification()` - Notification exercice
- `sendNotificationToAll()` - Broadcast global
- `sendNotificationToClub()` - Notification à un club
- `sendNotificationToUsers()` - Notification à users spécifiques

**NotificationSchedulerService** (`notification-scheduler.service.ts`)
- Cron job quotidien : `@Cron('0 */1 * * *')` (toutes les heures)
- Vérifie les séances dans les prochaines X heures (selon préférence utilisateur)
- Envoie rappels automatiques si `sessionReminders: true`

---

### Frontend (React + TypeScript)

#### Service Frontend (`notificationService.ts`)

**Fonctionnalités**
- `initialize()` - Demande permissions notifications locales (mobile uniquement)
- `checkPermissions()` - Retourne état permissions local/push
- `getNotifications()` - Récupère notifications depuis API
- `markAsRead()` - Marque lu + émet événement EventEmitter
- `markAllAsRead()` - Marque tout lu + émet événement
- `onNotificationChange()` - S'abonner aux changements (EventEmitter)
- `scheduleLocalNotification()` - Créer notification locale (mobile + fallback web)

**EventEmitter**
```typescript
class NotificationEventEmitter {
  private listeners: NotificationEventListener[] = [];

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => { /* unsubscribe */ };
  }

  emit() {
    this.listeners.forEach(listener => listener());
  }
}
```

**Usage EventEmitter**
- `NotificationCenter` : Émet après `markAsRead()`
- `NotificationBadge` : S'abonne pour rafraîchir count en temps réel

#### Composants UI

**NotificationBadge** (`NotificationBadge.tsx`)
- Icône Bell avec badge compteur non lus
- S'abonne aux événements via `notificationService.onNotificationChange()`
- Rafraîchit count automatiquement après lecture

**NotificationCenter** (`NotificationCenter.tsx`)
- Modal avec liste notifications
- Tabs : "Toutes" / "Non lues"
- Actions : Marquer lu, Tout marquer lu
- Affichage responsive desktop/mobile

**NotificationSettingsPage** (`NotificationSettingsPage.tsx`)
- Toggles : Session reminders, Exercise notifications, System notifications
- Sélecteur délai rappels : 1h, 2h, 6h, 12h, 24h, 48h
- État permissions : Local / Push (avec statut accordé/refusé/attente)
- Section dev : Boutons pour créer notifications de test

**AdminNotificationsPage** (`AdminNotificationsPage.tsx`)
- Page admin pour envoyer notifications globales
- Form : Titre, Message, Type, Destinataires (all/club/users)
- Onglets : Formulaire / Statistiques / Notifications récentes
- Pagination vraie côté serveur (10 items/page)

---

## 🔔 TYPES DE NOTIFICATIONS

### 1. Rappel de séance ✅ Implémenté
**Type** : `session_reminder`
**Déclencheur** : Cron job automatique (toutes les heures)
**Logique** :
- Vérifie préférence `sessionReminders: true`
- Calcule délai selon `reminderHours` (défaut 24h)
- Envoie notification X heures avant la séance
- Données : `{ sessionId, sessionDate, sessionTitle }`

### 2. Nouvel exercice au club ✅ Implémenté
**Type** : `exercise_added_to_club`
**Déclencheur** : Partage d'exercice via bouton "Partager avec le club"
**Logique** :
- Vérifie préférence `exerciseNotifications: true`
- Notifie tous les membres du club
- Exclut l'auteur de l'exercice
- Données : `{ exerciseId, exerciseName, authorName }`

### 3. Notification admin/système ✅ Implémenté
**Type** : `system_notification`
**Déclencheur** : Envoi manuel depuis interface admin
**Logique** :
- Vérifie préférence `systemNotifications: true`
- Destinataires : All / Club spécifique / Users spécifiques
- Pas de données supplémentaires

### 4. Nouveau membre au club ❌ Non implémenté
**Type** : `member_joined_club` (à créer dans enum Prisma)
**Déclencheur** : Acceptation invitation club
**Logique proposée** :
- Notifier admin du club
- OU notifier tous les membres
- Données : `{ clubId, memberName, memberId }`

---

## 📱 NOTIFICATIONS MOBILE

### Capacitor Plugins
```json
"@capacitor/local-notifications": "^6.1.0",
"@capacitor/push-notifications": "^6.0.2" (désactivé temporairement)
```

### Notifications locales
- ✅ **Fonctionnel** sur Android/iOS
- Permissions demandées au premier lancement (`initialize()`)
- Fallback web : `new Notification()` si permission accordée
- Utilisé pour notifications immédiates ou tests

### Notifications push
- ⚠️ **Temporairement désactivées** (commentaire ligne 55 notificationService.ts)
- Raison : "Problème Firebase"
- Backend prêt : Endpoint `/notifications/push-token` existe
- Table `UserPushToken` créée en base
- **TODO** : Réactiver quand Firebase configuré

---

## 🔐 PERMISSIONS

### Web
- API `Notification.permission` : 'default' / 'granted' / 'denied'
- Demandée automatiquement lors du premier test
- Affichée dans paramètres notifications

### Mobile (Capacitor)
**Notifications locales**
- `LocalNotifications.requestPermissions()` au démarrage
- `LocalNotifications.checkPermissions()` pour vérifier état
- Affichage dans paramètres : "Accordées" / "Refusées" / "En attente"

**Notifications push**
- Désactivées (retourne toujours 'disabled')
- À implémenter quand Firebase sera configuré

---

## 🧪 TESTS ET DÉBOGAGE

### Section Test (NotificationSettingsPage)
**Bouton "Créer 1 notification de test"**
- Appelle `POST /notifications/admin/send-notification`
- Crée notification type `system_notification`
- Permet tester EventEmitter et badge

**Bouton "Créer 5 notifications de test"**
- Crée 5 notifications en boucle
- Utile pour tester pagination

### Logs backend
- Service Winston avec logs spécialisés
- `logs/combined-*.log` : Tous les logs
- `logs/error-*.log` : Erreurs uniquement
- Console en développement

---

## 🚀 DÉPLOIEMENT PRODUCTION

### Variables d'environnement (Render)
```bash
# Backend
SMTP_USER=<email_smtp>
SMTP_PASS=<password_smtp>
FRONTEND_URL=https://exersio-frontend.vercel.app

# CORS (IMPORTANT pour mobile)
CORS_ORIGIN=https://exersio-frontend.vercel.app,capacitor://localhost
```

### Migration Prisma
```bash
cd exersio-back
npx prisma db push  # Appliquer schema
```

### Vérifications production
- ✅ Emails de confirmation fonctionnels
- ✅ SMTP Gmail configuré
- ✅ Notifications API opérationnelle
- ✅ Pagination backend/frontend synchronisée
- ⚠️ Push notifications désactivées (à activer plus tard)

---

## 📝 TODO FUTUR

### Haute priorité
- [ ] **Réactiver push notifications** : Configurer Firebase + FCM
- [ ] **Implémenter `member_joined_club`** : Notification nouveau membre
- [ ] **Polling léger** : Vérifier nouvelles notifications toutes les 30-60s (visibility API)

### Moyenne priorité
- [ ] **Filtres notifications** : Par type, par date
- [ ] **Animation badge** : Pulse quand nouvelle notification
- [ ] **Sons personnalisés** : Sons différents par type (mobile)

### Basse priorité
- [ ] **Notifications navigateur web** : Utiliser Service Workers pour push web
- [ ] **Rich notifications** : Images, actions multiples (mobile)
- [ ] **Historique admin** : Voir toutes les notifications envoyées

---

## 🎯 RÉSUMÉ TECHNIQUE

### ✅ Fonctionnel
- Système complet notifications utilisateur
- Rappels séances automatiques (cron)
- Notifications exercices partagés
- Interface admin complète
- Pagination côté serveur
- EventEmitter temps réel
- Paramètres utilisateur persistés
- Permissions mobile gérées

### ⚠️ Partiellement fonctionnel
- Push notifications (backend prêt, Firebase manquant)

### ❌ Non implémenté
- Notification nouveau membre au club
- Polling automatique nouvelles notifications
- Filtres avancés

---

**Dernière mise à jour** : 25/10/2025 après session corrections complètes
