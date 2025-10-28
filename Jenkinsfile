pipeline {
    agent none

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
    }
    post {
        always {
            agent { label 'docker' }
            steps {
                cleanWs()
            }
        }
    }
}
