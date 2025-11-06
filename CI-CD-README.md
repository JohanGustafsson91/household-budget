# CI/CD Pipeline and Dependabot Automation

This document explains the automated CI/CD pipeline and Dependabot setup for the Household Budget project.

## Overview

The project implements a fully automated CI/CD pipeline with the following key features:

1. **Automated Dependency Updates** - Dependabot automatically checks for and updates dependencies
2. **Automated Testing** - All pull requests (including Dependabot PRs) are automatically tested
3. **Auto-merge for Safe Updates** - Minor and patch updates that pass all tests are automatically merged
4. **Automated Production Deployments** - Code merged to main is automatically deployed to Firebase

## Dependabot Configuration

### What Dependabot Does

- **Daily Checks**: Automatically checks for dependency updates every day at 09:00 UTC
- **Smart Grouping**: Groups production and development dependencies separately
- **Safe Updates Only**: Only creates PRs for minor and patch updates (major updates require manual review)
- **Automatic Labeling**: PRs are automatically labeled with `dependencies` and `dependabot`

### Configuration Details

- **Schedule**: Daily at 09:00 UTC
- **Ecosystem**: npm/pnpm
- **PR Limit**: Maximum 10 open PRs at once
- **Auto-merge**: Enabled for minor and patch updates that pass CI
- **Major Updates**: Require manual review for safety

## CI/CD Pipeline

### Pull Request Pipeline (`.github/workflows/ci.yml`)

**Triggers**: 
- Pull requests to `main` branch
- Dependabot PRs

**Steps**:
1. **Code Checkout**: Fetches the latest code
2. **Setup Environment**: Configures Node.js and pnpm
3. **Dependency Caching**: Caches pnpm dependencies for faster builds
4. **Install Dependencies**: Installs all project dependencies
5. **Cypress Setup**: Caches and installs Cypress binary
6. **Quality Checks**:
   - Linting (ESLint + unused exports check)
   - Type checking (TypeScript)
   - Build verification
7. **End-to-End Tests**: Runs Cypress tests in headless mode
8. **Auto-merge**: For Dependabot PRs that pass all checks

### Deployment Pipeline (`.github/workflows/deploy.yml`)

**Triggers**:
- Push to `main` branch (after merge)
- Manual workflow dispatch (for emergency deployments)

**Steps**:
1. **Code Checkout**: Fetches the merged code
2. **Setup Environment**: Configures Node.js and pnpm with caching
3. **Install Dependencies**: Installs all project dependencies
4. **Quality Assurance**: Runs linting to ensure code quality
5. **Production Build**: Builds the optimized production version
6. **Firebase Deployment**: Deploys to Firebase production using the existing deploy script
7. **Status Reporting**: Provides clear success/failure notifications

## Required GitHub Secrets

To enable the automated deployment, you need to configure the following GitHub Secrets:

### `FIREBASE_TOKEN`

**How to generate**:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login:ci`
3. Copy the generated token

**How to add to GitHub**:
1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `FIREBASE_TOKEN`
4. Value: Paste your Firebase token
5. Click "Add secret"

## Workflow Benefits

### Development Efficiency
- **Zero Manual Intervention**: Safe dependency updates are fully automated
- **Fast Feedback**: Immediate testing on all changes
- **Consistent Quality**: All code must pass the same quality checks
- **Rapid Deployment**: Changes are deployed to production automatically after merge

### Safety and Reliability
- **Comprehensive Testing**: Unit tests, integration tests, and E2E tests
- **Quality Gates**: Linting and type checking prevent bad code from reaching production
- **Gradual Updates**: Only minor and patch updates are auto-merged
- **Rollback Safety**: Each deployment is traceable to a specific commit

### Cost Efficiency
- **Dependency Caching**: Reduces build times and resource usage
- **Parallel Execution**: Tests run efficiently in parallel
- **Smart Grouping**: Dependabot groups related updates to reduce PR noise

## Monitoring and Troubleshooting

### Checking Workflow Status
- Go to the "Actions" tab in your GitHub repository
- View workflow runs and their status
- Check logs for detailed error information

### Common Issues
1. **Firebase Token Expired**: Regenerate and update the `FIREBASE_TOKEN` secret
2. **Test Failures**: Check the Cypress test logs and screenshots in the workflow artifacts
3. **Build Failures**: Review the build logs for TypeScript or Vite errors
4. **Dependency Conflicts**: Dependabot will handle these, but major updates may need manual intervention

### Manual Interventions
- **Major Updates**: Review and merge manually after testing
- **Emergency Deployments**: Use the manual workflow dispatch trigger
- **Rollbacks**: Use Firebase console or CLI to rollback if needed

## Best Practices Followed

1. **Security**: All secrets are stored in GitHub Secrets, never in code
2. **Performance**: Extensive caching for dependencies and build artifacts
3. **Reliability**: Comprehensive testing before any deployment
4. **Maintainability**: Clear comments and structured workflow files
5. **Scalability**: Matrix builds and parallel execution for efficiency

This setup ensures that your Household Budget application stays up-to-date, secure, and continuously delivered to production with minimal manual overhead.