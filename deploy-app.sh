#!/bin/bash
# Deploy application to EC2 instance
# Usage: ./deploy-app.sh [key-file]

set -e

KEY_FILE=${1:-myapp-key}

echo "🚀 Deploying application to EC2..."

# Get EC2 IP from Terraform
echo "📍 Getting EC2 instance IP..."
cd terraform
EC2_IP=$(terraform output -raw instance_public_ip)
cd ..

if [ -z "$EC2_IP" ]; then
    echo "❌ Could not get EC2 IP. Run 'terraform apply' first."
    exit 1
fi

echo "Instance IP: $EC2_IP"

# Create deployment package
echo ""
echo "📦 Creating deployment package..."
TEMP_DIR=$(mktemp -d)
mkdir -p $TEMP_DIR

# Copy necessary files
cp -r backend $TEMP_DIR/
cp -r frontend $TEMP_DIR/
cp docker-compose.yaml $TEMP_DIR/

# Remove node_modules
rm -rf $TEMP_DIR/backend/node_modules
rm -rf $TEMP_DIR/frontend/node_modules

# Upload to EC2
echo ""
echo "📤 Uploading files to EC2..."
scp -i $KEY_FILE -o StrictHostKeyChecking=no -r $TEMP_DIR/* ubuntu@$EC2_IP:/home/ubuntu/app/

# Deploy on EC2
echo ""
echo "🔧 Starting services on EC2..."
ssh -i $KEY_FILE -o StrictHostKeyChecking=no ubuntu@$EC2_IP << 'ENDSSH'
cd /home/ubuntu/app
docker-compose down
docker-compose up -d --build
echo "Waiting for services to start..."
sleep 10
docker-compose ps
ENDSSH

# Cleanup
rm -rf $TEMP_DIR

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Frontend: http://$EC2_IP:3000"
echo "🔌 Backend:  http://$EC2_IP:4000"
echo ""
echo "📝 View logs: ssh -i $KEY_FILE ubuntu@$EC2_IP 'cd /home/ubuntu/app && docker-compose logs -f'"
