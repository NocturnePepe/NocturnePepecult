#!/bin/bash
# Test the production build

echo "🧪 Testing Production Build"
echo "=========================="

# Build the project
echo "1. Building project..."
./build.sh

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Check if build output exists
if [ ! -f "build/index.html" ]; then
    echo "❌ Build output not found!"
    exit 1
fi

# Check file size
FILE_SIZE=$(du -h build/index.html | cut -f1)
echo "✅ Build output: build/index.html ($FILE_SIZE)"

# Check for critical content
if grep -q "NocturneSwap" build/index.html; then
    echo "✅ Title check passed"
else
    echo "❌ Title check failed"
    exit 1
fi

if grep -q "React.createElement" build/index.html; then
    echo "✅ React components found"
else
    echo "❌ React components not found"
    exit 1
fi

# Start test server
echo "🚀 Starting test server on port 8080..."
echo "   Open: http://localhost:8080"
echo "   Press Ctrl+C to stop"

cd build && python3 -m http.server 8080
