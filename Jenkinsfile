pipeline {
    agent {
        docker {
            image 'python:3.11-slim'   // ✅ Use an existing Python image
            args '-u root'             // run as root to install packages
        }
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh '''
                    apt-get update && apt-get install -y build-essential libpq-dev
                    pip install --upgrade pip
                    pip install -r dev-requirements.txt
                    pip install coverage
                '''
            }
        }

        stage('Run Django Tests with Coverage') {
            steps {
                sh '''
                    mkdir -p coverage_reports
                    coverage run manage.py test
                    coverage report -m
                    coverage xml -o coverage_reports/coverage.xml
                    coverage html -d coverage_reports/html
                '''
            }
        }
        stage('SonarQube Analysis') {
            def scannerHome = tool 'SonarScanner';
            withSonarQubeEnv() {
                sh "${scannerHome}/bin/sonar-scanner"
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
