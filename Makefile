# Exersio Kubernetes Deployment Makefile

# Configuration
REGISTRY ?= your-registry.com/exersio
TAG ?= latest
NAMESPACE = exersio

.PHONY: help build push deploy status clean

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker images locally
	@echo "🐳 Building Docker images..."
	docker build -t $(REGISTRY)/backend:$(TAG) ./exersio-back/
	docker build -t $(REGISTRY)/frontend:$(TAG) ./exersio-front/
	@echo "✅ Images built successfully"

push: ## Push Docker images to registry
	@echo "📤 Pushing images to registry..."
	docker push $(REGISTRY)/backend:$(TAG)
	docker push $(REGISTRY)/frontend:$(TAG)
	@echo "✅ Images pushed successfully"

deploy: ## Deploy to Kubernetes
	@echo "☸️  Deploying to Kubernetes..."
	kubectl apply -k ./k8s/
	kubectl wait --for=condition=available --timeout=300s deployment/exersio-backend -n $(NAMESPACE)
	kubectl wait --for=condition=available --timeout=300s deployment/exersio-frontend -n $(NAMESPACE)
	@echo "✅ Deployment completed"

status: ## Show deployment status
	@echo "📊 Deployment status:"
	kubectl get pods,services,ingress -n $(NAMESPACE)

logs-backend: ## Show backend logs
	kubectl logs -f deployment/exersio-backend -n $(NAMESPACE)

logs-frontend: ## Show frontend logs
	kubectl logs -f deployment/exersio-frontend -n $(NAMESPACE)

clean: ## Delete all resources
	kubectl delete -k ./k8s/

restart: ## Restart all deployments
	kubectl rollout restart deployment/exersio-backend -n $(NAMESPACE)
	kubectl rollout restart deployment/exersio-frontend -n $(NAMESPACE)

all: build push deploy status ## Build, push, deploy and show status

# Development helpers
dev-build: ## Build images with dev tag
	$(MAKE) build TAG=dev

dev-deploy: ## Deploy with dev images
	$(MAKE) deploy TAG=dev