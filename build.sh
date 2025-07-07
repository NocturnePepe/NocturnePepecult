#!/bin/bash
# Build script for Vercel deployment

echo "🌙 NocturneSwap Build Script"
echo "=========================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found, trying python..."
    if ! command -v python &> /dev/null; then
        echo "❌ Python not available"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Using $PYTHON_CMD"

# Check if dev.html exists
if [ ! -f "frontend/dev.html" ]; then
    echo "❌ frontend/dev.html not found"
    exit 1
fi

echo "✅ Source file found"

# Create build directory
if [ -d "build" ]; then
    rm -rf build
fi
mkdir -p build

# Copy dev.html to build/index.html
cp frontend/dev.html build/index.html

echo "✅ Build complete!"
echo "📁 Output: build/index.html"
echo "🌐 Ready for deployment!"
