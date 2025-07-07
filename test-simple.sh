#!/bin/bash
# Test script for production build

echo "🧪 Testing Production Build"
echo "=========================="

# Run the build
echo "🔨 Building..."
bash build.sh

# Check if build was successful
if [ ! -f "build/index.html" ]; then
    echo "❌ Build failed - no index.html found"
    exit 1
fi

# Check file size
FILE_SIZE=$(stat -c%s build/index.html)
echo "📊 Build file size: $FILE_SIZE bytes"

# Check if file contains expected content
if grep -q "NocturneSwap" build/index.html; then
    echo "✅ Content check passed"
else
    echo "❌ Content check failed"
    exit 1
fi

# Test if HTML is valid (basic check)
if grep -q "<!DOCTYPE html>" build/index.html && grep -q "</html>" build/index.html; then
    echo "✅ HTML structure check passed"
else
    echo "❌ HTML structure check failed"
    exit 1
fi

echo "✅ All tests passed!"
echo "🚀 Ready for deployment!"
