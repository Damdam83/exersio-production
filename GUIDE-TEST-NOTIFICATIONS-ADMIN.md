# Guide de Test - Notifications Admin

## 🎯 Accès à l'interface Admin

### Prérequis
- Compte avec **role = 'admin'** en base de données
- Être connecté sur l'application

### Comment accéder
1. Se connecter avec un compte admin
2. Cliquer sur l'icône **Profil** (en bas à droite sur mobile, dans la navigation sur desktop)
3. Dans la page Profil, scroller jusqu'à la section **"Administration"** (fond marron/amber)
4. Cliquer sur la card **"Notifications"** avec l'icône 🔔

---

## 📊 Interface Admin - 3 Onglets

### 1. Onglet "ENVOYER" (Send)

**Fonctionnalités** :
- Envoyer des notifications système à tous les utilisateurs (broadcast)
- Envoyer à tous les membres d'un club spécifique
- Envoyer à des utilisateurs sélectionnés manuellement

**Champs du formulaire** :
- **Titre** : Titre court de la notification
- **Message** : Contenu détaillé de la notification
- **Type de destinataires** :
  - 📻 `Broadcast` - Tous les utilisateurs
  - 🏢 `Club spécifique` - Tous les membres d'un club
  - 👥 `Utilisateurs spécifiques` - Sélection manuelle

**Exemple de test Broadcast** :
```
Titre: Maintenance prévue
Message: L'application sera en maintenance ce soir de 22h à 23h. Pensez à sauvegarder vos données.
Type: Broadcast (tous les utilisateurs)
```

**Exemple de test Club** :
```
Titre: Nouveau tournoi
Message: Un tournoi inter-clubs est organisé le mois prochain. Inscription ouverte !
Type: Club spécifique
Club: Sélectionner un club dans la liste
```

**Exemple de test Utilisateurs spécifiques** :
```
Titre: Convocation entraîneur
Message: Réunion des entraîneurs ce vendredi à 18h au bureau.
Type: Utilisateurs spécifiques
Utilisateurs: Cocher les utilisateurs concernés
```

---

### 2. Onglet "STATISTIQUES" (Stats)

**Métriques affichées** :
- **Total de notifications** envoyées
- **Non lues** : Nombre de notifications non lues
- **Dernières 24h** : Notifications envoyées dans les dernières 24h
- **Par type** :
  - 🔔 Rappels de séances
  - 💪 Exercices ajoutés au club
  - 👥 Nouveaux membres
  - 📢 Notifications système

**Utilité** :
- Suivre l'engagement utilisateurs
- Identifier les types de notifications les plus fréquents
- Détecter des problèmes (trop de notifications non lues = spam ?)

---

### 3. Onglet "RÉCENTES" (Recent)

**Affichage** :
- Liste des dernières notifications envoyées (tous utilisateurs confondus)
- Pour chaque notification :
  - Type (icône + badge coloré)
  - Titre + message
  - Destinataire (nom + email)
  - Date/heure d'envoi
  - Statut : Lu ✓ ou Non lu

**Utilité** :
- Vérifier qu'une notification a bien été envoyée
- Voir qui a lu ou non
- Audit des notifications système

---

## 🧪 Scénarios de Test

### Test 1 : Notification Broadcast ✅
**Objectif** : Envoyer une notification à tous les utilisateurs

**Étapes** :
1. Aller dans Profil → Administration → Notifications
2. Onglet "ENVOYER" (par défaut)
3. Remplir :
   - Titre : "Test notification globale"
   - Message : "Ceci est un test de notification broadcast"
   - Type : Broadcast (sélectionné par défaut)
4. Cliquer **"Envoyer la notification"**
5. Vérifier message de succès ✓

**Vérification** :
- Se connecter avec un autre compte (non-admin)
- Vérifier présence de la notification dans le centre de notifications
- Badge doit afficher "1" (ou +1 si déjà des non lues)

---

### Test 2 : Notification Club Spécifique ✅
**Objectif** : Envoyer une notification à un club uniquement

**Prérequis** : Au moins 1 club avec 2+ membres

**Étapes** :
1. Onglet "ENVOYER"
2. Remplir :
   - Titre : "Annonce club"
   - Message : "Message réservé aux membres du club [NomDuClub]"
   - Type : **Club spécifique**
   - Club : Sélectionner un club dans la liste déroulante
3. Envoyer
4. Vérifier message de succès

**Vérification** :
- Se connecter avec un membre du club → doit voir la notification
- Se connecter avec un non-membre → ne doit PAS voir la notification

---

### Test 3 : Notification Utilisateurs Spécifiques ✅
**Objectif** : Cibler des utilisateurs précis

**Étapes** :
1. Onglet "ENVOYER"
2. Remplir :
   - Titre : "Message personnel"
   - Message : "Notification uniquement pour vous"
   - Type : **Utilisateurs spécifiques**
   - Cocher 2-3 utilisateurs dans la liste
3. Envoyer

**Vérification** :
- Se connecter avec les utilisateurs cochés → doivent voir la notification
- Se connecter avec d'autres utilisateurs → ne doivent PAS la voir

---

### Test 4 : Statistiques ✅
**Objectif** : Vérifier le calcul des métriques

**Étapes** :
1. Noter le nombre de notifications existantes (onglet STATISTIQUES)
2. Envoyer 1 notification broadcast (Test 1)
3. Rafraîchir l'onglet STATISTIQUES
4. Vérifier que :
   - Total a augmenté (nombre d'utilisateurs × 1)
   - Non lues a augmenté du même montant
   - Dernières 24h a augmenté

**Vérification des types** :
- Après partage d'exercice → Type "exercise_added_to_club" augmente
- Après rappel séance → Type "session_reminder" augmente
- Après invitation acceptée → Type "member_joined_club" augmente
- Après notification admin → Type "system_notification" augmente

---

### Test 5 : Notifications Récentes ✅
**Objectif** : Audit des notifications envoyées

**Étapes** :
1. Onglet "RÉCENTES"
2. Vérifier que les notifications des Tests 1-3 apparaissent
3. Pour chaque notification, vérifier :
   - Type affiché correctement (📢 Système)
   - Titre + message corrects
   - Destinataire avec nom + email
   - Date/heure cohérentes
   - Statut "Non lu" (si juste envoyée)

**Vérification dynamique** :
1. Ouvrir 2 comptes en parallèle (admin + utilisateur normal)
2. Envoyer notification depuis admin
3. Marquer comme lue depuis utilisateur normal
4. Rafraîchir onglet RÉCENTES sur admin
5. Vérifier que le statut passe à "Lu ✓"

---

## 🔐 Sécurité - Tests de Permissions

### Test Permission Admin
**Objectif** : Vérifier que seuls les admins accèdent à l'interface

**Test A - Avec compte admin** :
1. Se connecter avec role='admin'
2. Aller sur Profil
3. **Doit voir** la section "Administration" avec fond marron

**Test B - Avec compte non-admin** :
1. Se connecter avec role='coach' ou role='user'
2. Aller sur Profil
3. **Ne doit PAS voir** la section "Administration"

**Test C - Appel API direct** :
```bash
# Avec token non-admin, tenter d'envoyer une notification
curl -X POST http://localhost:3000/api/notifications/admin/send-notification \
  -H "Authorization: Bearer TOKEN_NON_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "message": "Tentative accès non autorisé",
    "type": "system_notification"
  }'
```
**Résultat attendu** : Erreur 403 Forbidden

---

## 🐛 Points de Vigilance

### Problèmes potentiels à vérifier

1. **Liste vide** :
   - Si aucun club → Liste clubs vide dans sélecteur
   - Si aucun utilisateur → Impossible de sélectionner utilisateurs spécifiques

2. **Chargement lent** :
   - Si beaucoup d'utilisateurs → Liste peut être longue
   - Statistiques peuvent prendre du temps à calculer

3. **Notifications non reçues** :
   - Vérifier préférences utilisateur (exerciseNotifications peut être false)
   - Vérifier que le compte est bien actif (emailVerified = true)

4. **Badge non mis à jour** :
   - Nécessite rafraîchissement de la page
   - Polling automatique toutes les 30s normalement

---

## 🎯 Checklist Complète des Tests

- [ ] **Test 1** : Broadcast notification (tous utilisateurs)
- [ ] **Test 2** : Notification club spécifique
- [ ] **Test 3** : Notification utilisateurs ciblés
- [ ] **Test 4** : Statistiques mises à jour
- [ ] **Test 5** : Liste notifications récentes
- [ ] **Test 6** : Permission admin uniquement
- [ ] **Test 7** : Badge mis à jour après envoi
- [ ] **Test 8** : Marquer comme lu depuis utilisateur
- [ ] **Test 9** : API refuse accès non-admin (403)
- [ ] **Test 10** : Notifications respectent préférences utilisateur

---

## 📝 Notes pour le développeur

### Backend Ready ✅
- Endpoints admin protégés par `@UseGuards(RolesGuard)` et `@Roles('admin')`
- 3 méthodes disponibles :
  - `createNotification()` - Utilisateur unique
  - `createNotificationForClubMembers()` - Tous membres d'un club
  - `createBroadcastNotification()` - Tous utilisateurs

### Frontend Ready ✅
- Page complète `AdminNotificationsPage.tsx`
- 3 onglets fonctionnels (Send, Stats, Recent)
- Formulaires validés et sécurisés
- Accès conditionnel (role === 'admin')

### Base de Données
```sql
-- Vérifier les notifications admin envoyées
SELECT
  n.id, n.type, n.title, n."isRead",
  u.email as recipient,
  n."createdAt"
FROM "Notification" n
JOIN "User" u ON u.id = n."userId"
WHERE n.type = 'system_notification'
ORDER BY n."createdAt" DESC
LIMIT 10;
```

---

**Bon test ! 🚀**
