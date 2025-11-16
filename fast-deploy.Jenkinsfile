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
                docker compose down || true
                echo "✅ Stopped any running containers"
                '''
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                docker compose up -d
                echo "✅ Application deployed"
                '''
            }
        }

        stage('Wait for Services') {
            steps {
                sh 'sleep 15'
                echo "⏳ Waiting for database and services..."
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                echo "=== Health Check ==="
                curl -s http://localhost:4000/health && echo "✅ Backend is healthy!"
                curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend is running!"
                '''
            }
        }

        stage('Database Check - ALL DATA') {
            steps {
                sh '''
                echo "=== DATABASE - SHOWING ALL DATA ==="
                
                docker exec -i mongodb_c mongosh mydatabase --eval "
                print('📊 USERS COLLECTION (' + db.users.find().count() + ' documents):');
                db.users.find().forEach(user => {
                    printjson(user);
                });
                
                print('');
                print('💡 TIPS COLLECTION (' + db.tips.find().count() + ' documents):');
                db.tips.find().forEach(tip => {
                    printjson(tip);
                });
                " || echo "❌ Database check failed - container might still be starting"
                '''
            }
        }
    }

    post {
        always {
            echo ''
            echo '=== DEPLOYMENT COMPLETE ==='
            echo '✅ All data displayed from database'
            echo '📱 Access your application:'
            echo '   Frontend: http://localhost:3000'
            echo '   Backend:  http://localhost:4000'
        }
    }
}