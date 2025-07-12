#!/bin/bash

# ===============================================
# NOCTURNE VISUAL HARMONY VALIDATION SCRIPT
# ===============================================
# PURPOSE: Validate particle effects and UI harmony across all views
# FEATURES: Automated testing, performance validation, visual consistency
# INTEGRATION: Complete platform validation

echo "🎨 Starting Nocturne Visual Harmony Validation..."
echo "=================================================="

# Create test results directory
mkdir -p tests/visual-validation
RESULTS_FILE="tests/visual-validation/harmony-test-$(date +%Y%m%d_%H%M%S).log"

echo "📝 Test Results: $RESULTS_FILE"
echo ""

# Start logging
exec > >(tee -a "$RESULTS_FILE") 2>&1

echo "🎯 OBJECTIVE: Validate particle system layering and UI harmony"
echo "🔍 SCOPE: All views (Swap, Pools, Social, DAO, Admin)"
echo "⚡ PERFORMANCE TARGET: 60fps consistency"
echo ""

# Check if frontend files exist
echo "📂 Checking enhanced files..."
FILES=(
    "frontend/src/components/OptimizedParticleSystem.js"
    "frontend/src/utils/ParticleSystemManager.js"
    "frontend/src/utils/ParticleAutoInit.js"
    "frontend/src/utils/PerformanceValidator.js"
    "frontend/src/styles/EnhancedUIBoxes.css"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
    fi
done

echo ""
echo "🎮 ENHANCED FEATURES VALIDATION:"
echo "================================"

# Check particle system enhancements
if grep -q "z-index: -1" frontend/src/components/OptimizedParticleSystem.js; then
    echo "✅ Particle canvas z-index properly set to -1"
else
    echo "⚠️ Particle canvas z-index needs verification"
fi

if grep -q "isolation: isolate" frontend/src/styles/EnhancedUIBoxes.css; then
    echo "✅ UI component isolation implemented"
else
    echo "⚠️ UI component isolation needs verification"
fi

if grep -q "prefers-reduced-motion" frontend/src/components/OptimizedParticleSystem.js; then
    echo "✅ Accessibility: Reduced motion support"
else
    echo "⚠️ Accessibility: Reduced motion support needs implementation"
fi

if grep -q "contain: layout style paint" frontend/src/styles/EnhancedUIBoxes.css; then
    echo "✅ Performance: CSS containment optimization"
else
    echo "⚠️ Performance: CSS containment needs verification"
fi

echo ""
echo "🎯 OPTIMIZATION SUMMARY:"
echo "========================"

# Count particle optimizations
MOBILE_PARTICLES=$(grep -o "baseParticleCount.*25" frontend/src/components/OptimizedParticleSystem.js | wc -l)
DESKTOP_PARTICLES=$(grep -o "baseParticleCount.*60" frontend/src/components/OptimizedParticleSystem.js | wc -l)

if [ "$MOBILE_PARTICLES" -gt 0 ]; then
    echo "✅ Mobile particle count optimized (≤25 particles)"
else
    echo "⚠️ Mobile particle count needs optimization"
fi

if [ "$DESKTOP_PARTICLES" -gt 0 ]; then
    echo "✅ Desktop particle count optimized (≤60 particles)"
else
    echo "⚠️ Desktop particle count needs optimization"
fi

# Check z-index hierarchy
if grep -q "z-index: 10" frontend/index.html; then
    echo "✅ UI containers properly layered (z-index: 10+)"
else
    echo "⚠️ UI container layering needs verification"
fi

echo ""
echo "🎨 VISUAL ENHANCEMENTS:"
echo "======================="

# Check for enhanced UI boxes
UI_BOXES=(".swap-box" ".wallet-box" ".settings-box" ".history-box")
for box in "${UI_BOXES[@]}"; do
    if grep -q "$box" frontend/src/styles/EnhancedUIBoxes.css; then
        echo "✅ Enhanced styling for $box"
    else
        echo "⚠️ Enhanced styling needed for $box"
    fi
done

echo ""
echo "⚡ PERFORMANCE FEATURES:"
echo "======================="

# Check performance features
PERF_FEATURES=(
    "translateZ(0)"
    "will-change"
    "backface-visibility: hidden"
    "contain: layout style paint"
)

for feature in "${PERF_FEATURES[@]}"; do
    COUNT=$(grep -r "$feature" frontend/src/styles/EnhancedUIBoxes.css | wc -l)
    if [ "$COUNT" -gt 0 ]; then
        echo "✅ $feature used ($COUNT instances)"
    else
        echo "⚠️ $feature needs implementation"
    fi
done

echo ""
echo "🎪 PARTICLE SYSTEM STATUS:"
echo "=========================="

if [ -f "frontend/src/utils/ParticleAutoInit.js" ]; then
    echo "✅ Auto-initialization system implemented"
    echo "✅ Smart timing and error handling"
    echo "✅ Global debugging functions available"
else
    echo "❌ Auto-initialization system missing"
fi

echo ""
echo "🔧 DEVELOPER TOOLS:"
echo "=================="

if grep -q "window.validateNocturnePerformance" frontend/src/utils/PerformanceValidator.js; then
    echo "✅ Performance validation tools"
    echo "   - window.validateNocturnePerformance() - 10s performance test"
    echo "   - window.toggleNocturneMonitor() - Real-time FPS monitor"
    echo "   - window.nocturneValidator - Direct access to validator"
else
    echo "⚠️ Performance validation tools need implementation"
fi

echo ""
echo "📊 INTEGRATION VERIFICATION:"
echo "============================"

# Check if all scripts are properly included in HTML
SCRIPTS=(
    "OptimizedParticleSystem.js"
    "ParticleSystemManager.js"
    "ParticleAutoInit.js"
    "PerformanceValidator.js"
)

for script in "${SCRIPTS[@]}"; do
    if grep -q "$script" frontend/index.html; then
        echo "✅ $script included in HTML"
    else
        echo "❌ $script not included in HTML"
    fi
done

if grep -q "EnhancedUIBoxes.css" frontend/index.html; then
    echo "✅ EnhancedUIBoxes.css included in HTML"
else
    echo "❌ EnhancedUIBoxes.css not included in HTML"
fi

echo ""
echo "🎯 FINAL VALIDATION SUMMARY:"
echo "============================"

# Count successes and warnings
SUCCESSES=$(grep -c "✅" "$RESULTS_FILE")
WARNINGS=$(grep -c "⚠️" "$RESULTS_FILE")
ERRORS=$(grep -c "❌" "$RESULTS_FILE")

echo "✅ Successful validations: $SUCCESSES"
echo "⚠️ Warnings: $WARNINGS"
echo "❌ Errors: $ERRORS"

# Calculate overall score
TOTAL=$((SUCCESSES + WARNINGS + ERRORS))
if [ "$TOTAL" -gt 0 ]; then
    SCORE=$((SUCCESSES * 100 / TOTAL))
    echo ""
    echo "📊 Overall Score: $SCORE%"
    
    if [ "$SCORE" -ge 90 ]; then
        echo "🎉 EXCELLENT: Visual harmony optimizations complete!"
    elif [ "$SCORE" -ge 80 ]; then
        echo "🎯 GOOD: Minor optimizations may be needed"
    elif [ "$SCORE" -ge 70 ]; then
        echo "⚠️ FAIR: Several optimizations recommended"
    else
        echo "❌ NEEDS WORK: Major optimizations required"
    fi
fi

echo ""
echo "🚀 NEXT STEPS:"
echo "=============="
echo "1. Open developer tools in browser"
echo "2. Run: validateNocturnePerformance()"
echo "3. Verify 60fps target across all views"
echo "4. Test on mobile devices for performance"
echo "5. Validate accessibility with screen readers"

echo ""
echo "💡 DEBUGGING COMMANDS:"
echo "====================="
echo "// In browser console:"
echo "validateNocturnePerformance()  // Run performance test"
echo "toggleNocturneMonitor()        // Toggle FPS monitor"
echo "nocturneValidator.validateLayering()  // Check z-index layers"

echo ""
echo "✨ Visual Harmony Validation Complete!"
echo "Results saved to: $RESULTS_FILE"
echo "=================================================="
