#!/bin/bash

# Development startup script for TodoWeb

echo "Starting TodoWeb in Development Mode..."
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo ".env file not found. Creating from example..."
    cp env.example .env
    echo "Please edit .env file with your configuration before running again."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "Building and starting services..."
docker-compose -f ../docker/docker-compose.yml up --build

echo "TodoWeb is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Database: localhost:3306"

