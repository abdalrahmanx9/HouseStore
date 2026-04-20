#!/bin/bash

set -e

ENVIRONMENT=${1:-staging}
NAMESPACE="storeweb"

echo "Deploying to $ENVIRONMENT..."

if [ "$ENVIRONMENT" = "production" ]; then
    NAMESPACE="storeweb-prod"
fi

kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f kubernetes/ -n $NAMESPACE

echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=storeweb-backend -n $NAMESPACE --timeout=300s
kubectl wait --for=condition=ready pod -l app=storeweb-frontend -n $NAMESPACE --timeout=300s

echo "Deployment complete!"
kubectl get pods -n $NAMESPACE