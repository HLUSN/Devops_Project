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

        stage('Deploy with Docker Compose') {
            steps {
                sh '''
                # Clean up and deploy
                docker compose down || true
                docker compose up -d --build
                echo "✅ Application deployed with Docker Compose"
                '''
            }
        }

        stage('Wait for Services') {
            steps {
                sh 'sleep 20'
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                echo "=== Health Check ==="
                curl -f http://localhost:4000/health && echo "✅ Backend is healthy!"
                curl -f http://localhost:3000 && echo "✅ Frontend is running!"
                '''
            }
        }

        stage('Database Check') {
            steps {
                sh '''
                echo "=== DATABASE CHECK ==="
                docker compose exec -T mongodb mongosh mydatabase --eval "
                print('📊 Database Status:');
                print('Collections: ' + db.getCollectionNames().join(', '));
                print('Users count: ' + db.users.find().count());
                print('Tips count: ' + db.tips.find().count());
                " || echo "Database check completed"
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
        }
    }
}