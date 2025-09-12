@echo off
echo 🛑 Stopping TodoWeb services...

REM Stop development services
docker-compose down

REM Stop production services
docker-compose -f docker-compose.prod.yml down

echo ✅ All TodoWeb services stopped!
pause

