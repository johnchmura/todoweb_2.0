# TodoWeb Docker Setup

This document provides comprehensive instructions for running TodoWeb using Docker and Docker Compose.

## 🐳 Quick Start

### Prerequisites

- Docker (20.10+)
- Docker Compose (2.0+)
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd todoweb_2.0
```

### 2. Configure Environment

```bash
# Copy environment template
cp env.example .env

# Edit the .env file with your settings
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_root_password_here
MYSQL_DATABASE=todoweb
MYSQL_USER=todoweb_user
MYSQL_PASSWORD=your_secure_password_here

# Backend Configuration
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80

# Frontend Configuration
VITE_API_URL=http://localhost:8000
```

### 3. Start the Application

**Development Mode:**
```bash
# Using scripts (recommended)
./scripts/start-dev.sh    # Linux/Mac
scripts\start-dev.bat     # Windows

# Or manually
docker-compose up --build
```

**Production Mode:**
```bash
# Using scripts (recommended)
./scripts/start-prod.sh   # Linux/Mac
scripts\start-prod.bat    # Windows

# Or manually
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🏗️ Architecture

### Development Stack
- **Frontend**: React with Vite dev server (port 3000)
- **Backend**: FastAPI with hot reload (port 8000)
- **Database**: MySQL 8.0 (port 3306)
- **Networking**: Docker bridge network

### Production Stack
- **Frontend**: Nginx serving React build (port 80/443)
- **Backend**: FastAPI (internal port 8000)
- **Database**: MySQL 8.0 (internal port 3306)
- **Reverse Proxy**: Nginx with SSL termination
- **Networking**: Docker bridge network

## 📁 Project Structure

```
todoweb_2.0/
├── backend/
│   ├── Dockerfile              # Backend container
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── init.sql               # Database initialization
├── frontend/
│   ├── Dockerfile              # Production frontend
│   ├── Dockerfile.dev          # Development frontend
│   ├── nginx.conf              # Nginx configuration
│   └── src/                    # React source code
├── nginx/
│   └── nginx.conf              # Production reverse proxy
├── scripts/
│   ├── start-dev.sh/.bat       # Development startup
│   ├── start-prod.sh/.bat      # Production startup
│   ├── stop.sh/.bat            # Stop services
│   ├── backup-db.sh            # Database backup
│   └── restore-db.sh           # Database restore
├── docker-compose.yml          # Development compose
├── docker-compose.prod.yml     # Production compose
└── env.example                 # Environment template
```

## 🔧 Development

### Hot Reload Development

```bash
# Start with hot reload
docker-compose up --build

# Or use the development profile
docker-compose --profile dev up --build
```

**Access Points:**
- Frontend: http://localhost:3000 (with hot reload)
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database: localhost:3306

### Database Management

**Connect to MySQL:**
```bash
# Using Docker
docker exec -it todoweb_mysql mysql -u todoweb_user -p todoweb

# Using external client
mysql -h localhost -P 3306 -u todoweb_user -p todoweb
```

**Backup Database:**
```bash
./scripts/backup-db.sh
# Creates compressed backup in ./backups/
```

**Restore Database:**
```bash
./scripts/restore-db.sh ./backups/todoweb_backup_20231201_120000.sql.gz
```

## 🚀 Production Deployment

### 1. SSL Certificate Setup

For production, you need SSL certificates:

```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificate (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem

# Or use Let's Encrypt (recommended for production)
# See: https://letsencrypt.org/
```

### 2. Production Environment

Update your `.env` file for production:

```env
# Production Configuration
MYSQL_ROOT_PASSWORD=very_secure_root_password
MYSQL_PASSWORD=very_secure_user_password
SECRET_KEY=very_secure_jwt_secret_key
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### 3. Deploy

```bash
# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔍 Monitoring and Maintenance

### Health Checks

```bash
# Check container health
docker ps

# Check application health
curl http://localhost/health

# Check API health
curl http://localhost/api/docs
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Production logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Updates

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up --build -d

# Or for production
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🛠️ Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Check what's using the port
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :3306

# Kill the process or change ports in docker-compose.yml
```

**2. Database Connection Issues**
```bash
# Check MySQL container
docker logs todoweb_mysql

# Check database connectivity
docker exec todoweb_mysql mysqladmin ping -h localhost
```

**3. Permission Issues (Linux/Mac)**
```bash
# Fix script permissions
chmod +x scripts/*.sh

# Fix Docker permissions
sudo usermod -aG docker $USER
# Log out and back in
```

**4. Windows Docker Issues**
```bash
# Ensure Docker Desktop is running
# Check WSL2 is enabled
# Restart Docker Desktop if needed
```

### Reset Everything

```bash
# Stop all services
docker-compose down
docker-compose -f docker-compose.prod.yml down

# Remove all containers and volumes
docker-compose down -v
docker-compose -f docker-compose.prod.yml down -v

# Remove all images
docker rmi $(docker images -q)

# Start fresh
docker-compose up --build
```

## 📊 Performance Tuning

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_uid ON users(uid);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_calendar_notes_user_id ON calendar_notes(user_id);
CREATE INDEX idx_calendar_notes_date ON calendar_notes(date);
```

### Resource Limits

Update `docker-compose.yml` to set resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

## 🔒 Security Considerations

1. **Change default passwords** in production
2. **Use strong SECRET_KEY** for JWT tokens
3. **Enable SSL/TLS** in production
4. **Regular security updates** for base images
5. **Database backups** on regular schedule
6. **Monitor logs** for suspicious activity

## 📈 Scaling

### Horizontal Scaling

```yaml
# Scale backend services
docker-compose up --scale backend=3

# Use load balancer (nginx) to distribute traffic
```

### Database Scaling

- Use MySQL master-slave replication
- Consider MySQL Cluster for high availability
- Implement database connection pooling

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure all required ports are available
4. Check Docker and Docker Compose versions
5. Review this documentation

For additional help, check the main README.md or create an issue in the repository.

