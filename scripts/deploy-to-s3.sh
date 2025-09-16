#!/bin/bash

# Deploy static assets to S3 for TodoWeb 2.0
# This script builds the frontend and uploads assets to S3

set -e

echo "🚀 Starting S3 deployment for TodoWeb 2.0..."

# Check if required environment variables are set
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$S3_BUCKET_NAME" ]; then
    echo "❌ Error: Required environment variables not set"
    echo "Please set: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI is not installed"
    echo "Please install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

echo "📤 Uploading to S3..."

# Sync dist directory to S3
aws s3 sync dist/ s3://$S3_BUCKET_NAME/ \
    --delete \
    --cache-control "max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json"

# Upload HTML files with shorter cache
aws s3 sync dist/ s3://$S3_BUCKET_NAME/ \
    --cache-control "max-age=0, no-cache, no-store, must-revalidate" \
    --include "*.html" \
    --include "*.json"

# Set proper content types
aws s3 cp s3://$S3_BUCKET_NAME/ s3://$S3_BUCKET_NAME/ \
    --recursive \
    --metadata-directive REPLACE \
    --exclude "*" \
    --include "*.css" \
    --content-type "text/css"

aws s3 cp s3://$S3_BUCKET_NAME/ s3://$S3_BUCKET_NAME/ \
    --recursive \
    --metadata-directive REPLACE \
    --exclude "*" \
    --include "*.js" \
    --content-type "application/javascript"

aws s3 cp s3://$S3_BUCKET_NAME/ s3://$S3_BUCKET_NAME/ \
    --recursive \
    --metadata-directive REPLACE \
    --exclude "*" \
    --include "*.png" \
    --content-type "image/png"

aws s3 cp s3://$S3_BUCKET_NAME/ s3://$S3_BUCKET_NAME/ \
    --recursive \
    --metadata-directive REPLACE \
    --exclude "*" \
    --include "*.jpg" \
    --include "*.jpeg" \
    --content-type "image/jpeg"

aws s3 cp s3://$S3_BUCKET_NAME/ s3://$S3_BUCKET_NAME/ \
    --recursive \
    --metadata-directive REPLACE \
    --exclude "*" \
    --include "*.svg" \
    --content-type "image/svg+xml"

# Enable website hosting
aws s3 website s3://$S3_BUCKET_NAME \
    --index-document index.html \
    --error-document error.html

# Get website URL
WEBSITE_URL="http://$S3_BUCKET_NAME.s3-website-$AWS_DEFAULT_REGION.amazonaws.com"

echo "✅ Deployment completed successfully!"
echo "🌐 Website URL: $WEBSITE_URL"
echo "📊 S3 Bucket: s3://$S3_BUCKET_NAME"

# Optional: Invalidate CloudFront cache if using CloudFront
if [ ! -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "🔄 Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*"
    echo "✅ CloudFront cache invalidated"
fi

echo "🎉 TodoWeb 2.0 is now live on S3!"
