@echo off
echo Starting Duplicate App Remover Servers...
echo.

echo Starting Backend Server (Port 8080)...
cd backend
start "Backend Server" cmd /k "mvn spring-boot:run"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server (Port 5173)...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Servers are starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this script...
pause > nul 