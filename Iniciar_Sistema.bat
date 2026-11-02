@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
echo =========================================================
echo   SEGURCONTROL - Base de Datos de Vigilantes y Turnos
echo =========================================================
echo.
echo Iniciando servidor en http://localhost:3000 ...
start http://localhost:3000
npm run dev
pause

