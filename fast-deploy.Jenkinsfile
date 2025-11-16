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

        stage('Create Network') {
            steps {
                sh '''
                # Create network for container communication
                docker network create myapp-network || true
                echo "✅ Docker network created"
                '''
            }
        }

        stage('Start MongoDB') {
            steps {
                sh '''
                # Start MongoDB on the network
                docker run -d \
                  --name mongodb_c \
                  --network myapp-network \
                  -p 27017:27017 \
                  -v mongo-data:/data/db \
                  mongo
                echo "✅ MongoDB started on network"
                '''
            }
        }

        stage('Wait for MongoDB') {
            steps {
                sh 'sleep 10'
                sh '''
                # Test MongoDB connection
                docker exec mongodb_c mongosh --eval "db.adminCommand('ismaster')" && echo "✅ MongoDB is ready!"
                
                # Check database status
                docker exec mongodb_c mongosh mydatabase --eval "
                print('Database initialized:');
                print('Collections:', db.getCollectionNames().join(', '));
                " || echo "Database might be empty"
                '''
            }
        }

        stage('Start Backend') {
            steps {
                sh '''
                # Start Backend on the same network
                docker run -d \
                  --name backend_c \
                  --network myapp-network \
                  -p 4000:4000 \
                  -e MONGODB_URI=mongodb://mongodb_c:27017/mydatabase \
                  -e JWT_SECRET=supersecretjwtkeyfordev \
                  -e ADMIN_KEY=secret_admin_key_dev \
                  hlusn/devops-backend:latest
                echo "✅ Backend container started on network"
                '''
            }
        }

        stage('Wait for Backend') {
            steps {
                sh 'sleep 15'
                sh '''
                # Check if backend container is running
                docker ps | grep backend_c && echo "✅ Backend container is running"
                
                # Check backend logs for connection status
                echo "=== Backend Logs (last 10 lines) ==="
                docker logs backend_c --tail 10
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

        stage('Health Check') {
            steps {
                sh '''
                echo "=== Health Check ==="
                echo "Testing Backend (waiting a bit longer)..."
                sleep 5
                curl -f http://localhost:4000/health && echo "✅ Backend is healthy!" || echo "❌ Backend health check failed"
                
                echo "Testing Frontend..."
                curl -f http://localhost:3000 && echo "✅ Frontend is running!" || echo "❌ Frontend check failed"
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
                
                if (db.users.find().count() > 0) {
                    print('--- Users Sample ---');
                    db.users.find().limit(3).forEach(printjson);
                } else {
                    print('No users found in database');
                }
                
                if (db.tips.find().count() > 0) {
                    print('--- Tips Sample ---');
                    db.tips.find().limit(3).forEach(printjson);
                } else {
                    print('No tips found in database');
                }
                " || echo "❌ Database check failed"
                '''
            }
        }
    }

    post {
        always {
            echo ''
            echo '=== DEPLOYMENT COMPLETE ==='
            echo '📱 Access your application:'
            echo '   Frontend: http://localhost:3000'
            echo '   Backend:  http://localhost:4000'
            echo '💡 Check logs above for any issues.'
        }
        
        success {
            echo '✅ Pipeline completed successfully!'
        }
        
        failure {
            echo '❌ Pipeline failed. Check the logs above.'
        }
    }
}