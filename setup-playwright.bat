@echo off
echo Installing Playwright and browsers...
npm install -D @playwright/test
npx playwright install

echo Checking for version mismatch...
set PLAYWRIGHT_DIR=C:\Users\User\AppData\Local\ms-playwright

for /d %%i in ("%PLAYWRIGHT_DIR%\chromium-*") do (
    set INSTALLED_VERSION=%%~nxi
    goto :found
)

:found
echo Found installed version: %INSTALLED_VERSION%

REM Check if expected version exists, if not copy from installed
if not exist "%PLAYWRIGHT_DIR%\chromium-1179" (
    echo Creating symlink for version compatibility...
    xcopy "%PLAYWRIGHT_DIR%\%INSTALLED_VERSION%" "%PLAYWRIGHT_DIR%\chromium-1179" /E /I /Q
    echo Version compatibility fixed!
)

echo Playwright MCP ready to use!
pause