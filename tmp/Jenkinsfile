@Library('mdblp-library') _

pipeline {
    agent {
        label 'blip'
    }
    environment {
        node_version='12'
    }
    stages {
        stage('Initialization') {
            steps {
                script {
                    utils.initPipeline()
                    docker.image('docker.ci.diabeloop.eu/ci-toolbox').inside() {
                        env.version = sh (
                            script: 'release-helper get-version',
                            returnStdout: true
                        ).trim().toUpperCase()
                    }
                }
            }
        }
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
                withCredentials([
                  string(credentialsId: 'nexus-token', variable: 'NEXUS_TOKEN'),
                  string(credentialsId: 'github-token', variable: 'GIT_TOKEN'),
                ]) {
                    sh 'bash build.sh'
                }
            }
        }
        stage('Package') {
            steps {
                pack()
            }
        }
        stage('Documentation') {
            steps {
                genDocumentation()
            }
        }
        stage('Publish') {
            when { branch "dblp" }
            steps {
                script {
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
