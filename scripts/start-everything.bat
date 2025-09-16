@echo off
echo Starting TodoWeb - Full Stack Application
echo ===========================================
echo.

echo Starting services in order:
echo    1. MySQL Database (Docker)
echo    2. Backend API (Python)
echo    3. Frontend (Node.js)
echo.

echo Starting MySQL database...
docker run -d --name todoweb_mysql -e MYSQL_ROOT_PASSWORD=%MYSQL_ROOT_PASSWORD% -e MYSQL_DATABASE=%MYSQL_DATABASE% -e MYSQL_USER=%MYSQL_USER% -e MYSQL_PASSWORD=%MYSQL_PASSWORD% -p 3306:3306 mysql:8.0

echo Waiting for MySQL to start...
timeout /t 15 /nobreak

echo Starting Backend API...
start "Backend API" cmd /k "cd backend && set DATABASE_URL=mysql+pymysql://%MYSQL_USER%:%MYSQL_PASSWORD%@localhost:3306/%MYSQL_DATABASE% && set SECRET_KEY=%SECRET_KEY% && set ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80,http://127.0.0.1:3000 && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 5 /nobreak

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo TodoWeb is starting up!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Database: localhost:3306
echo.
echo Note: Each service runs in its own window
echo    Close the windows to stop the services
echo.
echo Opening application in browser...
timeout /t 3 /nobreak
start http://localhost:3000

echo.
echo Press any key to exit this script (services will keep running)
pause >nul
