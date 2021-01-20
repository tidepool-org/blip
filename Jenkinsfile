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
            agent {
                dockerfile {
                    filename 'Dockerfile.build'
                    reuseNode true
                }
            }
            steps {
                withCredentials([string(credentialsId: 'nexus-token', variable: 'NEXUS_TOKEN')]) {
                    sh 'npm install'
                }
            }
        }
        stage('Test') {
            agent {
                dockerfile {
                    filename 'Dockerfile.build'
                    reuseNode true
                }
            }
            steps {
                withCredentials([string(credentialsId: 'nexus-token', variable: 'NEXUS_TOKEN')]) {
                    sh 'npm run lint'
                    sh 'npm run test-platform-client'
                    sh 'npm run test-sundial'
                    sh 'npm run test-tideline'
                    sh 'npm run test-viz'
                    sh 'npm run test-blip'
                    sh 'npm run test-yourloops'
                    sh 'npm run test-lambda'
                    sh 'npm run security-checks'
                }
            }
        }
        stage('Build') {
            agent {
                dockerfile {
                    filename 'Dockerfile.build'
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
                script {
                    utils.initPipeline()
                    withCredentials([string(credentialsId: 'nexus-token', variable: 'NEXUS_TOKEN')]) {
                        docker.image('docker.ci.diabeloop.eu/ci-toolbox').inside() {
                            env.version = sh (
                                script: 'release-helper get-version',
                                returnStdout: true
                            ).trim().toUpperCase()

                            def config = getConfig()
                            env.module = config.module
                            def soupFileName = utils.getSoupFileName(module, version)

                            sh """
                                mkdir -p output
                                echo "Soup list generation"
                                release-helper gen-dep-report --deep-dep 'blip,sundial,tideline,tidepool-platform-client,tidepool-viz' "output/${soupFileName}"
                                rm -fv deps-errors.txt deps-prod.json
                            """

                            dir("output") {
                                archiveArtifacts artifacts: "${soupFileName}"
                                stash name: utils.docStashName, includes: "*", allowEmtpy: true
                            }
                        }
                    }
                }
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
