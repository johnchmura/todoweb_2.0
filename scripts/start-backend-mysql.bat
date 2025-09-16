@echo off
echo Starting TodoWeb Backend with MySQL...
echo ========================================

REM Set environment variables for MySQL
set DATABASE_URL=mysql+pymysql://%MYSQL_USER%:%MYSQL_PASSWORD%@localhost:3306/%MYSQL_DATABASE%
set SECRET_KEY=%SECRET_KEY%
set ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80,http://127.0.0.1:3000
set DB_ECHO=false

echo Installing Python dependencies...
cd backend
pip install -r requirements.txt

echo.
echo Starting FastAPI backend...
echo Backend will be available at: http://localhost:8000
echo API docs will be available at: http://localhost:8000/docs
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause

