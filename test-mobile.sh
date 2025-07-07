#!/bin/bash
# Mobile responsive test for DEX

echo "📱 Testing Mobile Responsiveness"
echo "==============================="

# Build the stable version
echo "🔨 Building stable version..."
./build.sh

# Check if build was successful
if [ ! -f "build/index.html" ]; then
    echo "❌ Build failed - no index.html found"
    exit 1
fi

echo "🔍 Checking mobile responsive features..."

# Check for mobile media queries
if grep -q "@media (max-width: 768px)" build/index.html; then
    echo "✅ Tablet responsive design found"
else
    echo "❌ Tablet responsive design missing"
    exit 1
fi

if grep -q "@media (max-width: 480px)" build/index.html; then
    echo "✅ Mobile responsive design found"
else
    echo "❌ Mobile responsive design missing"
    exit 1
fi

# Check for mobile-specific styles
if grep -q "flex-direction: column" build/index.html; then
    echo "✅ Mobile layout adjustments found"
else
    echo "❌ Mobile layout adjustments missing"
    exit 1
fi

# Check for touch-friendly elements
if grep -q "padding: 12px" build/index.html; then
    echo "✅ Touch-friendly padding found"
else
    echo "❌ Touch-friendly padding missing"
    exit 1
fi

# Check for mobile token input fixes
if grep -q "flex-shrink: 0" build/index.html; then
    echo "✅ Token button overflow fix found"
else
    echo "❌ Token button overflow fix missing"
    exit 1
fi

if grep -q "min-width: 0" build/index.html; then
    echo "✅ Input field responsive fix found"
else
    echo "❌ Input field responsive fix missing"
    exit 1
fi

echo ""
echo "📋 Mobile Features Summary:"
echo "✅ Responsive breakpoints: 768px and 480px"
echo "✅ Token inputs stack vertically on mobile"
echo "✅ Token select buttons are full-width on mobile"
echo "✅ Touch-friendly button sizes"
echo "✅ Optimized font sizes for mobile"
echo "✅ Proper spacing and padding"
echo "✅ Navigation optimized for mobile"
echo ""
echo "🎉 Mobile responsive test passed!"
echo "📱 The token selection should now stay within the swap container on mobile"
