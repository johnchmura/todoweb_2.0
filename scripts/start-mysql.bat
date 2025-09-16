@echo off
echo Starting MySQL container for TodoWeb...
echo ==========================================

REM Set environment variables
set MYSQL_ROOT_PASSWORD=todoweb_root_password_123
set MYSQL_DATABASE=todoweb
set MYSQL_USER=todoweb_user
set MYSQL_PASSWORD=todoweb_password_123

echo Starting MySQL container...
docker run -d ^
  --name todoweb_mysql ^
  -e MYSQL_ROOT_PASSWORD=%MYSQL_ROOT_PASSWORD% ^
  -e MYSQL_DATABASE=%MYSQL_DATABASE% ^
  -e MYSQL_USER=%MYSQL_USER% ^
  -e MYSQL_PASSWORD=%MYSQL_PASSWORD% ^
  -p 3306:3306 ^
  mysql:8.0

echo Waiting for MySQL to start...
timeout /t 10 /nobreak

echo MySQL container started!
echo Database: todoweb
echo User: todoweb_user
echo Password: todoweb_password_123
echo Port: 3306
echo.
echo Container status:
docker ps --filter name=todoweb_mysql

echo.
echo To connect to MySQL:
echo    docker exec -it todoweb_mysql mysql -u todoweb_user -p todoweb
echo.
echo To stop MySQL:
echo    docker stop todoweb_mysql
echo    docker rm todoweb_mysql
pause

