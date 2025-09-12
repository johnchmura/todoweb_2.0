#!/bin/bash

# Production startup script for TodoWeb

echo "🚀 Starting TodoWeb in Production Mode..."
echo "========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one from env.example"
    echo "   cp env.example .env"
    echo "   # Edit .env with your production values"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check for required environment variables
required_vars=("MYSQL_ROOT_PASSWORD" "MYSQL_PASSWORD" "SECRET_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

echo "📦 Building and starting production services..."
docker-compose -f ../docker/docker-compose.prod.yml up --build -d

echo "✅ TodoWeb is running in production mode!"
echo "🌐 Application: https://localhost"
echo "🔧 Backend API: https://localhost/api"
echo "📚 API Docs: https://localhost/api/docs"

# Show running containers
echo ""
echo "📋 Running containers:"
docker-compose -f ../docker/docker-compose.prod.yml ps

