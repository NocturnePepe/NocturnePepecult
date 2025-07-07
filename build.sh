#!/bin/bash
# Build script for Vercel deployment

echo "🌙 NocturneSwap Build Script"
echo "=========================="

# Check if source file exists (try multiple versions)
if [ -f "frontend/index.html" ]; then
    SOURCE_FILE="frontend/index.html"
    echo "✅ Using frontend/index.html (production version)"
elif [ -f "frontend/index-simple.html" ]; then
    SOURCE_FILE="frontend/index-simple.html"
    echo "✅ Using frontend/index-simple.html (simple version)"
elif [ -f "frontend/dev.html" ]; then
    SOURCE_FILE="frontend/dev.html"
    echo "✅ Using frontend/dev.html (dev version)"
else
    echo "❌ No source file found (frontend/index.html, frontend/index-simple.html, or frontend/dev.html)"
    exit 1
fi

# Create build directory
if [ -d "build" ]; then
    rm -rf build
fi
mkdir -p build

# Copy source file to build/index.html
cp "$SOURCE_FILE" build/index.html

echo "✅ Build complete!"
echo "📁 Output: build/index.html"
echo "📊 File size: $(du -h build/index.html | cut -f1)"
echo "🌐 Ready for deployment!"
