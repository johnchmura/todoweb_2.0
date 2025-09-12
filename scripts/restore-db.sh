#!/bin/bash

# Database restore script for TodoWeb

if [ $# -eq 0 ]; then
    echo "❌ Please provide a backup file path"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Example: $0 ./backups/todoweb_backup_20231201_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring database from backup..."
echo "📁 Backup file: $BACKUP_FILE"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set default values if not provided
MYSQL_DATABASE=${MYSQL_DATABASE:-todoweb}
MYSQL_USER=${MYSQL_USER:-todoweb_user}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-todoweb_password}

# Check if file is compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "🗜️  Decompressing backup file..."
    gunzip -c "$BACKUP_FILE" | docker exec -i todoweb_mysql mysql \
        -u $MYSQL_USER \
        -p$MYSQL_PASSWORD \
        $MYSQL_DATABASE
else
    echo "📦 Restoring uncompressed backup file..."
    docker exec -i todoweb_mysql mysql \
        -u $MYSQL_USER \
        -p$MYSQL_PASSWORD \
        $MYSQL_DATABASE < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
else
    echo "❌ Database restore failed!"
    exit 1
fi

