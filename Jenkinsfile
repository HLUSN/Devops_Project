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

        stage('Deploy Locally') {
            steps {
                script {
                    echo 'Deploying application locally using docker-compose...'
                    // Stop and remove existing containers
                    sh 'docker-compose -f docker-compose.prod.yml down || true'
                    // Pull latest images from Docker Hub
                    sh 'docker-compose -f docker-compose.prod.yml pull'
                    // Start containers in detached mode
                    sh 'docker-compose -f docker-compose.prod.yml up -d'
                    echo 'Local deployment completed successfully!'
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