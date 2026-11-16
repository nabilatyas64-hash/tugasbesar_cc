pipeline {
    agent any

    environment {
        IMAGE = 'nightrunnerr/pendekin'
        TAG   = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Kode terbaru dari branch main sudah diambil'
            }
        }
        stage('Test') {
            steps {
                echo 'TODO: jalankan npm test lewat Dockerfile stage test (menunggu Dockerfile)'
            }
        }
        stage('Build Image') {
            steps {
                echo "TODO: build image ${IMAGE}:${TAG} dan ${IMAGE}:latest"
            }
        }
        stage('Push Image') {
            steps {
                echo 'TODO: login Docker Hub lewat Jenkins Credentials lalu push 2 tag'
            }
        }
        stage('Deploy') {
            steps {
                echo 'TODO: docker compose pull + up -d, lalu migrate & seed (menunggu compose.yaml)'
            }
        }
        stage('Smoke Test') {
            steps {
                echo 'TODO: cek /health harus 200 dan /demo01 harus 302'
            }
        }
    }

    post {
        success { echo "PIPELINE SUKSES - build #${env.BUILD_NUMBER}, image ${IMAGE}:${TAG}" }
        failure { echo "PIPELINE GAGAL - build #${env.BUILD_NUMBER}, cek stage yang merah di Stage View" }
    }
}