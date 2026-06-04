// ─── What is a Jenkinsfile? ───────────────────────────────────────────────────
// A Jenkinsfile defines your CI/CD pipeline as code.
// It lives in your repository — version controlled like your tests.
// Jenkins reads this file and executes the pipeline automatically.
// Pipeline as Code = no manual Jenkins job configuration needed.

pipeline {
    
    // ── Agent ──────────────────────────────────────────────────────────────────
    // agent any = run on any available Jenkins agent/node
    // In enterprise: agent { label 'playwright' } targets specific nodes
    // with Playwright pre-installed
    
    agent any
    
    // ── Build parameters ───────────────────────────────────────────────────────
    // These appear as form fields in Jenkins UI when you click "Build with Parameters"
    // Allows non-technical team members to trigger specific test runs
    
    parameters {
        choice(
            name: 'BROWSER',
            choices: ['chromium', 'firefox', 'webkit'],
            description: 'Browser to run tests on'
        )
        choice(
            name: 'TEST_TAG',
            choices: ['all', '@Smoke', '@P0', '@P1', '@Regression'],
            description: 'Which tests to run'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['development', 'staging', 'production'],
            description: 'Target environment'
        )
        booleanParam(
            name: 'RUN_IN_DOCKER',
            defaultValue: false,
            description: 'Run tests inside Docker container'
        )
    }
    
    // ── Environment variables ──────────────────────────────────────────────────
    // These are available to all stages
    // credentials() reads from Jenkins Credentials store
    // Never hardcode passwords in Jenkinsfile
    
    environment {
        CI = 'true'
        NODE_VERSION = '20'
        BASE_URL = credentials('BASE_URL')
        TEST_USERNAME = credentials('TEST_USERNAME')
        TEST_PASSWORD = credentials('TEST_PASSWORD')
        NODE_TLS_REJECT_UNAUTHORIZED = '0'
        IGNORE_HTTPS_ERRORS = 'true'
    }
    
    // ── Options ────────────────────────────────────────────────────────────────
    options {
        // Fail build if it runs longer than 60 minutes
        timeout(time: 60, unit: 'MINUTES')
        
        // Keep last 10 build records in Jenkins UI
        buildDiscarder(logRotator(numToKeepStr: '10'))
        
        // Add timestamps to console output
        timestamps()
        
        // Do not run concurrent builds of the same branch
        disableConcurrentBuilds()
    }
    
    stages {
        
        // ── Stage 1: Checkout ─────────────────────────────────────────────────
        stage('📥 Checkout') {
            steps {
                echo 'Checking out repository...'
                checkout scm
                // scm = Source Control Management
                // reads connection from Jenkins job configuration
            }
        }
        
        // ── Stage 2: Setup ────────────────────────────────────────────────────
        stage('🔧 Setup') {
            steps {
                echo "Setting up Node.js ${NODE_VERSION}..."
                
                // Use Node.js tool configured in Jenkins
                // Requires NodeJS plugin installed in Jenkins
                nodejs(nodeJSInstallationName: "NodeJS-${NODE_VERSION}") {
                    sh 'node --version'
                    sh 'npm --version'
                    
                    echo 'Installing dependencies...'
                    sh 'npm ci'
                }
            }
        }
        
        // ── Stage 3: Install Browsers ─────────────────────────────────────────
        stage('🎭 Install Browsers') {
            steps {
                nodejs(nodeJSInstallationName: "NodeJS-${NODE_VERSION}") {
                    sh "npx playwright install --with-deps ${params.BROWSER}"
                }
            }
        }
        
        // ── Stage 4: Lint/TypeCheck ───────────────────────────────────────────
        // Fail fast — catch TypeScript errors before running tests
        stage('🔍 TypeScript Check') {
            steps {
                nodejs(nodeJSInstallationName: "NodeJS-${NODE_VERSION}") {
                    sh 'npx tsc --noEmit'
                }
            }
        }
        
        // ── Stage 5: Run Tests ────────────────────────────────────────────────
        stage('🧪 Run Tests') {
            steps {
                nodejs(nodeJSInstallationName: "NodeJS-${NODE_VERSION}") {
                    
                    script {
                        // Build the test command based on parameters
                        def testCommand = "npx playwright test --project=${params.BROWSER}"
                        
                        if (params.TEST_TAG != 'all') {
                            testCommand += " --grep \"${params.TEST_TAG}\""
                        }
                        
                        if (params.RUN_IN_DOCKER) {
                            echo 'Running tests in Docker container...'
                            sh """
                                docker build -t my-playwright-framework .
                                docker run --rm \\
                                    -v \${WORKSPACE}/test-results:/app/test-results \\
                                    -v \${WORKSPACE}/playwright-report:/app/playwright-report \\
                                    -v \${WORKSPACE}/tta-report:/app/tta-report \\
                                    -e BASE_URL=\${BASE_URL} \\
                                    -e TEST_USERNAME=\${TEST_USERNAME} \\
                                    -e TEST_PASSWORD=\${TEST_PASSWORD} \\
                                    -e CI=true \\
                                    my-playwright-framework \\
                                    ${testCommand}
                            """
                        } else {
                            echo "Running tests directly: ${testCommand}"
                            sh testCommand
                        }
                    }
                }
            }
        }
        
        // ── Stage 6: Publish Reports ──────────────────────────────────────────
        stage('📊 Publish Reports') {
            
            // always() = run this stage even if tests failed
            // Without this, failed test runs would not publish reports
            when {
                expression { return true }
            }
            
            steps {
                script {
                    echo 'Publishing test reports...'
                    
                    // Publish HTML report using Jenkins HTML Publisher plugin
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report',
                        reportTitles: 'Playwright Test Report'
                    ])
                    
                    // Publish TTA custom report
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'tta-report',
                        reportFiles: 'index.html',
                        reportName: 'TTA Report',
                        reportTitles: 'TTA Automation Report'
                    ])
                }
            }
        }
    }
    
    // ── Post Actions ──────────────────────────────────────────────────────────
    // These run after all stages complete
    // Regardless of pass or fail
    
    post {
        
        always {
            echo 'Archiving test artifacts...'
            
            // Archive test results so they appear in Jenkins build page
            archiveArtifacts(
                artifacts: 'test-results/**/*,tta-report/**/*',
                allowEmptyArchive: true
            )
            
            // Clean workspace to free disk space
            // Important on Jenkins agents with limited storage
            cleanWs()
        }
        
        success {
            echo '✅ All tests passed!'
            
            // In enterprise: send Slack/Teams notification
            // slackSend color: 'good', message: "✅ Tests passed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        
        failure {
            echo '❌ Tests failed!'
            
            // In enterprise: send failure notification
            // slackSend color: 'danger', message: "❌ Tests failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        
        unstable {
            echo '⚠️ Some tests failed (unstable build)'
        }
    }
}