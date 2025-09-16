#!/bin/bash

# Database backup script for TodoWeb

echo "Creating database backup..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set default values if not provided
MYSQL_DATABASE=${MYSQL_DATABASE}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
BACKUP_DIR=${BACKUP_DIR:-./backups}

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/todoweb_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "Backing up database: $MYSQL_DATABASE"
echo "Backup file: $BACKUP_FILE"

# Create backup using mysqldump
docker exec todoweb_mysql mysqldump \
    -u $MYSQL_USER \
    -p$MYSQL_PASSWORD \
    --single-transaction \
    --routines \
    --triggers \
    $MYSQL_DATABASE > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Database backup created successfully!"
    echo "Location: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "Backup compressed: ${BACKUP_FILE}.gz"
else
    echo "Database backup failed!"
    exit 1
fi

