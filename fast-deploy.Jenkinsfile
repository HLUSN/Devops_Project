pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/HLUSN/Devops_Project.git'
            }
        }

        stage('Fix Docker Permissions') {
            steps {
                sh 'sudo chmod 666 /var/run/docker.sock || true'
            }
        }

        stage('Start Docker Service') {
            steps {
                sh 'sudo service docker start || true'
                sh 'sleep 3'
            }
        }

        stage('Pull Latest Images from Docker Hub') {
            steps {
                sh '''
                echo "📥 Pulling latest images..."
                docker pull hlusn/devops-frontend:latest
                docker pull hlusn/devops-backend:latest
                echo "✅ Images downloaded"
                '''
            }
        }

        stage('Stop Existing Containers') {
            steps {
                sh '''
                # Stop containers individually
                docker stop frontend_c backend_c mongodb_c || true
                docker rm frontend_c backend_c mongodb_c || true
                echo "✅ Stopped any running containers"
                '''
            }
        }

        stage('Start MongoDB') {
            steps {
                sh '''
                # Start MongoDB
                docker run -d \
                  --name mongodb_c \
                  -p 27017:27017 \
                  -v mongo-data:/data/db \
                  mongo
                echo "✅ MongoDB started"
                '''
            }
        }

        stage('Wait for MongoDB') {
            steps {
                sh 'sleep 10'
                sh '''
                # Test MongoDB connection
                docker exec mongodb_c mongosh --eval "db.adminCommand('ismaster')" && echo "✅ MongoDB is ready!"
                '''
            }
        }

        stage('Start Backend') {
            steps {
                sh '''
                # Start Backend
                docker run -d \
                  --name backend_c \
                  -p 4000:4000 \
                  -e MONGODB_URI=mongodb://mongodb_c:27017/mydatabase \
                  -e JWT_SECRET=supersecretjwtkeyfordev \
                  -e ADMIN_KEY=secret_admin_key_dev \
                  hlusn/devops-backend:latest
                echo "✅ Backend container started"
                '''
            }
        }

        stage('Wait for Backend') {
            steps {
                sh 'sleep 10'
                sh '''
                # Check if backend container is running
                docker ps | grep backend_c && echo "✅ Backend container is running"
                
                # Check backend logs
                echo "=== Backend Logs (last 5 lines) ==="
                docker logs backend_c --tail 5
                '''
            }
        }

        stage('Start Frontend') {
            steps {
                sh '''
                # Start Frontend
                docker run -d \
                  --name frontend_c \
                  -p 3000:3000 \
                  hlusn/devops-frontend:latest
                echo "✅ Frontend container started"
                '''
            }
        }

        stage('Wait for Frontend') {
            steps {
                sh 'sleep 10'
                sh '''
                # Check if frontend container is running
                docker ps | grep frontend_c && echo "✅ Frontend container is running"
                
                # Check frontend logs
                echo "=== Frontend Logs (last 5 lines) ==="
                docker logs frontend_c --tail 5
                '''
            }
        }

        stage('Debug Network') {
            steps {
                sh '''
                echo "=== Network Debugging ==="
                echo "Containers running:"
                docker ps -a
                
                echo "Ports listening:"
                netstat -tulpn | grep -E '(3000|4000|27017)' || echo "No ports found"
                
                echo "Trying to connect to services:"
                curl -v http://localhost:4000/health || echo "Backend not accessible"
                curl -v http://localhost:3000 || echo "Frontend not accessible"
                '''
            }
        }

        stage('Database Check') {
            steps {
                sh '''
                echo "=== DATABASE CHECK ==="
                docker exec -i mongodb_c mongosh mydatabase --eval "
                print('📊 Database Status:');
                print('Collections: ' + db.getCollectionNames().join(', '));
                print('Users count: ' + db.users.find().count());
                print('Tips count: ' + db.tips.find().count());
                " || echo "❌ Database check failed"
                '''
            }
        }
    }

    post {
        always {
            echo ''
            echo '=== DEPLOYMENT COMPLETE ==='
            echo '📱 Try accessing manually:'
            echo '   Frontend: http://localhost:3000'
            echo '   Backend:  http://localhost:4000'
            echo '💡 If services are not accessible, check the logs above.'
        }
    }
}