@echo off
REM TodoWeb 2.0 Local Test Runner for Windows
REM This script runs all tests locally without needing to push to GitHub

setlocal enabledelayedexpansion

echo [INFO] Starting TodoWeb 2.0 Local Test Suite
echo ==============================================

REM Create test results directory
if not exist test-results mkdir test-results

REM 1. Backend Tests
echo [INFO] Running Backend Tests...
echo -------------------------------

cd backend

REM Install Python dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to install Python dependencies
    goto :error
)

REM Run backend tests
echo [INFO] Running Python unit tests...
pytest --cov=. --cov-report=term-missing --cov-report=html:../test-results/backend-coverage --junitxml=../test-results/backend-results.xml -v
if errorlevel 1 (
    echo [ERROR] Backend tests failed
    set BACKEND_FAILED=1
) else (
    echo [SUCCESS] Backend tests passed
)

REM Run security scans
echo [INFO] Running backend security scans...

REM Bandit security scan
echo [INFO] Running Bandit security scan...
bandit -r . -f json -o ../test-results/bandit-report.json
if errorlevel 1 (
    echo [WARNING] Bandit found security issues (see bandit-report.json)
) else (
    echo [SUCCESS] Bandit scan completed
)

REM Safety check
echo [INFO] Running Safety dependency check...
safety check --json --output ../test-results/safety-report.json
if errorlevel 1 (
    echo [WARNING] Safety found vulnerable dependencies (see safety-report.json)
) else (
    echo [SUCCESS] Safety check passed
)

cd ..

REM 2. Frontend Tests
echo [INFO] Running Frontend Tests...
echo --------------------------------

cd frontend

REM Install Node dependencies
echo [INFO] Installing Node.js dependencies...
npm install >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to install Node.js dependencies
    goto :error
)

REM Run frontend tests
echo [INFO] Running React tests...
npm test -- --run --coverage --reporter=verbose
if errorlevel 1 (
    echo [ERROR] Frontend tests failed
    set FRONTEND_FAILED=1
) else (
    echo [SUCCESS] Frontend tests passed
)

REM Run npm audit
echo [INFO] Running npm audit...
npm audit --audit-level=moderate --json > ../test-results/npm-audit-report.json
if errorlevel 1 (
    echo [WARNING] npm audit found vulnerabilities (see npm-audit-report.json)
) else (
    echo [SUCCESS] npm audit passed
)

cd ..

REM 3. Integration Tests
echo [INFO] Running Integration Tests...
echo -----------------------------------

REM Start backend in background
echo [INFO] Starting backend server...
cd backend
start /B python -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../test-results/backend.log 2>&1
cd ..

REM Wait for backend to start
echo [INFO] Waiting for backend to start...
timeout /t 10 /nobreak >nul

REM Check if backend is running
curl -s http://localhost:8000/docs >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Backend failed to start
    set INTEGRATION_FAILED=1
) else (
    echo [SUCCESS] Backend is running
    
    REM Run integration tests
    echo [INFO] Running integration tests...
    python scripts/test_backend.py > test-results/integration.log 2>&1
    if errorlevel 1 (
        echo [ERROR] Integration tests failed (see integration.log)
        set INTEGRATION_FAILED=1
    ) else (
        echo [SUCCESS] Integration tests passed
    )
)

REM Stop backend (kill any Python processes on port 8000)
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

REM 4. Docker Tests
echo [INFO] Running Docker Tests...
echo -----------------------------

REM Build backend image
echo [INFO] Building backend Docker image...
docker build -t todoweb-backend:test ./backend > test-results/docker-backend-build.log 2>&1
if errorlevel 1 (
    echo [ERROR] Backend Docker image build failed (see docker-backend-build.log)
    set DOCKER_FAILED=1
) else (
    echo [SUCCESS] Backend Docker image built successfully
)

REM Build frontend image
echo [INFO] Building frontend Docker image...
docker build -t todoweb-frontend:test ./frontend > test-results/docker-frontend-build.log 2>&1
if errorlevel 1 (
    echo [ERROR] Frontend Docker image build failed (see docker-frontend-build.log)
    set DOCKER_FAILED=1
) else (
    echo [SUCCESS] Frontend Docker image built successfully
)

REM 5. Summary
echo [INFO] Test Summary
echo ==============

set TOTAL_FAILED=0

if defined BACKEND_FAILED (
    echo [ERROR] Backend tests failed
    set /a TOTAL_FAILED+=1
)

if defined FRONTEND_FAILED (
    echo [ERROR] Frontend tests failed
    set /a TOTAL_FAILED+=1
)

if defined INTEGRATION_FAILED (
    echo [ERROR] Integration tests failed
    set /a TOTAL_FAILED+=1
)

if defined DOCKER_FAILED (
    echo [ERROR] Docker tests failed
    set /a TOTAL_FAILED+=1
)

echo.
echo [INFO] Test results saved to test-results/ directory:
echo   - Backend coverage: test-results/backend-coverage/
echo   - Backend results: test-results/backend-results.xml
echo   - Security reports: test-results/*-report.json
echo   - Integration log: test-results/integration.log
echo   - Docker logs: test-results/docker-*.log
echo   - Backend log: test-results/backend.log

if %TOTAL_FAILED%==0 (
    echo [SUCCESS] All tests passed! 🎉
    exit /b 0
) else (
    echo [ERROR] %TOTAL_FAILED% test suite(s) failed
    exit /b 1
)

:error
echo [ERROR] Test execution failed
exit /b 1
