#!/bin/bash

set -e

echo "🧹 Cleaning up Aura Focus deployment..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if namespace exists
if ! kubectl get namespace aura-focus &> /dev/null; then
    echo "ℹ️  Namespace 'aura-focus' does not exist, nothing to clean up"
    exit 0
fi

echo "⚠️  This will delete all Aura Focus resources including data!"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

# Delete resources in order
echo "🗑️  Deleting ingress..."
kubectl delete -f ingress.yaml --ignore-not-found=true

echo "🗑️  Deleting services..."
kubectl delete -f service.yaml --ignore-not-found=true

echo "🗑️  Deleting deployment..."
kubectl delete -f deployment.yaml --ignore-not-found=true

echo "🗑️  Deleting HPA..."
kubectl delete -f hpa.yaml --ignore-not-found=true

echo "🗑️  Deleting network policies..."
kubectl delete -f network-policy.yaml --ignore-not-found=true

echo "🗑️  Deleting monitoring..."
kubectl delete -f service-monitor.yaml --ignore-not-found=true

echo "🗑️  Deleting storage..."
kubectl delete -f persistent-volume.yaml --ignore-not-found=true

echo "🗑️  Deleting configuration..."
kubectl delete -f configmap.yaml --ignore-not-found=true
kubectl delete -f secret.yaml --ignore-not-found=true

echo "🗑️  Deleting namespace..."
kubectl delete -f namespace.yaml --ignore-not-found=true

echo "✅ Cleanup completed!"
echo "ℹ️  Note: PersistentVolume data may still exist on the host system"
