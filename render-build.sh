#!/bin/bash

# Render Build Script for Royal Vietnam Business Management
# This script handles the complete build process for Render deployment

echo "🚀 Starting Render build process..."

# Set Node.js environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Build frontend
echo "🎨 Building frontend..."
npm run build

# Verify build output
echo "✅ Verifying build output..."
if [ -d "dist" ]; then
    echo "✅ Frontend build successful"
    ls -la dist/
else
    echo "❌ Frontend build failed"
    exit 1
fi

if [ -f "dist/index.js" ]; then
    echo "✅ Server build successful"
else
    echo "❌ Server build failed"
    exit 1
fi

echo "🎉 Build process completed successfully!"