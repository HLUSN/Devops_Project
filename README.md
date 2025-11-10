# Cyber Safe Guide for Girls

Full-stack web application for posting and managing safety tips. Admins can create, update, and delete tips; users can view tips with read-only access.

## Features

✅ **Admin Functionality**
- Insert, update, and delete safety tip entries
- JWT-based authentication with role-based access control
- Admin dashboard for managing entries
- First registered user automatically becomes admin

✅ **User Functionality**
- Read-only access to view all safety tips
- Individual safety tip detail view
- User registration and login

✅ **Authentication & Security**
- JWT-based auth system with bcrypt password hashing
- Role-based access control (admin/user)

## 🚀 CI/CD Pipeline

### GitHub Actions (Recommended)

This project includes automated Docker image building and pushing via GitHub Actions.

#### Setup GitHub Actions:

1. **Update Repository Secrets:**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `DOCKERHUB_USERNAME`: Your Docker Hub username
     - `DOCKERHUB_TOKEN`: Your Docker Hub access token (not password)

2. **Update Image Names:**
   - The workflow is already configured for:
     - Frontend: `hlusn/devops-frontend`
     - Backend: `hlusn/devops-backend`
     - GitHub Repo: `HLUSN/Devops_Project`

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add CI/CD pipeline"
   git push origin main
   ```

### Jenkins Pipeline

For Jenkins setup, use the included `Jenkinsfile`.

#### Jenkins Setup:

1. **Install Required Plugins:**
   - Docker Pipeline
   - Git

2. **Configure Credentials:**
   - Add Docker Hub credentials as `docker-hub-credentials`
   - The Jenkinsfile is already configured for your repositories:
     - GitHub: `HLUSN/Devops_Project`
     - Docker Hub: `hlusn/devops-frontend` and `hlusn/devops-backend`

3. **Create Pipeline Job:**
   - New Item → Pipeline
   - Configure to use the Jenkinsfile from your repository

### Manual Docker Updates

Use the provided script for manual updates:

```bash
# Make script executable
chmod +x update-docker-images.sh

# Update with latest tag
./update-docker-images.sh

# Update with custom tag
./update-docker-images.sh v1.2.3
```

**Note:** The script is already configured for your Docker Hub repositories (`hlusn/devops-frontend` and `hlusn/devops-backend`).
- Input validation using express-validator
- Secure token storage in localStorage

## Tech Stack

- **Frontend**: React with modern hooks, React Router
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **Containerization**: Docker + docker-compose

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (username min 3 chars, password min 6 chars)
- `POST /api/auth/login` - User login (returns JWT token)

### Tips (Safety Entries)
- `GET /api/tips` - Get all tips (public)
- `GET /api/tips/:id` - Get single tip (public)
- `POST /api/tips` - Create new tip (admin only, requires JWT)
- `PUT /api/tips/:id` - Update tip (admin only, requires JWT)
- `DELETE /api/tips/:id` - Delete tip (admin only, requires JWT)

## Quick Start with Docker Compose

```powershell
cd "D:\SEM 5\DevOps\docker compose work       2\myApp"
docker-compose up --build
```

This will start three containers:
- `mongodb` on port 27017
- `backend` on port 4000
- `frontend` on port 3000

Access the app at http://localhost:3000

## Local Development (without Docker)

### Backend
```powershell
cd backend
npm install
npm start
```
Backend runs on http://localhost:4000

### Frontend (dev server)
```powershell
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

### Frontend (production build)
```powershell
cd frontend
npm install
npm run build
# serve the built folder
npx serve -s build
```

## Environment Variables

Create a `.env` file in the backend directory (optional):

```env
MONGODB_URI=mongodb://localhost:27017/mydatabase
JWT_SECRET=your_secret_key_here
ADMIN_KEY=secret_admin_key
PORT=4000
```

## Using the Application

### 1. Register First User (Becomes Admin)
```powershell
# Register
Invoke-RestMethod -Uri http://localhost:4000/api/auth/register -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{username='admin'; password='Password123'})
```

### 2. Login and Get JWT Token
```powershell
$login = Invoke-RestMethod -Uri http://localhost:4000/api/auth/login -Method Post -ContentType 'application/json' -Body (ConvertTo-Json @{username='admin'; password='Password123'})
$token = $login.token
```

### 3. Create a Tip (Admin Only)
```powershell
Invoke-RestMethod -Uri http://localhost:4000/api/tips -Method Post -ContentType 'application/json' -Headers @{Authorization="Bearer $token"} -Body (ConvertTo-Json @{title='Stay Safe Online'; content='Always use strong passwords and enable 2FA.'})
```

### 4. Get All Tips (Public)
```powershell
Invoke-RestMethod -Uri http://localhost:4000/api/tips
```

## UI Components

- **Home Page** (`/`) - Welcome screen with navigation links
- **Login Page** (`/login`) - User login with JWT auth
- **Register Page** (`/signup`) - New user registration
- **Tips List** (`/tips`) - Public view of all safety tips
- **Tip Detail** (`/tips/:id`) - Individual tip detail view
- **Admin Panel** (`/admin`) - Admin dashboard for managing tips (requires JWT)
- **CRUD Page** (`/crud`) - Alternative admin interface

## Project Structure

```
myApp/
├── backend/
│   ├── index.js          # Express server with JWT auth & CRUD endpoints
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main app with routing
│   │   ├── Login.js      # Login component
│   │   ├── Signup.js     # Registration component
│   │   ├── Tips.js       # Tips list (public)
│   │   ├── TipDetail.js  # Individual tip view
│   │   ├── AdminPanel.js # Admin dashboard
│   │   └── CRUDPage.js   # CRUD management interface
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yaml
```

## Notes

- **Fallback Mode**: Backend uses in-memory cache if MongoDB is unavailable (fast-fail with 5s timeout)
- **First User**: The first registered user automatically gets admin role
- **Admin Access**: Use JWT token in Authorization header as `Bearer <token>` or legacy `x-admin-key` header
- **Input Validation**: Title min 3 chars, content min 10 chars, username min 3 chars, password min 6 chars

## Production Deployment

For production:
1. Set strong `JWT_SECRET` and `ADMIN_KEY` environment variables
2. Use HTTPS/TLS for all connections
3. Enable MongoDB authentication
4. Consider using a reverse proxy (nginx) for the frontend
5. Implement rate limiting on auth endpoints
6. Add refresh token mechanism for JWT

## Troubleshooting

**Backend won't start**: Check if MongoDB is running and port 4000 is available  
**Frontend build fails**: Ensure all dependencies are installed with `npm install`  
**401/403 errors**: Check JWT token is valid and user has admin role  
**CORS issues**: Backend has CORS enabled; if issues persist check your network/firewall

# Trigger GitHub Actions - Mon Nov 10 19:35:22 +0530 2025
# Trigger GitHub Actions - Mon Nov 10 19:40:11 +0530 2025
