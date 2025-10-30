pipeline {
    agent any

    environment {
        IMAGE_NAME = 'tinyblog-app'
        REGISTRY_URL = 'harbour.delin.tech/tinyblog'
        REGISTRY_CREDENTIALS = 'docker-registry-credentials'
    }

    stages {
        stage('test and coverage') {
            agent {
                docker {
                    image 'python:3.11-slim'
                    args '-u root'
                }
            }
            steps {
                sh '''
                    apt-get update && apt-get install -y build-essential libpq-dev
                    pip install --upgrade pip
                    pip install -r dev-requirements.txt
                    pip install coverage
                    mkdir -p coverage_reports
                    coverage run manage.py test
                    coverage report -m
                    coverage xml -o coverage_reports/coverage.xml
                '''
            }
        }
        stage('SonarQube Analysis') {
            agent { label 'docker' }
            steps {
                script {
                    def scannerHome = tool 'SonarScanner';
                    withSonarQubeEnv() {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }
        stage('Build & Push Image') {
            agent { label 'docker' }
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                script {
                    def imageTag = "${env.REGISTRY_URL}/${env.IMAGE_NAME}:${env.BUILD_NUMBER}"
                    docker.withRegistry("https://${env.REGISTRY_URL}", env.REGISTRY_CREDENTIALS) {
                        def appImage = docker.build(imageTag)
                        appImage.push()
                        appImage.push('latest')
                    }
                    sh "docker image rm ${imageTag} || true"
                    sh "docker image rm ${env.REGISTRY_URL}/${env.IMAGE_NAME}:latest || true"
                }
            }
        }
        stage('Deploy to Production') {
            agent { label 'tinyblog-production' }
            when {
                branch 'main'
            }
            environment {
                ENV_FILE = credentials('tinyblog-env') // Jenkins credentials ID
            }
            steps {
                sh """
                    echo "$ENV_FILE" > .env
                    docker compose pull
                    docker compose up -d --remove-orphans
                    docker compose run --rm web python manage.py migrate --noinput
                    docker compose run --rm web python manage.py collectstatic --noinput
                """
                
            }
        }
    }
    post {
        always {
            node('docker') { 
                cleanWs()
            }
        }
    }
}
