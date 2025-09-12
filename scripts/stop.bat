@echo off
echo 🛑 Stopping TodoWeb services...

REM Stop development services
docker-compose -f ../docker/docker-compose.yml down

REM Stop production services
docker-compose -f ../docker/docker-compose.prod.yml down

echo ✅ All TodoWeb services stopped!
pause

