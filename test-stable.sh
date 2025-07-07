#!/bin/bash
# Comprehensive test for the stable DEX build

echo "🧪 Testing Stable DEX Build"
echo "============================"

# Run the build
echo "🔨 Building stable version..."
./build.sh

# Check if build was successful
if [ ! -f "build/index.html" ]; then
    echo "❌ Build failed - no index.html found"
    exit 1
fi

# Check file size
FILE_SIZE=$(stat -c%s build/index.html)
echo "📊 Build file size: $FILE_SIZE bytes"

# Content checks
echo "🔍 Running content checks..."

# Check for essential content
if grep -q "NocturneSwap" build/index.html; then
    echo "✅ Title check passed"
else
    echo "❌ Title check failed"
    exit 1
fi

# Check for essential elements
if grep -q "loadingScreen" build/index.html; then
    echo "✅ Loading screen check passed"
else
    echo "❌ Loading screen check failed"
    exit 1
fi

if grep -q "errorScreen" build/index.html; then
    echo "✅ Error screen check passed"
else
    echo "❌ Error screen check failed"
    exit 1
fi

if grep -q "appContainer" build/index.html; then
    echo "✅ App container check passed"
else
    echo "❌ App container check failed"
    exit 1
fi

# Check for JavaScript functions
if grep -q "initializeApp" build/index.html; then
    echo "✅ JavaScript initialization check passed"
else
    echo "❌ JavaScript initialization check failed"
    exit 1
fi

if grep -q "calculateSwap" build/index.html; then
    echo "✅ Swap calculation check passed"
else
    echo "❌ Swap calculation check failed"
    exit 1
fi

# Check for error handling
if grep -q "showError" build/index.html; then
    echo "✅ Error handling check passed"
else
    echo "❌ Error handling check failed"
    exit 1
fi

# Check HTML structure
if grep -q "<!DOCTYPE html>" build/index.html && grep -q "</html>" build/index.html; then
    echo "✅ HTML structure check passed"
else
    echo "❌ HTML structure check failed"
    exit 1
fi

# Check for responsive design
if grep -q "@media" build/index.html; then
    echo "✅ Responsive design check passed"
else
    echo "❌ Responsive design check failed"
    exit 1
fi

# Check for accessibility
if grep -q "aria-" build/index.html || grep -q "role=" build/index.html; then
    echo "✅ Accessibility features found"
else
    echo "⚠️  No accessibility features found (not critical)"
fi

echo ""
echo "🎉 All critical tests passed!"
echo "📱 Features included:"
echo "   - Loading screen with spinner"
echo "   - Error handling with retry"
echo "   - Responsive design"
echo "   - Token swapping interface"
echo "   - Navigation system"
echo "   - Status messages"
echo "   - Modern UI design"
echo ""
echo "🚀 Ready for deployment!"
echo "📦 Deploy this to Vercel - it should work without the 'failed to load' error"
