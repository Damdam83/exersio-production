# Configuration SMTP pour Production

## Vue d'ensemble

L'application utilise NodeMailer avec des templates HTML professionnels pour envoyer :
- ✅ Emails de confirmation d'inscription
- ✅ Emails de récupération de mot de passe  
- ✅ Templates avec branding Exersio et emojis

## Configuration actuelle

### Mode Développement
- **Provider** : Ethereal Email (test)
- **Status** : ✅ Fonctionnel
- **Logs** : Rotation quotidienne avec preview URLs
- **Templates** : HTML professionnel avec CSS inline

### Mode Production (à configurer)
Variables d'environnement requises dans `.env` :

```bash
# Configuration SMTP Production
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_SECURE=false  # true pour port 465, false pour autres
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM_NAME=Exersio
SMTP_FROM_EMAIL=noreply@exersio.com
```

## Fournisseurs recommandés

### 1. SendGrid (Recommandé)
**Pourquoi** : Fiable, bon délivrabilité, API complète
**Prix** : 100 emails/jour gratuit, puis à partir de $15/mois

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
SMTP_FROM_NAME=Exersio
SMTP_FROM_EMAIL=noreply@votre-domaine.com
```

**Configuration** :
1. Créer compte SendGrid
2. Vérifier votre domaine
3. Générer une API Key
4. Configurer SPF/DKIM records

### 2. Gmail SMTP (Simple)
**Pourquoi** : Facile à configurer, gratuit jusqu'à 500/jour
**Limite** : 500 emails/jour, moins professionnel

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=your-app-password  # Mot de passe d'application, pas le mot de passe Gmail
SMTP_FROM_NAME=Exersio
SMTP_FROM_EMAIL=votre-email@gmail.com
```

**Configuration** :
1. Activer 2FA sur Gmail
2. Générer un mot de passe d'application
3. Utiliser le mot de passe d'application (16 caractères)

### 3. AWS SES (Économique)
**Pourquoi** : Très économique, intégration AWS
**Prix** : $0.10 pour 1000 emails

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=YOUR_SMTP_USERNAME
SMTP_PASS=YOUR_SMTP_PASSWORD
SMTP_FROM_NAME=Exersio
SMTP_FROM_EMAIL=noreply@votre-domaine.com
```

### 4. Mailjet
**Pourquoi** : Interface française, bon support
**Prix** : 200 emails/jour gratuit, puis à partir de €7/mois

```bash
SMTP_HOST=in-v3.mailjet.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=YOUR_MAILJET_API_KEY
SMTP_PASS=YOUR_MAILJET_SECRET_KEY
SMTP_FROM_NAME=Exersio
SMTP_FROM_EMAIL=noreply@votre-domaine.com
```

## Configuration DNS requise

Pour une délivrabilité optimale, configurez ces records DNS :

### SPF Record
```txt
v=spf1 include:_spf.provider.com ~all
```

### DKIM Record  
```txt
Fourni par votre provider SMTP après vérification du domaine
```

### DMARC Record
```txt
v=DMARC1; p=quarantine; rua=mailto:admin@votre-domaine.com
```

## Tests de configuration

### 1. Test local
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Vérifier les logs
```bash
# Backend logs
tail -f logs/email-$(date +%Y-%m-%d).log

# Logs globaux  
tail -f logs/combined-$(date +%Y-%m-%d).log
```

### 3. Test de délivrabilité
- Utiliser [Mail Tester](https://www.mail-tester.com)
- Tester sur Gmail, Outlook, Yahoo
- Vérifier dossier spam

## Monitoring Production

### Métriques à surveiller
- **Taux de délivrabilité** : >95%
- **Temps d'envoi** : <2 secondes  
- **Taux de bounce** : <5%
- **Taux de spam** : <1%

### Alertes recommandées
- Échec d'envoi email
- Quota SMTP atteint
- Taux de bounce élevé

## Troubleshooting

### Erreurs communes

**1. Authentication failed**
```bash
# Vérifier credentials
echo $SMTP_USER
echo $SMTP_PASS
```

**2. Connection timeout**  
```bash
# Tester connectivité
telnet smtp.provider.com 587
```

**3. Emails en spam**
```bash
# Vérifier configuration DNS
dig TXT votre-domaine.com
```

### Debug mode
```bash
# Activer logs détaillés
NODE_ENV=development npm run start:dev
```

## Migration Ethereal → Production

1. **Sauvegarder configuration actuelle**
   ```bash
   cp .env .env.backup
   ```

2. **Ajouter variables SMTP**
   ```bash
   # Ajouter à .env
   SMTP_HOST=...
   SMTP_PORT=...
   etc.
   ```

3. **Tester configuration**
   ```bash
   npm run start:dev
   # Vérifier logs : "Production SMTP" au lieu de "Ethereal Email"
   ```

4. **Monitoring**
   - Surveiller logs email pendant 24h
   - Tester différents types d'email
   - Vérifier délivrabilité

## Support

### Logs utiles
- `logs/email-YYYY-MM-DD.log` : Tous les emails envoyés
- `logs/error-YYYY-MM-DD.log` : Erreurs SMTP
- `logs/combined-YYYY-MM-DD.log` : Logs complets

### Contact
Pour support technique : vérifier documentation provider SMTP choisi.