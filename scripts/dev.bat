@echo off
echo 🚀 Starting TBAT Mock Exam Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.dev.yml down

REM Remove orphaned containers  
echo 🧹 Cleaning up orphaned containers...
docker-compose -f docker-compose.dev.yml down --remove-orphans

REM Start development environment
echo 🐳 Starting development containers...
docker-compose -f docker-compose.dev.yml up --build

echo ✅ Development environment started!
echo 🌐 Web App: http://localhost:3000
echo 📚 Docs App: http://localhost:3001
echo 🗄️  Database: localhost:5432  
echo 📦 Redis: localhost:6379