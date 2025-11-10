#!/bin/bash

# Docker Image Update Script
# Usage: ./update-docker-images.sh [tag]

set -e

# Configuration - Update these with your actual values
DOCKER_HUB_USERNAME="hlusn"
FRONTEND_IMAGE="${DOCKER_HUB_USERNAME}/devops-frontend"
BACKEND_IMAGE="${DOCKER_HUB_USERNAME}/devops-backend"

# Default tag is 'latest', but you can pass a custom tag
TAG=${1:-latest}

echo "🚀 Updating Docker images with tag: ${TAG}"

# Build and push frontend
echo "📦 Building frontend image..."
cd frontend
docker build -t ${FRONTEND_IMAGE}:${TAG} .
echo "⬆️  Pushing frontend image..."
docker push ${FRONTEND_IMAGE}:${TAG}

# Build and push backend
echo "📦 Building backend image..."
cd ../backend
docker build -t ${BACKEND_IMAGE}:${TAG} .
echo "⬆️  Pushing backend image..."
docker push ${BACKEND_IMAGE}:${TAG}

cd ..
echo "✅ All images updated successfully!"
echo "Frontend: ${FRONTEND_IMAGE}:${TAG}"
echo "Backend: ${BACKEND_IMAGE}:${TAG}"