@echo off
setlocal

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Node.js is required. Install Node 18+ and try again.
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
)

echo Starting PixelMouse desktop mode...
call npm run dev:desktop
