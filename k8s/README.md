# 🚀 Exersio Kubernetes Deployment

Configuration complète pour déployer Exersio sur Kubernetes avec Docker containers.

## 📋 Prérequis

- **Kubernetes cluster** (GKE, EKS, AKS, ou local avec minikube)
- **kubectl** configuré pour votre cluster
- **Docker registry** (GitHub Container Registry, Docker Hub, ou privé)
- **nginx-ingress-controller** installé sur le cluster
- **cert-manager** pour SSL automatique (optionnel)

## 🏗️ Architecture

```
Internet → Ingress (SSL) → Frontend (nginx) → Backend (NestJS) → PostgreSQL
                        └→ /api routes ────────┘
```

## 🚀 Déploiement rapide

### 1. Configuration des secrets

```bash
# Encoder vos secrets en base64
echo -n "your-jwt-secret" | base64
echo -n "your-postgres-password" | base64
echo -n "your-smtp-password" | base64

# Éditer k8s/secrets.yaml avec vos valeurs
```

### 2. Configuration du domaine

```bash
# Éditer k8s/configmap.yaml et k8s/ingress.yaml
# Remplacer "exersio.yourdomain.com" par votre domaine
```

### 3. Build et déploiement

```bash
# Option 1: Via Makefile
make all REGISTRY=ghcr.io/yourusername/exersio

# Option 2: Via script
chmod +x k8s/deploy.sh
./k8s/deploy.sh all

# Option 3: Manuel
docker build -t ghcr.io/yourusername/exersio/backend:latest ./exersio-back/
docker build -t ghcr.io/yourusername/exersio/frontend:latest ./exersio-front/
docker push ghcr.io/yourusername/exersio/backend:latest
docker push ghcr.io/yourusername/exersio/frontend:latest
kubectl apply -k ./k8s/
```

## 🔧 Commandes utiles

```bash
# Status du déploiement
make status

# Logs en temps réel
make logs-backend
make logs-frontend

# Redémarrer les deployments
make restart

# Nettoyer tout
make clean
```

## 📊 Monitoring

```bash
# Pods status
kubectl get pods -n exersio

# Événements récents
kubectl get events -n exersio --sort-by='.lastTimestamp'

# Métriques HPA
kubectl get hpa -n exersio
```

## 🔒 Sécurité

- **Non-root containers** : Tous les containers tournent avec des utilisateurs non-privilégiés
- **Health checks** : Liveness et readiness probes configurées
- **Resource limits** : CPU et mémoire limitées
- **Network policies** : Isolation entre namespaces
- **SSL/TLS** : Certificats automatiques via cert-manager

## 📈 Scalabilité

- **HPA configuré** : Auto-scaling basé sur CPU/mémoire
- **StatefulSet PostgreSQL** : Stockage persistant
- **Load balancing** : Multiple replicas avec load balancer

## 🛠️ Troubleshooting

```bash
# Pods qui ne démarrent pas
kubectl describe pod <pod-name> -n exersio

# Problèmes d'images
kubectl logs deployment/exersio-backend -n exersio

# Problèmes de réseau
kubectl exec -it <pod-name> -n exersio -- nslookup exersio-postgres
```