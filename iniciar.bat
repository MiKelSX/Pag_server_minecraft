@echo off
REM ============================================
REM Script de Inicio - Servidor de Votos UFT
REM ============================================

echo.
echo ========================================
echo  Servidor de Votos - Minecraft UFT
echo ========================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no está instalado o no está en PATH
    echo Descargar desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si package.json existe
if not exist "package.json" (
    echo [ERROR] archivo package.json no encontrado
    echo Asegúrate de estar en el directorio correcto
    pause
    exit /b 1
)

REM Instalar dependencias si node_modules no existe
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error durante la instalación de dependencias
        pause
        exit /b 1
    )
)

REM Iniciar servidor
echo.
echo [INFO] Iniciando servidor...
echo.
call npm start

pause
