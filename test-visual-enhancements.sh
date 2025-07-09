#!/bin/bash

# 🌙 NOCTURNE SWAP - VISUAL ENHANCEMENTS TEST SCRIPT

echo "🌙 Testing NocturneSwap Visual Enhancements..."
echo "============================================="

# Check if all files exist
echo "📁 Checking file structure..."

files_to_check=(
    "build/index.html"
    "build/static/css/main.css"
    "build/static/css/mobile-enhancements.css"
    "build/static/js/main.js"
    "build/static/js/advanced-visuals.js"
    "build/manifest.json"
    "build/sw.js"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file - Found"
    else
        echo "❌ $file - Missing"
    fi
done

echo ""
echo "🎨 Checking CSS enhancements..."

# Check for key CSS features
css_features=(
    "holographic"
    "card-3d"
    "magical-float"
    "neon-glow"
    "mystical-border"
    "quantum-field"
    "mobile-particles"
)

for feature in "${css_features[@]}"; do
    if grep -q "$feature" build/static/css/main.css build/static/css/mobile-enhancements.css 2>/dev/null; then
        echo "✅ $feature - Implemented"
    else
        echo "❌ $feature - Missing"
    fi
done

echo ""
echo "⚡ Checking JavaScript enhancements..."

# Check for key JS features
js_features=(
    "AdvancedVisualEffects"
    "createWebGLParticles"
    "initCursorTrail"
    "createRippleEffect"
    "DOMEffects"
)

for feature in "${js_features[@]}"; do
    if grep -q "$feature" build/static/js/advanced-visuals.js 2>/dev/null; then
        echo "✅ $feature - Implemented"
    else
        echo "❌ $feature - Missing"
    fi
done

echo ""
echo "📱 Checking mobile optimizations..."

# Check mobile-specific features
mobile_features=(
    "mobile-nav-enhanced"
    "mobile-card"
    "mobile-particles"
    "safe-area-inset"
)

for feature in "${mobile_features[@]}"; do
    if grep -q "$feature" build/static/css/mobile-enhancements.css 2>/dev/null; then
        echo "✅ $feature - Implemented"
    else
        echo "❌ $feature - Missing"
    fi
done

echo ""
echo "🔍 Analyzing file sizes..."

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "📊 $file - $size"
    fi
done

echo ""
echo "🚀 Performance analysis..."

# Check for performance optimizations
perf_checks=(
    "prefers-reduced-motion"
    "will-change"
    "backface-visibility"
    "animation-duration"
)

for check in "${perf_checks[@]}"; do
    if grep -q "$check" build/static/css/*.css 2>/dev/null; then
        echo "✅ $check - Optimized"
    else
        echo "⚠️  $check - Not found"
    fi
done

echo ""
echo "🌙 Visual Enhancement Test Complete!"
echo "======================================"

# Quick server test if available
if command -v python3 &> /dev/null; then
    echo ""
    echo "🌐 Starting test server on http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    cd build && python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo ""
    echo "🌐 Starting test server on http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    cd build && python -m SimpleHTTPServer 8000
else
    echo ""
    echo "💡 To test the enhancements:"
    echo "   1. Navigate to the /build directory"
    echo "   2. Start a local web server"
    echo "   3. Open index.html in a browser"
    echo ""
    echo "Example commands:"
    echo "   cd build && python3 -m http.server 8000"
    echo "   cd build && npx serve ."
    echo "   cd build && php -S localhost:8000"
fi
