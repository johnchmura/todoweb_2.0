@echo off
echo Starting TodoWeb Backend with MySQL...
echo ========================================

REM Set environment variables for MySQL
set DATABASE_URL=mysql+pymysql://todoweb_user:todoweb_password_123@localhost:3306/todoweb
set SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-12345
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

