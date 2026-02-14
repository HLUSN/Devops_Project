# Free AWS Deployment Guide 🆓

Deploy your app to AWS **completely FREE** using t2.micro EC2 (Free Tier eligible).

## 💰 Cost: $0/month
- **t2.micro EC2**: Free for first 12 months (750 hours/month)
- **30GB Storage**: Within free tier
- **15GB Data Transfer**: Free tier includes outbound data

After 12 months: ~$8-10/month

## Prerequisites

1. **AWS Account** (free tier eligible)
2. **AWS CLI** installed and configured
3. **Terraform** installed
4. **SSH client** (built into Windows/Linux/Mac)

## Quick Start (5 Steps)

### 1. Generate SSH Key

```powershell
ssh-keygen -t rsa -b 4096 -f myapp-key
```

This creates `myapp-key` (private) and `myapp-key.pub` (public).

### 2. Configure Terraform

```powershell
cd terraform
Copy-Item terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars
```

Edit `terraform.tfvars` and paste your **public key**:
```hcl
aws_region   = "us-east-1"
project_name = "myapp"
ssh_public_key = "ssh-rsa AAAAB3Nz... (paste contents of myapp-key.pub)"
```

### 3. Deploy Infrastructure

```powershell
terraform init
terraform apply
```

Type `yes` when prompted. Takes ~3 minutes.

### 4. Deploy Your Application

```powershell
cd ..
.\deploy-app.ps1
```

Or on Linux/Mac:
```bash
chmod +x deploy-app.sh
./deploy-app.sh
```

### 5. Access Your App

Get the URLs:
```powershell
cd terraform
terraform output
```

Open in browser:
- Frontend: `http://YOUR_IP:3000`
- Backend: `http://YOUR_IP:4000`

## What Gets Created

```
┌─────────────────────────────────┐
│   AWS Free Tier (t2.micro EC2)  │
│                                  │
│  ┌──────────────────────────┐  │
│  │  Docker Containers       │  │
│  │  ├── Frontend (port 3000)│  │
│  │  ├── Backend (port 4000) │  │
│  │  └── MongoDB (port 27017)│  │
│  └──────────────────────────┘  │
│                                  │
│  Public IP: XX.XX.XX.XX         │
└─────────────────────────────────┘
```

## Useful Commands

### View Logs
```powershell
ssh -i myapp-key.pem ubuntu@YOUR_IP
cd /home/ubuntu/app
docker-compose logs -f
```

### Restart Services
```powershell
ssh -i myapp-key.pem ubuntu@YOUR_IP
cd /home/ubuntu/app
docker-compose restart
```

### Stop Services (to save resources)
```powershell
ssh -i myapp-key.pem ubuntu@YOUR_IP
cd /home/ubuntu/app
docker-compose down
```

### Check Service Status
```powershell
ssh -i myapp-key.pem ubuntu@YOUR_IP
cd /home/ubuntu/app
docker-compose ps
```

### Update Application
After making code changes:
```powershell
.\deploy-app.ps1
```

## Troubleshooting

### Can't SSH to instance
- Wait 2-3 minutes after `terraform apply`
- Check security group allows your IP on port 22
- Verify key file permissions: `icacls myapp-key.pem /inheritance:r /grant:r "$($env:USERNAME):R"`

### Services not starting
```powershell
ssh -i myapp-key.pem ubuntu@YOUR_IP
cd /home/ubuntu/app
docker-compose logs
```

### Out of disk space
```powershell
ssh -i myapp-key.pem ubuntu@YOUR_IP
docker system prune -a
```

### Can't access from browser
- Wait 1-2 minutes for containers to start
- Check if ports 3000 and 4000 are open in security group
- Verify services are running: `docker-compose ps`

## Security Notes

⚠️ **Important for Production:**
- This setup is for **development/testing only**
- Frontend and backend are publicly accessible
- Consider adding authentication
- Use HTTPS in production
- Restrict SSH access to your IP only

## Cleanup (Destroy Everything)

When done:

```powershell
cd terraform
terraform destroy
```

Type `yes` to confirm. This removes all AWS resources and stops charges.

## Tips to Stay Free

1. **Monitor Free Tier Usage**: Check AWS Billing Dashboard
2. **Stop instance when not using**: Terraform destroy when done
3. **Set up billing alerts**: AWS Console → Billing → Billing Preferences
4. **One instance only**: Don't create multiple instances
5. **Clean up old volumes**: AWS Console → EC2 → Volumes

## Need More Resources?

If t2.micro is too small:
- Edit `terraform/main.tf`
- Change `instance_type = "t2.micro"` to `t2.small` (~$0.023/hour)
- Run `terraform apply`

## Support

Common issues:
- **SSH timeout**: Check security group rules
- **Docker errors**: SSH to instance and check `docker-compose logs`
- **Terraform errors**: Run `terraform plan` to see what changed
- **Billing concerns**: Check AWS Free Tier usage dashboard

---

**Total Time**: ~10 minutes
**Cost**: $0 (first 12 months)
**Complexity**: Simple ✅
