# CI/CD Pipeline Documentation

This directory contains the GitHub Actions workflows and configuration for the TodoWeb 2.0 project.

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)
**Triggers:** Push to main/develop branches, Pull requests

**Jobs:**
- **Backend Tests**: Runs Python unit tests with MySQL service
- **Frontend Tests**: Runs React tests with linting and build verification
- **Security Scan**: Vulnerability scanning with Trivy
- **Docker Build**: Builds and pushes Docker images to GitHub Container Registry
- **Integration Tests**: End-to-end testing with Docker Compose

### 2. CD Pipeline (`.github/workflows/cd.yml`)
**Triggers:** Push to main branch, Manual workflow dispatch

**Jobs:**
- **Deploy to Staging**: Automated deployment to staging environment
- **Deploy to Production**: Manual deployment to production (requires approval)
- **Rollback**: Automatic rollback on deployment failure

### 3. Security Pipeline (`.github/workflows/security.yml`)
**Triggers:** Push to main/develop, Pull requests, Weekly schedule

**Jobs:**
- **Dependency Scan**: Scans for vulnerable dependencies
- **Code Quality**: Bandit and Safety security analysis
- **Frontend Security**: npm audit and Snyk scanning
- **Container Security**: Docker image vulnerability scanning

### 4. Release Pipeline (`.github/workflows/release.yml`)
**Triggers:** Git tags (v*), Manual workflow dispatch

**Jobs:**
- **Create Release**: Generates GitHub release with changelog
- **Build and Push**: Builds production Docker images
- **Generate Changelog**: Auto-generates release notes
- **Notify**: Sends notifications to Slack

## Configuration Files

### Dependabot (`.github/dependabot.yml`)
Automatically updates dependencies for:
- npm packages (frontend)
- pip packages (backend)
- Docker images
- GitHub Actions

### Code Owners (`.github/CODEOWNERS`)
Defines code ownership and review requirements.

### Issue Templates
- Bug report template
- Feature request template

### Pull Request Template
Standardized PR template with checklists and guidelines.

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Required
- `GITHUB_TOKEN` (automatically provided)

### Optional
- `SNYK_TOKEN`: For Snyk security scanning
- `DOCKER_USERNAME`: For Docker registry authentication
- `DOCKER_PASSWORD`: For Docker registry authentication

## Environment Variables

### Staging Environment
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `SECRET_KEY`
- `ALLOWED_ORIGINS`

### Production Environment
- `MYSQL_ROOT_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `SECRET_KEY`
- `ALLOWED_ORIGINS`

## Usage

### Running Tests Locally

**Backend:**
```bash
cd backend
pip install -r requirements.txt
pytest
```

**Frontend:**
```bash
cd frontend
npm install
npm test
```

### Manual Deployment

1. Go to Actions tab in GitHub
2. Select "CD Pipeline"
3. Click "Run workflow"
4. Choose environment (staging/production)
5. Click "Run workflow"

### Creating a Release

1. Create and push a git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. Or use manual workflow dispatch with version input

## Monitoring

- **Security**: Check Security tab for vulnerability reports
- **Code Quality**: Review PR checks and coverage reports
- **Deployments**: Monitor Actions tab for deployment status

## Troubleshooting

### Common Issues

1. **Tests failing**: Check test logs in Actions tab
2. **Docker build failing**: Verify Dockerfile syntax and dependencies
3. **Deployment failing**: Check environment variables and secrets
4. **Security scan alerts**: Review and update vulnerable dependencies

### Getting Help

- Check the Actions logs for detailed error messages
- Review the Security tab for vulnerability details
- Consult the project documentation for setup instructions
