"""
AWS S3 Service for TodoWeb 2.0
Handles static asset uploads and management
"""

import boto3
import os
from botocore.exceptions import ClientError
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME')
        
    def upload_file(self, file_path: str, s3_key: str, content_type: str = None) -> bool:
        """
        Upload a file to S3
        
        Args:
            file_path: Local path to the file
            s3_key: S3 key (path) for the file
            content_type: MIME type of the file
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
                
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name, 
                s3_key,
                ExtraArgs=extra_args
            )
            logger.info(f"Successfully uploaded {file_path} to s3://{self.bucket_name}/{s3_key}")
            return True
            
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error uploading file: {e}")
            return False
    
    def upload_file_object(self, file_obj, s3_key: str, content_type: str = None) -> bool:
        """
        Upload a file object to S3
        
        Args:
            file_obj: File-like object
            s3_key: S3 key (path) for the file
            content_type: MIME type of the file
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
                
            self.s3_client.upload_fileobj(
                file_obj,
                self.bucket_name,
                s3_key,
                ExtraArgs=extra_args
            )
            logger.info(f"Successfully uploaded file object to s3://{self.bucket_name}/{s3_key}")
            return True
            
        except ClientError as e:
            logger.error(f"Error uploading file object to S3: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error uploading file object: {e}")
            return False
    
    def delete_file(self, s3_key: str) -> bool:
        """
        Delete a file from S3
        
        Args:
            s3_key: S3 key (path) of the file to delete
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            logger.info(f"Successfully deleted s3://{self.bucket_name}/{s3_key}")
            return True
            
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting file: {e}")
            return False
    
    def list_files(self, prefix: str = "") -> List[str]:
        """
        List files in S3 bucket with optional prefix
        
        Args:
            prefix: S3 key prefix to filter files
            
        Returns:
            List[str]: List of S3 keys
        """
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            files = []
            if 'Contents' in response:
                files = [obj['Key'] for obj in response['Contents']]
                
            return files
            
        except ClientError as e:
            logger.error(f"Error listing files from S3: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error listing files: {e}")
            return []
    
    def get_file_url(self, s3_key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for a file
        
        Args:
            s3_key: S3 key (path) of the file
            expiration: URL expiration time in seconds
            
        Returns:
            str: Presigned URL or None if error
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return url
            
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error generating URL: {e}")
            return None
    
    def sync_directory(self, local_dir: str, s3_prefix: str = "") -> bool:
        """
        Sync a local directory to S3
        
        Args:
            local_dir: Local directory path
            s3_prefix: S3 prefix for uploaded files
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            import os
            from pathlib import Path
            
            local_path = Path(local_dir)
            if not local_path.exists():
                logger.error(f"Local directory {local_dir} does not exist")
                return False
            
            success_count = 0
            total_count = 0
            
            for file_path in local_path.rglob('*'):
                if file_path.is_file():
                    total_count += 1
                    relative_path = file_path.relative_to(local_path)
                    s3_key = f"{s3_prefix}/{relative_path}".replace('\\', '/')
                    
                    # Determine content type based on file extension
                    content_type = self._get_content_type(file_path.suffix)
                    
                    if self.upload_file(str(file_path), s3_key, content_type):
                        success_count += 1
            
            logger.info(f"Synced {success_count}/{total_count} files to S3")
            return success_count == total_count
            
        except Exception as e:
            logger.error(f"Error syncing directory to S3: {e}")
            return False
    
    def _get_content_type(self, file_extension: str) -> str:
        """
        Get MIME type based on file extension
        
        Args:
            file_extension: File extension (e.g., '.html', '.css')
            
        Returns:
            str: MIME type
        """
        content_types = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
        }
        
        return content_types.get(file_extension.lower(), 'application/octet-stream')

# Global S3 service instance
s3_service = S3Service()
