#!/bin/bash

# TBAT Mock Exam - Development Environment Startup Script

echo "🚀 Starting TBAT Mock Exam Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Remove orphaned containers
echo "🧹 Cleaning up orphaned containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans

# Start development environment
echo "🐳 Starting development containers..."
docker-compose -f docker-compose.dev.yml up --build

echo "✅ Development environment started!"
echo "🌐 Web App: http://localhost:3000"
echo "📚 Docs App: http://localhost:3001"
echo "🗄️  Database: localhost:5432"
echo "📦 Redis: localhost:6379"