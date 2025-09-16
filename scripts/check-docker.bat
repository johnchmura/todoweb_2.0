@echo off
echo Checking Docker installation...
echo =================================

docker --version
if %errorlevel% neq 0 (
    echo Docker is not installed or not in PATH
    echo.
    echo Please install Docker Desktop:
    echo    1. Go to https://www.docker.com/products/docker-desktop/
    echo    2. Download Docker Desktop for Windows
    echo    3. Install and restart your computer
    echo    4. Start Docker Desktop
    echo    5. Run this script again
    echo.
    pause
    exit /b 1
)

echo Docker is installed!
echo.

echo Checking if Docker is running...
docker ps
if %errorlevel% neq 0 (
    echo Docker is not running
    echo.
    echo Please start Docker Desktop:
    echo    1. Open Docker Desktop from Start menu
    echo    2. Wait for it to fully start (green icon in system tray)
    echo    3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Docker is running!
echo.
echo You're ready to start MySQL and the backend!
echo.
echo Next steps:
echo 1. Run: start-mysql.bat
echo 2. Wait for MySQL to start (about 30 seconds)
echo 3. Run: start-backend-mysql.bat
echo.
pause

