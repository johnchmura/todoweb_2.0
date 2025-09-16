# AWS Deployment Guide for TodoWeb 2.0

This guide explains how to deploy TodoWeb 2.0 to AWS using EC2, RDS, and S3.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   FastAPI       │    │   RDS MySQL     │
│   (EC2 + S3)    │◄──►│   (EC2)         │◄──►│   (RDS)         │
│   Port 80/443   │    │   Port 8000     │    │   Port 3306     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────►│   Nginx         │
                        │   (EC2)         │
                        │   Port 80/443   │
                        └─────────────────┘
```

## Prerequisites

### Required Tools
- **Terraform** (v1.5.0+)
- **AWS CLI** (v2.0+)
- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**

### AWS Account Setup
1. Create an AWS account
2. Create an IAM user with programmatic access
3. Attach the following policies:
   - `AmazonEC2FullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonS3FullAccess`
   - `AmazonECRFullAccess`
   - `IAMFullAccess`

### Required Secrets
Set these in your GitHub repository secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DB_PASSWORD` (MySQL root password)
- `SECRET_KEY` (JWT secret key)
- `EC2_SSH_KEY` (SSH private key for EC2 access)
- `SLACK_WEBHOOK` (optional, for notifications)

## Quick Deployment

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd todoweb_2.0
```

### 2. Configure Environment
```bash
cp env.example .env
# Edit .env with your AWS configuration
```

### 3. Deploy Infrastructure
```bash
cd aws/terraform
terraform init
terraform plan -var="db_password=YOUR_SECURE_PASSWORD"
terraform apply -var="db_password=YOUR_SECURE_PASSWORD"
```

### 4. Deploy Application
```bash
# The application will be automatically deployed via GitHub Actions
# Or deploy manually:
./scripts/deploy-to-aws.sh
```

## Manual Deployment Steps

### Step 1: Infrastructure Setup

1. **Create EC2 Key Pair**
   ```bash
   aws ec2 create-key-pair --key-name todoweb-key --query 'KeyMaterial' --output text > todoweb-key.pem
   chmod 400 todoweb-key.pem
   ```

2. **Deploy with Terraform**
   ```bash
   cd aws/terraform
   terraform init
   terraform plan -var="db_password=your-secure-password"
   terraform apply -var="db_password=your-secure-password"
   ```

3. **Note the outputs**
   ```bash
   terraform output
   # Save: ec2_public_ip, rds_endpoint, s3_bucket_name
   ```

### Step 2: Application Deployment

1. **SSH into EC2 instance**
   ```bash
   ssh -i todoweb-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
   ```

2. **Clone repository**
   ```bash
   git clone <your-repo-url>
   cd todoweb_2.0
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

4. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker/docker-compose.aws.yml up -d --build
   ```

### Step 3: Static Assets to S3

1. **Build frontend**
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name/ --delete
   ```

## Configuration

### Environment Variables

Create a `.env` file with these variables:

```bash
# Database Configuration
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=todoweb
MYSQL_USER=todoweb_user
MYSQL_PASSWORD=your_secure_password
MYSQL_HOST=your-rds-endpoint
MYSQL_PORT=3306

# Backend Configuration
SECRET_KEY=YOUR_SUPER_SECRET_JWT_KEY
ALLOWED_ORIGINS=http://your-ec2-ip,https://your-ec2-ip
DB_ECHO=false
DATABASE_URL=mysql+pymysql://todoweb_user:password@rds-endpoint:3306/todoweb

# Frontend Configuration
VITE_API_URL=http://your-ec2-ip/api

# AWS Configuration
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

### Terraform Variables

Edit `aws/terraform/terraform.tfvars`:

```hcl
aws_region = "us-east-1"
project_name = "todoweb"
instance_type = "t3.medium"
key_pair_name = "todoweb-key"
db_instance_class = "db.t3.micro"
db_name = "todoweb"
db_username = "todoweb_user"
db_password = "YOUR_SECURE_PASSWORD"
environment = "production"
```

## Monitoring and Maintenance

### Health Checks

1. **Application Health**
   ```bash
   curl http://your-ec2-ip/health
   ```

2. **API Health**
   ```bash
   curl http://your-ec2-ip/api/docs
   ```

3. **Database Health**
   ```bash
   # SSH into EC2 and run:
   docker exec -it mysql-container mysql -u root -p
   ```

### Logs

1. **Application Logs**
   ```bash
   docker-compose -f docker/docker-compose.aws.yml logs -f
   ```

2. **Nginx Logs**
   ```bash
   docker exec -it nginx-container tail -f /var/log/nginx/access.log
   ```

### Backup

1. **Database Backup**
   ```bash
   ./scripts/backup-db.sh
   ```

2. **S3 Backup**
   ```bash
   aws s3 sync s3://your-bucket-name/ ./backup/
   ```

## Scaling

### Horizontal Scaling

1. **Add more EC2 instances**
   ```bash
   # Update terraform configuration
   # Add load balancer
   ```

2. **Database Read Replicas**
   ```bash
   # Create RDS read replicas
   ```

### Vertical Scaling

1. **Increase EC2 instance size**
2. **Increase RDS instance class**
3. **Add CloudFront for CDN**

## Security

### SSL/TLS Setup

1. **Get SSL certificate**
   ```bash
   # Use AWS Certificate Manager
   # Or Let's Encrypt
   ```

2. **Update Nginx configuration**
   ```nginx
   server {
       listen 443 ssl;
       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;
       # ... rest of config
   }
   ```

### Security Groups

- **Web Security Group**: Ports 80, 443, 22
- **Database Security Group**: Port 3306 (from web SG only)

### IAM Policies

- Use least privilege principle
- Rotate access keys regularly
- Enable MFA for console access

## Troubleshooting

### Common Issues

1. **Application not starting**
   ```bash
   # Check logs
   docker-compose logs
   
   # Check environment variables
   cat .env
   ```

2. **Database connection issues**
   ```bash
   # Check RDS security groups
   # Verify connection string
   # Check network connectivity
   ```

3. **S3 upload issues**
   ```bash
   # Check AWS credentials
   # Verify bucket permissions
   # Check IAM policies
   ```

### Debug Commands

```bash
# Check container status
docker ps -a

# Check resource usage
docker stats

# Check network connectivity
docker exec -it backend-container ping rds-endpoint

# Check logs
docker logs container-name
```

## Cost Optimization

### EC2 Optimization
- Use Spot Instances for non-critical workloads
- Right-size instances based on usage
- Use Reserved Instances for predictable workloads

### RDS Optimization
- Use Aurora Serverless for variable workloads
- Enable automated backups
- Use read replicas for read-heavy workloads

### S3 Optimization
- Use S3 Intelligent Tiering
- Set up lifecycle policies
- Use CloudFront for content delivery

## Cleanup

To remove all AWS resources:

```bash
cd aws/terraform
terraform destroy -var="db_password=your-password"
```

**Warning**: This will delete all resources including data!

## Support

For issues and questions:
- Check the logs first
- Review the troubleshooting section
- Create an issue in the repository
- Check AWS CloudWatch logs
