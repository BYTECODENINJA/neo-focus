#!/bin/bash

set -e

echo "🚀 Deploying Aura Focus to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    exit 1
fi

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

# Apply ConfigMap and Secrets
echo "⚙️  Applying configuration..."
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml

# Apply PersistentVolume
echo "💾 Setting up storage..."
kubectl apply -f persistent-volume.yaml

# Deploy the application
echo "🏗️  Deploying application..."
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Setup ingress
echo "🌐 Setting up ingress..."
kubectl apply -f ingress.yaml

# Setup autoscaling
echo "📈 Setting up autoscaling..."
kubectl apply -f hpa.yaml

# Apply network policies
echo "🔒 Applying security policies..."
kubectl apply -f network-policy.yaml

# Setup monitoring (if Prometheus is available)
if kubectl get crd servicemonitors.monitoring.coreos.com &> /dev/null; then
    echo "📊 Setting up monitoring..."
    kubectl apply -f service-monitor.yaml
else
    echo "⚠️  Prometheus CRDs not found, skipping ServiceMonitor"
fi

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/aura-focus -n aura-focus

# Get deployment status
echo "✅ Deployment completed!"
echo ""
echo "📋 Deployment Status:"
kubectl get pods -n aura-focus
echo ""
echo "🔗 Service Information:"
kubectl get svc -n aura-focus
echo ""
echo "🌐 Ingress Information:"
kubectl get ingress -n aura-focus

# Get application URL
INGRESS_HOST=$(kubectl get ingress aura-focus-ingress -n aura-focus -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "Not configured")
if [ "$INGRESS_HOST" != "Not configured" ]; then
    echo ""
    echo "🎉 Application is available at: https://$INGRESS_HOST"
fi

echo ""
echo "📝 Useful commands:"
echo "  View logs: kubectl logs -f deployment/aura-focus -n aura-focus"
echo "  Scale app: kubectl scale deployment aura-focus --replicas=3 -n aura-focus"
echo "  Port forward: kubectl port-forward svc/aura-focus-service 8080:80 -n aura-focus"
echo "  Delete app: ./cleanup.sh"
