# Deployment Guide


## Steps

1. **Clone your repository:**
   ```bash
   git clone https://github.com/HLUSN/Devops_Project.git
   cd Devops_Project
   ```

2. **Update production configuration:**
   - The `docker-compose.prod.yml` is already configured for your repositories:
     - Frontend: `hlusn/devops-frontend:latest`
     - Backend: `hlusn/devops-backend:latest`
   - Update environment variables with production values
   - Set proper MongoDB credentials

3. **Deploy the application:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Check deployment:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs
   ```

5. **Access your application:**
   - Frontend: http://your-server-ip:3000
   - Backend API: http://your-server-ip:4000

## Environment Variables to Update

### Backend
- `MONGODB_URI`: Your production MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `ADMIN_KEY`: A secure admin key for privileged operations

### Frontend
- `REACT_APP_API_URL`: URL of your backend API (e.g., http://your-server-ip:4000)

### Database
- `MONGO_INITDB_ROOT_USERNAME`: MongoDB admin username
- `MONGO_INITDB_ROOT_PASSWORD`: MongoDB admin password

## Security Notes
- Never commit sensitive credentials to version control
- Use environment variables or Docker secrets for sensitive data
- Regularly update your Docker images and dependencies
- Configure proper firewall rules for your server