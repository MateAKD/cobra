@echo off
echo ===================================================
echo PREPARING HOSTINGER DEPLOYMENT PACKAGE
echo ===================================================

echo 1. Cleaning previous builds...
rmdir /s /q .next
rmdir /s /q out

echo 2. Building Next.js App (Standalone Mode)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo BUILD FAILED! Please fix errors and try again.
    pause
    exit /b %ERRORLEVEL%
)

echo 3. Copying Static Assets...
echo Copying Public folder...
xcopy /E /I /Y "public" ".next\standalone\public"

echo Copying .next/static folder...
mkdir ".next\standalone\.next\static"
xcopy /E /I /Y ".next\static" ".next\standalone\.next\static"

echo ===================================================
echo SUCCESS! Your Hostinger package is ready.
echo ===================================================
echo LOCATION: .next\standalone
echo.
echo INSTRUCTIONS:
echo 1. Go to the folder: .next\standalone
echo 2. Select ALL files inside (including .next, public, server.js)
echo 3. Zip them into "deploy.zip"
echo 4. Upload "deploy.zip" to Hostinger (public_html)
echo 5. Extract it there.
echo 6. Follow the HOSTINGER-GUIDE.md for the rest.
echo.
pause
