#!/bin/bash

# Stop TodoWeb services

echo "🛑 Stopping TodoWeb services..."

# Stop development services
docker-compose down

# Stop production services
docker-compose -f docker-compose.prod.yml down

echo "✅ All TodoWeb services stopped!"

