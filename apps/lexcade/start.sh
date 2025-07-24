#!/bin/bash

# Lexcade Production Startup Script
echo "🚀 Starting Lexcade on port 3000..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Start the application
echo "🌟 Starting Lexcade in production mode on port 3000..."
npm run start