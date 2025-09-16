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
docker run -d --name todoweb_mysql -e MYSQL_ROOT_PASSWORD=todoweb_root_password_123 -e MYSQL_DATABASE=todoweb -e MYSQL_USER=todoweb_user -e MYSQL_PASSWORD=todoweb_password_123 -p 3306:3306 mysql:8.0

echo Waiting for MySQL to start...
timeout /t 15 /nobreak

echo Starting Backend API...
start "Backend API" cmd /k "cd backend && set DATABASE_URL=mysql+pymysql://todoweb_user:todoweb_password_123@localhost:3306/todoweb && set SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-12345 && set ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80,http://127.0.0.1:3000 && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

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
