@echo off
echo 🚀 Starting TodoWeb in Development Mode...
echo ==========================================

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found. Creating from example...
    copy env.example .env
    echo 📝 Please edit .env file with your configuration before running again.
    pause
    exit /b 1
)

echo 📦 Building and starting services...
docker-compose up --build

echo ✅ TodoWeb is running!
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo 🗄️  Database: localhost:3306
pause

