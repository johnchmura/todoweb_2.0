#!/bin/bash

# TodoWeb 2.0 Local Test Runner
# This script runs all tests locally without needing to push to GitHub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    # Stop any running containers
    docker-compose -f docker/docker-compose.yml down >/dev/null 2>&1 || true
    # Kill any background processes
    jobs -p | xargs -r kill >/dev/null 2>&1 || true
}

# Set trap for cleanup on exit
trap cleanup EXIT

print_status "Starting TodoWeb 2.0 Local Test Suite"
echo "=============================================="

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists python3; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is required but not installed"
    exit 1
fi

if ! command_exists docker; then
    print_error "Docker is required but not installed"
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose is required but not installed"
    exit 1
fi

print_success "All prerequisites found"

# Check if ports are available
if port_in_use 8000; then
    print_warning "Port 8000 is in use. Backend tests may fail."
fi

if port_in_use 3000; then
    print_warning "Port 3000 is in use. Frontend tests may fail."
fi

# Create test results directory
mkdir -p test-results

# 1. Backend Tests
print_status "Running Backend Tests..."
echo "-------------------------------"

cd backend

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt >/dev/null 2>&1

# Run backend tests
print_status "Running Python unit tests..."
if pytest --cov=. --cov-report=term-missing --cov-report=html:../test-results/backend-coverage --junitxml=../test-results/backend-results.xml -v; then
    print_success "Backend tests passed"
else
    print_error "Backend tests failed"
    BACKEND_FAILED=1
fi

# Run security scans
print_status "Running backend security scans..."

# Bandit security scan
print_status "Running Bandit security scan..."
if bandit -r . -f json -o ../test-results/bandit-report.json; then
    print_success "Bandit scan completed"
else
    print_warning "Bandit found security issues (see bandit-report.json)"
fi

# Safety check
print_status "Running Safety dependency check..."
if safety check --json --output ../test-results/safety-report.json; then
    print_success "Safety check passed"
else
    print_warning "Safety found vulnerable dependencies (see safety-report.json)"
fi

cd ..

# 2. Frontend Tests
print_status "Running Frontend Tests..."
echo "--------------------------------"

cd frontend

# Install Node dependencies
print_status "Installing Node.js dependencies..."
npm install >/dev/null 2>&1

# Run frontend tests
print_status "Running React tests..."
if npm test -- --run --coverage --reporter=verbose; then
    print_success "Frontend tests passed"
else
    print_error "Frontend tests failed"
    FRONTEND_FAILED=1
fi

# Run npm audit
print_status "Running npm audit..."
if npm audit --audit-level=moderate --json > ../test-results/npm-audit-report.json; then
    print_success "npm audit passed"
else
    print_warning "npm audit found vulnerabilities (see npm-audit-report.json)"
fi

cd ..

# 3. Integration Tests
print_status "Running Integration Tests..."
echo "-----------------------------------"

# Start backend in background
print_status "Starting backend server..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 > ../test-results/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 10

# Check if backend is running
if curl -s http://localhost:8000/docs > /dev/null; then
    print_success "Backend is running"
    
    # Run integration tests
    print_status "Running integration tests..."
    if python scripts/test_backend.py > test-results/integration.log 2>&1; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed (see integration.log)"
        INTEGRATION_FAILED=1
    fi
else
    print_error "Backend failed to start"
    INTEGRATION_FAILED=1
fi

# Stop backend
kill $BACKEND_PID >/dev/null 2>&1 || true

# 4. Docker Tests
print_status "Running Docker Tests..."
echo "-----------------------------"

# Build and test Docker images
print_status "Building Docker images..."

# Build backend image
print_status "Building backend Docker image..."
if docker build -t todoweb-backend:test ./backend > test-results/docker-backend-build.log 2>&1; then
    print_success "Backend Docker image built successfully"
else
    print_error "Backend Docker image build failed (see docker-backend-build.log)"
    DOCKER_FAILED=1
fi

# Build frontend image
print_status "Building frontend Docker image..."
if docker build -t todoweb-frontend:test ./frontend > test-results/docker-frontend-build.log 2>&1; then
    print_success "Frontend Docker image built successfully"
else
    print_error "Frontend Docker image build failed (see docker-frontend-build.log)"
    DOCKER_FAILED=1
fi

# 5. Container Security Tests (if Trivy is available)
if command_exists trivy; then
    print_status "Running Container Security Tests..."
    echo "------------------------------------------"
    
    # Scan backend image
    print_status "Scanning backend Docker image..."
    trivy image --format table --output test-results/trivy-backend-report.txt todoweb-backend:test || true
    
    # Scan frontend image
    print_status "Scanning frontend Docker image..."
    trivy image --format table --output test-results/trivy-frontend-report.txt todoweb-frontend:test || true
    
    print_success "Container security scans completed"
else
    print_warning "Trivy not found, skipping container security scans"
fi

# 6. Summary
print_status "Test Summary"
echo "=============="

TOTAL_FAILED=0

if [ "$BACKEND_FAILED" = "1" ]; then
    print_error "Backend tests failed"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

if [ "$FRONTEND_FAILED" = "1" ]; then
    print_error "Frontend tests failed"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

if [ "$INTEGRATION_FAILED" = "1" ]; then
    print_error "Integration tests failed"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

if [ "$DOCKER_FAILED" = "1" ]; then
    print_error "Docker tests failed"
    TOTAL_FAILED=$((TOTAL_FAILED + 1))
fi

echo ""
print_status "Test results saved to test-results/ directory:"
echo "  - Backend coverage: test-results/backend-coverage/"
echo "  - Backend results: test-results/backend-results.xml"
echo "  - Security reports: test-results/*-report.json"
echo "  - Integration log: test-results/integration.log"
echo "  - Docker logs: test-results/docker-*.log"
echo "  - Backend log: test-results/backend.log"

if [ $TOTAL_FAILED -eq 0 ]; then
    print_success "All tests passed! 🎉"
    exit 0
else
    print_error "$TOTAL_FAILED test suite(s) failed"
    exit 1
fi
