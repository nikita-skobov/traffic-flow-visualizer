pipeline {
  agent any

  environment {
      NODE_MODULES_EXISTS = 0
      PACKAGE_WAS_CHANGED = 0
      SRC_WAS_CHANGED = 0
      PUBLIC_WAS_CHANGED = 0
      REPORT_BUCKET = "projects.nikitas.link-reports"
      NUMBER_OF_COMMITS = 0
      DEPLOYMENT_STAGE = "staging"

      SETUP_END = "."
      TEST_END = "."
      INFRASTRUCTURE_DEPLOYMENT_END = "."
      INFRASTRUCTURE_TESTING_END = "."
      BUILDING_END = "."
      DEPLOYMENT_END = "."
  }

  stages {
    stage('Setup') {
        steps {
            script {
                if (env.GIT_BRANCH == "origin/master-production") {
                  echo "THIS IS A PRODUCTION BUILD"
                  DEPLOYMENT_STAGE = "production"
                }

                NUMBER_OF_COMMITS = sh(script: 'git log ${GIT_PREVIOUS_COMMIT}..${GITCOMMIT} --pretty=oneline | wc -l', returnStdout: true).trim()
                echo "number of commits: ${NUMBER_OF_COMMITS}"
                NODE_MODULES_EXISTS = sh(script: "[ -d ./node_modules/ ]", returnStatus: true)
                echo "previous commit: ${env.GIT_PREVIOUS_COMMIT}"
                echo "current commit: ${env.GIT_COMMIT}"
                PACKAGE_WAS_CHANGED = sh(script:'echo $(git diff --name-only ${GIT_PREVIOUS_COMMIT} ${GIT_COMMIT}) | grep --quiet "package.json"', returnStatus: true)
                echo "package was changed? ${PACKAGE_WAS_CHANGED}"
                SRC_WAS_CHANGED = sh(script:'echo $(git diff --name-only ${GIT_PREVIOUS_COMMIT} ${GIT_COMMIT}) | grep --quiet "ui/src/*"', returnStatus: true)
                echo "src was changed? ${SRC_WAS_CHANGED}"
                PUBLIC_WAS_CHANGED = sh(script:'echo $(git diff --name-only ${GIT_PREVIOUS_COMMIT} ${GIT_COMMIT}) | grep --quiet "ui/public/*"', returnStatus: true)
                echo "public was changed? ${PUBLIC_WAS_CHANGED}"


                if (NODE_MODULES_EXISTS == 1) {
                    // 1 means it does NOT exist
                    echo "node modules does not exist. running npm install"
                    sh 'cd ui/ && npm install'
                } else if (PACKAGE_WAS_CHANGED == 0) {
                    // 0 means it WAS changed
                    echo "package.json has changed. running npm install"
                    sh 'cd ui/ && npm install'
                } else {
                    echo "package.json is the same as it was last time. skipping npm install"
                }

                SETUP_END = "${currentBuild.duration}"
            }
        }
    }

    stage('Test') {
      steps {
        sh 'cd ui/ && node -v && npm -v && npm run test-CI-json'
        script {
          TEST_END = "${currentBuild.duration}"
        }
      }
    }

    stage('Building') {
        steps {
            script {
              if (SRC_WAS_CHANGED == 0 || PUBLIC_WAS_CHANGED == 0 || DEPLOYMENT_STAGE == "production") {
                echo "Source was changed, or in production stage. running build"
                sh 'cd ui/ && npm run build'
              } else {
                echo "Skipping build since source has not changed"
              }

              BUILDING_END = "${currentBuild.duration}"
            }
        }
    }
  }

  post {
    always {
      sh "cd ui/ && node runReport.js --current-commit ${env.GIT_COMMIT} --stages Setup,${SETUP_END},Test,${TEST_END},Building,${BUILDING_END} --num-commits ${NUMBER_OF_COMMITS} --branch ${env.GIT_BRANCH} --build-start ${currentBuild.startTimeInMillis} --build-duration ${currentBuild.duration} --coverage-path coverage/clover.xml --build-status ${currentBuild.result} > ../latest.json"
      sh "bash ./scripts/sendReport.sh --report-bucket ${REPORT_BUCKET} --project-name ${env.JOB_NAME}"
    }
    success {
      echo 'Nice!!!'
    }
    unstable {
      echo 'Are we unstable?? why?'
    }
    failure {
      echo 'Im a failure :('
    }
  }
}
