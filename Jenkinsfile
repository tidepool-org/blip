@Library('mdblp-library') _

pipeline {
    agent {
        label 'blip'
    }
    environment {
        node_version='14'
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
                    sh 'npm run clean-coverage'
                    sh 'npm run lint'
                    sh 'npm run test-sundial'
                    sh 'npm run test-tideline'
                    sh 'npm run test-viz'
                    sh 'npm run test-blip'
                    sh 'npm run test-yourloops'
                    sh 'npm run test-lambda'
                    sh 'npm run security-checks'
                    junit 'reports/*.junit.xml'
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
                    sh 'nice bash build.sh'
                }
            }
        }
        stage('Package') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'nexus-token', variable: 'NEXUS_TOKEN')]) {
                        pack()
                    }
                    if (env.GIT_BRANCH == 'dblp' || 'engineering/latest-tag') {
                        //publish latest tag when git branch is dblp
                        echo "Push latest tag"
                        def config = getConfig()
                        dockerImageName = config.dockerImageName
                        withCredentials([usernamePassword(credentialsId: 'nexus-jenkins', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PWD')]) {
                            pushDocker("${utils.diabeloopRegistry}", "${NEXUS_USER}", "${NEXUS_PWD}", "${dockerImageName}:${GIT_COMMIT}", "latest")
                        }
                    }
                }
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
                                release-helper gen-dep-report --deep-dep 'blip,sundial,tideline,tidepool-viz' "output/${soupFileName}"
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
        stage('Verify translations') {
            agent {
                dockerfile {
                    filename 'Dockerfile.build'
                    reuseNode true
                }
            }
            steps {
                sh 'npm run test-locales'
            }
        }
        stage('Publish') {
            when {
                expression {
                    env.GIT_BRANCH == "dblp"
                }
            }
            steps {
                script {
                    env.target = "preview"
                    if (env.version == "UNRELEASED") {
                        env.version = "master"
                    }
                }
                lock('blip-cloudfront-publish') {
                    withCredentials([string(credentialsId: 'DEV_AWS_ACCESS_KEY', variable: 'AWS_ACCESS_KEY_ID'),
                        string(credentialsId: 'DEV_AWS_SECRET_KEY', variable: 'AWS_SECRET_ACCESS_KEY'),
                        string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT')]) {
                        sh 'docker run --rm -e STACK_VERSION=${version}:${GIT_COMMIT} -e APP_VERSION=${version}:${GIT_COMMIT} -e AWS_ACCOUNT -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY --env-file ./cloudfront-dist/deployment/${target}.env blip:${GIT_COMMIT}'
                    }
                    publish()
                }
            }
        }
    }
}
