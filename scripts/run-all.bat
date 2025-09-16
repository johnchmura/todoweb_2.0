@echo off
echo Starting TodoWeb - Full Stack Application
echo ===========================================
echo.

echo What's included:
echo    - MySQL Database (Docker)
echo    - FastAPI Backend (Python)
echo    - React Frontend (Node.js)
echo.

echo Starting with Docker Compose...
docker-compose -f ../docker/docker-compose.yml up --build

echo.
echo TodoWeb is running!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Database: localhost:3306
echo.
echo Press Ctrl+C to stop all services
pause
