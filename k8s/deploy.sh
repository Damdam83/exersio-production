#!/bin/bash

# Exersio Kubernetes Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

REGISTRY=${REGISTRY:-"your-registry.com/exersio"}
TAG=${TAG:-"latest"}
NAMESPACE="exersio"

echo -e "${YELLOW}🚀 Starting Exersio deployment...${NC}"

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl not found. Please install kubectl.${NC}"
        exit 1
    fi
}

# Function to build and push Docker images
build_and_push() {
    echo -e "${YELLOW}🐳 Building Docker images...${NC}"
    
    # Build backend
    echo "Building backend image..."
    docker build -t ${REGISTRY}/backend:${TAG} ./exersio-back/
    docker push ${REGISTRY}/backend:${TAG}
    
    # Build frontend
    echo "Building frontend image..."
    docker build -t ${REGISTRY}/frontend:${TAG} ./exersio-front/
    docker push ${REGISTRY}/frontend:${TAG}
    
    echo -e "${GREEN}✅ Images built and pushed${NC}"
}

# Function to deploy to Kubernetes
deploy_k8s() {
    echo -e "${YELLOW}☸️  Deploying to Kubernetes...${NC}"
    
    # Apply manifests
    kubectl apply -k ./k8s/
    
    # Wait for deployments to be ready
    echo "Waiting for deployments..."
    kubectl wait --for=condition=available --timeout=300s deployment/exersio-backend -n ${NAMESPACE}
    kubectl wait --for=condition=available --timeout=300s deployment/exersio-frontend -n ${NAMESPACE}
    
    echo -e "${GREEN}✅ Deployment completed${NC}"
}

# Function to show status
show_status() {
    echo -e "${YELLOW}📊 Deployment status:${NC}"
    kubectl get pods,services,ingress -n ${NAMESPACE}
    
    echo -e "\n${YELLOW}🔗 Access URLs:${NC}"
    kubectl get ingress exersio-ingress -n ${NAMESPACE} -o jsonpath='{.spec.rules[0].host}' && echo
}

# Main execution
case "${1}" in
    "build")
        check_kubectl
        build_and_push
        ;;
    "deploy")
        check_kubectl
        deploy_k8s
        ;;
    "status")
        check_kubectl
        show_status
        ;;
    "all")
        check_kubectl
        build_and_push
        deploy_k8s
        show_status
        ;;
    *)
        echo "Usage: $0 {build|deploy|status|all}"
        echo "  build  - Build and push Docker images"
        echo "  deploy - Deploy to Kubernetes"
        echo "  status - Show deployment status"
        echo "  all    - Build, deploy and show status"
        exit 1
        ;;
esac