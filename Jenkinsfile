@Library('mdblp-library') _

pipeline {
    agent {
        label 'blip'
    }
    environment {
        node_version='12'
    }
    stages {
        stage('Test') {
            agent {
                dockerfile {
                    filename 'dockerfile.build'
                    reuseNode true
                }
            }
            steps {
                withCredentials([string(credentialsId: 'nexus-token', variable: 'NEXUS_TOKEN')]) {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm run test'
                    sh 'npm run security-checks'
                }
            }
        }
        stage('Build') {
            agent {
                dockerfile {
                    filename 'dockerfile.build'
                    reuseNode true
                }
            }
            steps {
                withCredentials([string(credentialsId: 'nexus-token', variable: 'NEXUS_TOKEN')]) {
                    sh 'bash build.sh'
                }
            }
        }
        stage('Package') {
            steps {
                pack()
            }
        }
        stage('Publish') {
            when { branch "dblp" }
            steps {
                withCredentials([usernamePassword(credentialsId: 'nexus-jenkins', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PWD')]) {
                        sh """echo "${NEXUS_PWD}" | docker login -u ${NEXUS_USER} --password-stdin docker.ci.diabeloop.eu"""
                        sh "docker pull docker.ci.diabeloop.eu/ci-toolbox:latest"
                }
                script {
                    docker.image('docker.ci.diabeloop.eu/ci-toolbox').inside() {
                        env.version = sh (
                            script: 'release-helper get-version',
                            returnStdout: true
                        ).trim().toUpperCase()
                    }
                    if (env.version == "UNRELEASED") {
                        env.version = "master"
                    }
                }
                withCredentials([string(credentialsId: 'DEV_AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY_ID'), 
                    string(credentialsId: 'DEV_AWS_SECRET_KEY', variable: 'AWS_SECRET_ACCESS_KEY'),
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT')]) {
                    sh 'docker run --rm -e STACK_VERSION=${version}:${GIT_COMMIT} -e APP_VERSION=${version}:${GIT_COMMIT} -e AWS_ACCOUNT -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY --env-file ./cloudfront-dist/deployment/preview.env blip:${GIT_COMMIT}'
                }
                publish()
            }
        }
    }

}
