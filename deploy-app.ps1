# Deploy application to EC2 instance
# Usage: .\deploy-app.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$KeyFile = "myapp-key.pem",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying application to EC2..." -ForegroundColor Green

# Get EC2 IP from Terraform
Write-Host "📍 Getting EC2 instance IP..." -ForegroundColor Yellow
Set-Location terraform
$EC2_IP = terraform output -raw instance_public_ip
Set-Location ..

if ([string]::IsNullOrEmpty($EC2_IP)) {
    Write-Host "❌ Could not get EC2 IP. Run 'terraform apply' first." -ForegroundColor Red
    exit 1
}

Write-Host "Instance IP: $EC2_IP"

# Create deployment package (exclude node_modules, .git, etc)
Write-Host ""
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
$excludeItems = @(
    "node_modules",
    ".git",
    "terraform",
    ".terraform",
    "*.tfstate*",
    "*.pem",
    "*.log"
)

# Copy files to temp directory
$tempDir = Join-Path $env:TEMP "myapp-deploy"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy necessary files
Copy-Item "backend" -Destination $tempDir -Recurse
Copy-Item "frontend" -Destination $tempDir -Recurse
Copy-Item "docker-compose.yaml" -Destination $tempDir

# Remove node_modules from copied files
if (Test-Path "$tempDir\backend\node_modules") {
    Remove-Item "$tempDir\backend\node_modules" -Recurse -Force
}
if (Test-Path "$tempDir\frontend\node_modules") {
    Remove-Item "$tempDir\frontend\node_modules" -Recurse -Force
}

# Upload to EC2
Write-Host ""
Write-Host "📤 Uploading files to EC2..." -ForegroundColor Yellow
scp -i $KeyFile -o StrictHostKeyChecking=no -r "$tempDir\*" ubuntu@${EC2_IP}:/home/ubuntu/app/

# Deploy on EC2
Write-Host ""
Write-Host "🔧 Starting services on EC2..." -ForegroundColor Yellow
ssh -i $KeyFile -o StrictHostKeyChecking=no ubuntu@$EC2_IP @"
cd /home/ubuntu/app
docker-compose down
docker-compose up -d --build
echo 'Waiting for services to start...'
sleep 10
docker-compose ps
"@

# Cleanup
Remove-Item $tempDir -Recurse -Force

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://${EC2_IP}:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://${EC2_IP}:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 View logs: ssh -i $KeyFile ubuntu@$EC2_IP 'cd /home/ubuntu/app && docker-compose logs -f'"
