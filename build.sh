#!/bin/bash
# Build script for Vercel deployment

echo "🌙 NocturneSwap Build Script"
echo "=========================="

# Check if source file exists (try multiple versions)
if [ -f "frontend/index.html" ]; then
    SOURCE_FILE="frontend/index.html"
    echo "✅ Using frontend/index.html (selected version)"
elif [ -f "frontend/index-professional.html" ]; then
    SOURCE_FILE="frontend/index-professional.html"
    echo "✅ Using frontend/index-professional.html (professional version)"
elif [ -f "frontend/index-stable.html" ]; then
    SOURCE_FILE="frontend/index-stable.html"
    echo "✅ Using frontend/index-stable.html (stable version)"
elif [ -f "frontend/index-wallet.html" ]; then
    SOURCE_FILE="frontend/index-wallet.html"
    echo "✅ Using frontend/index-wallet.html (wallet version)"
elif [ -f "frontend/index-simple.html" ]; then
    SOURCE_FILE="frontend/index-simple.html"
    echo "✅ Using frontend/index-simple.html (simple version)"
elif [ -f "frontend/dev.html" ]; then
    SOURCE_FILE="frontend/dev.html"
    echo "✅ Using frontend/dev.html (dev version)"
else
    echo "❌ No source file found"
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
