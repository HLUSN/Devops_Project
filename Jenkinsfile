pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO_FRONTEND = 'hlusn/devops-frontend'
        DOCKER_HUB_REPO_BACKEND = 'hlusn/devops-backend'
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        GIT_REPO_URL = 'https://github.com/HLUSN/Devops_Project.git'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: "${GIT_REPO_URL}"
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
                    def imageTag = "${env.BUILD_NUMBER}"
                    sh "docker login -u ${DOCKER_HUB_CREDENTIALS_USR} -p ${DOCKER_HUB_CREDENTIALS_PSW}"
                    sh "docker push ${DOCKER_HUB_REPO_FRONTEND}:${imageTag}"
                    sh "docker push ${DOCKER_HUB_REPO_FRONTEND}:latest"
                }
            }
        }

        stage('Push Backend Image') {
            steps {
                script {
                    def imageTag = "${env.BUILD_NUMBER}"
                    sh "docker push ${DOCKER_HUB_REPO_BACKEND}:${imageTag}"
                    sh "docker push ${DOCKER_HUB_REPO_BACKEND}:latest"
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