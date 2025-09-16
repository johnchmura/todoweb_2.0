#!/bin/bash

# Stop TodoWeb services

echo "Stopping TodoWeb services..."

# Stop development services
docker-compose -f ../docker/docker-compose.yml down

# Stop production services
docker-compose -f ../docker/docker-compose.prod.yml down

echo "All TodoWeb services stopped!"

