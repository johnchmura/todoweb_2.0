@echo off
echo Starting TodoWeb 2.0...
echo.
echo Installing dependencies...
call npm run setup
echo.
echo Starting development servers...
call npm run dev
pause

