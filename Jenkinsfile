pipeline {
    agent any

    triggers {
        // Poll GitHub every minute for changes (fallback if webhook fails)
        pollSCM('* * * * *')
        // GitHub webhook trigger - requires webhook configuration in GitHub repo
        githubPush()
    }

    environment {
        DOCKER_HUB_REPO_FRONTEND = 'hlusn/devops-frontend'
        DOCKER_HUB_REPO_BACKEND = 'hlusn/devops-backend'
        DOCKER_HUB_CREDENTIALS_ID = 'docker-hub-credentials'
        GIT_REPO_URL = 'https://github.com/HLUSN/Devops_Project.git'
    }

    stages {
        // ADD THIS STAGE - Git Checkout
        stage('Checkout Code') {
            steps {
                git branch: 'Automation', 
                url: 'https://github.com/HLUSN/Devops_Project.git'
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    script {
                        def imageTag = "${env.BUILD_NUMBER}"
                        sh "docker build -t ${DOCKER_HUB_REPO_FRONTEND}:${imageTag} ."
                        sh "docker build -t ${DOCKER_HUB_REPO_FRONTEND}:latest ."
                    }
                }
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    script {
                        def imageTag = "${env.BUILD_NUMBER}"
                        sh "docker build -t ${DOCKER_HUB_REPO_BACKEND}:${imageTag} ."
                        sh "docker build -t ${DOCKER_HUB_REPO_BACKEND}:latest ."
                    }
                }
            }
        }

        stage('Push Frontend Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_HUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def imageTag = "${env.BUILD_NUMBER}"
                        sh "docker login -u ${DOCKER_HUB_USERNAME} -p ${DOCKER_HUB_PASSWORD}"
                        sh "docker push ${DOCKER_HUB_REPO_FRONTEND}:${imageTag}"
                        sh "docker push ${DOCKER_HUB_REPO_FRONTEND}:latest"
                    }
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_HUB_CREDENTIALS_ID, usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
                        def imageTag = "${env.BUILD_NUMBER}"
                        sh "docker push ${DOCKER_HUB_REPO_BACKEND}:${imageTag}"
                        sh "docker push ${DOCKER_HUB_REPO_BACKEND}:latest"
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'EC2_SSH_KEY')]) {
                        def ec2User = 'ubuntu'
                        def ec2Host = '52.66.214.98'
                        
                        echo "Deploying to EC2: ${ec2Host}"
                        
                        def remoteCmds = """
                            cd /home/${ec2User}/app || exit 1
                            
                            # Force stop and remove all containers
                            docker-compose -f docker-compose.prod.yml down -v || true
                            docker rm -f mongodb_c backend_c frontend_c || true
                            
                            # Pull latest images
                            docker-compose -f docker-compose.prod.yml pull
                            
                            # Start fresh containers
                            docker-compose -f docker-compose.prod.yml up -d
                            
                            # Show running containers
                            docker ps
                            
                            echo '✅ EC2 deployment completed!'
                        """
                        
                        sh "ssh -o StrictHostKeyChecking=no -i \$EC2_SSH_KEY ${ec2User}@${ec2Host} '${remoteCmds}'"
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    def imageTag = "${env.BUILD_NUMBER}"
                    sh "docker rmi ${DOCKER_HUB_REPO_FRONTEND}:${imageTag} ${DOCKER_HUB_REPO_BACKEND}:${imageTag}"
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded! Images pushed to Docker Hub.'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}