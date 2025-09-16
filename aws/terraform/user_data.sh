#!/bin/bash

# User data script for TodoWeb 2.0 EC2 instance
# This script sets up Docker, pulls the application, and starts the services

set -e

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Install Git
yum install -y git

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Create application directory
mkdir -p /opt/todoweb
cd /opt/todoweb

# Clone the repository
# git clone https://github.com/YOUR_USERNAME/todoweb_2.0.git .

# For now, we'll create the necessary files
mkdir -p docker

# Create production environment file
cat > .env << EOF
# Database Configuration
MYSQL_ROOT_PASSWORD=${db_password}
MYSQL_DATABASE=${db_name}
MYSQL_USER=${db_username}
MYSQL_PASSWORD=${db_password}
MYSQL_HOST=${db_endpoint}
MYSQL_PORT=3306

# Backend Configuration
SECRET_KEY=${SECRET_KEY}
ALLOWED_ORIGINS=http://${aws_eip.web.public_ip},https://${aws_eip.web.public_ip}
DB_ECHO=false
DATABASE_URL=mysql+pymysql://${db_username}:${db_password}@${db_endpoint}:3306/${db_name}

# Frontend Configuration
VITE_API_URL=http://${aws_eip.web.public_ip}/api

# S3 Configuration
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_REGION=us-east-1
S3_BUCKET_NAME=${s3_bucket}
EOF

# Create production Docker Compose file
cat > docker/docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - DB_ECHO=${DB_ECHO}
    volumes:
      - ../backend:/app
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import requests; requests.get('http://localhost:8000/docs')"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    environment:
      - VITE_API_URL=${VITE_API_URL}
    volumes:
      - ../frontend:/app
    restart: unless-stopped
EOF

# Create Nginx configuration
cat > docker/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:80;
    }

    server {
        listen 80;
        server_name _;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api {
            rewrite ^/api(.*)$ $1 break;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Set proper permissions
chown -R ec2-user:ec2-user /opt/todoweb

# Start the application
cd /opt/todoweb
docker-compose -f docker/docker-compose.prod.yml up -d --build

# Create a simple health check script
cat > /opt/todoweb/health_check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost/health || exit 1
EOF

chmod +x /opt/todoweb/health_check.sh

# Add to crontab for health monitoring
echo "*/5 * * * * /opt/todoweb/health_check.sh" | crontab -u ec2-user -

echo "TodoWeb 2.0 deployment completed successfully!"
echo "Application URL: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
