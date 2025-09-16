@echo off
echo Starting TodoWeb in Production Mode...
echo =========================================

REM Check if .env file exists
if not exist .env (
    echo .env file not found. Please create one from env.example
    echo    copy env.example .env
    echo    # Edit .env with your production values
    pause
    exit /b 1
)

echo Building and starting production services...
docker-compose -f ../docker/docker-compose.prod.yml up --build -d

echo TodoWeb is running in production mode!
echo Application: https://localhost
echo Backend API: https://localhost/api
echo API Docs: https://localhost/api/docs

echo.
echo Running containers:
docker-compose -f ../docker/docker-compose.prod.yml ps
pause

