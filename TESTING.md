# Local Testing Guide

This guide explains how to run all tests locally without needing to push to GitHub.

## Quick Start

### Linux/Mac
```bash
./run-local-tests.sh
```

### Windows
```cmd
run-local-tests.bat
```

## What the Test Scripts Do

The local test scripts run the complete test suite including:

### 1. Backend Tests
- **Unit Tests**: All Python unit tests with coverage
- **Security Scans**: Bandit and Safety security analysis
- **Coverage Report**: HTML coverage report in `test-results/backend-coverage/`

### 2. Frontend Tests
- **React Tests**: All frontend unit tests with coverage
- **Security Audit**: npm audit for vulnerable dependencies
- **Coverage Report**: Coverage data in `test-results/coverage/`

### 3. Integration Tests
- **API Tests**: End-to-end API testing
- **Backend Startup**: Verifies backend starts correctly
- **Database Tests**: Tests database connectivity and operations

### 4. Docker Tests
- **Image Building**: Tests Docker image builds
- **Container Security**: Trivy security scanning (if available)
- **Build Logs**: Detailed build logs for debugging

## Prerequisites

### Required
- **Python 3.8+**: For backend testing
- **Node.js 16+**: For frontend testing
- **Docker**: For container testing
- **Docker Compose**: For full stack testing

### Optional
- **Trivy**: For container security scanning
  ```bash
  # Install Trivy
  # Linux/Mac
  curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
  
  # Windows (with Chocolatey)
  choco install trivy
  ```

## Test Results

All test results are saved to the `test-results/` directory:

```
test-results/
├── backend-coverage/          # HTML coverage report
├── backend-results.xml        # JUnit test results
├── bandit-report.json         # Security scan results
├── safety-report.json         # Dependency vulnerability scan
├── npm-audit-report.json      # Frontend dependency audit
├── integration.log            # Integration test logs
├── backend.log               # Backend server logs
├── docker-backend-build.log  # Backend Docker build logs
├── docker-frontend-build.log # Frontend Docker build logs
├── trivy-backend-report.txt  # Backend container security
└── trivy-frontend-report.txt # Frontend container security
```

## Manual Testing

### Backend Only
```bash
cd backend
pip install -r requirements.txt
pytest --cov=. --cov-report=html
```

### Frontend Only
```bash
cd frontend
npm install
npm test -- --run --coverage
```

### Integration Tests
```bash
# Start backend
cd backend
python -m uvicorn main:app --reload

# In another terminal
python scripts/test_backend.py
```

### Docker Tests
```bash
# Build images
docker build -t todoweb-backend:test ./backend
docker build -t todoweb-frontend:test ./frontend

# Run with Docker Compose
docker-compose -f docker/docker-compose.yml up --build
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Backend (8000): Kill existing processes or change port
   - Frontend (3000): Kill existing processes or change port

2. **Python Dependencies**
   - Ensure virtual environment is activated
   - Update pip: `pip install --upgrade pip`

3. **Node Dependencies**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules && npm install`

4. **Docker Issues**
   - Ensure Docker is running
   - Check Docker daemon status
   - Clear Docker cache: `docker system prune`

### Debug Mode

Run tests with verbose output:
```bash
# Backend
cd backend
pytest -v -s

# Frontend
cd frontend
npm test -- --verbose
```

## Continuous Integration

The same tests run automatically on GitHub Actions when you push to:
- `main` branch
- `develop` branch
- Pull requests

Check the Actions tab in GitHub to see CI/CD pipeline status.

## Security Scanning

### Backend Security
- **Bandit**: Python security linting
- **Safety**: Dependency vulnerability scanning

### Frontend Security
- **npm audit**: Node.js dependency vulnerabilities
- **Snyk**: Advanced security analysis (requires SNYK_TOKEN)

### Container Security
- **Trivy**: Container image vulnerability scanning
- **Docker Scout**: Docker security scanning

## Performance Testing

For performance testing, use the integration test script with load testing:

```bash
# Install locust for load testing
pip install locust

# Run load tests
locust -f tests/load_test.py --host=http://localhost:8000
```

## Coverage Reports

- **Backend**: Open `test-results/backend-coverage/index.html`
- **Frontend**: Open `test-results/coverage/lcov-report/index.html`

## Best Practices

1. **Run tests before pushing**: Always run local tests before pushing code
2. **Fix failing tests**: Don't push code with failing tests
3. **Check coverage**: Aim for >80% test coverage
4. **Review security reports**: Address high-severity vulnerabilities
5. **Update dependencies**: Keep dependencies up to date
