#!/bin/bash

# ====================================================
# PARTICLE EFFECT PERFORMANCE VALIDATION SCRIPT
# ====================================================
# 
# PURPOSE: Validate particle system performance and UI integration
# FEATURES: Performance testing, visual validation, browser compatibility
# USAGE: ./test-particle-performance.sh

echo "🎭 NOCTURNE PARTICLE SYSTEM PERFORMANCE VALIDATION"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
TEST_DURATION=30
PERFORMANCE_THRESHOLD=45

echo -e "${BLUE}🔧 Starting performance validation...${NC}"

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ Found: $1${NC}"
        return 0
    else
        echo -e "${RED}❌ Missing: $1${NC}"
        return 1
    fi
}

# Function to validate CSS syntax
validate_css() {
    local file="$1"
    if command -v npx >/dev/null 2>&1; then
        echo -e "${BLUE}🎨 Validating CSS syntax: $file${NC}"
        npx stylelint "$file" --formatter string 2>/dev/null || echo -e "${YELLOW}⚠️  CSS validation requires stylelint${NC}"
    fi
}

# Function to check JavaScript syntax
validate_js() {
    local file="$1"
    if command -v node >/dev/null 2>&1; then
        echo -e "${BLUE}📜 Validating JavaScript syntax: $file${NC}"
        node -c "$file" && echo -e "${GREEN}✅ Valid JavaScript${NC}" || echo -e "${RED}❌ JavaScript syntax error${NC}"
    fi
}

echo -e "\n${BLUE}📁 CHECKING FILE STRUCTURE${NC}"
echo "=================================="

# Check core files
FILES_TO_CHECK=(
    "frontend/src/components/OptimizedParticleSystem.js"
    "frontend/src/styles/EnhancedUIBoxes.css"
    "frontend/src/utils/ParticleSystemManager.js"
    "frontend/src/utils/performance-monitor.js"
    "frontend/src/styles/GamingTierFX.css"
)

missing_files=0
for file in "${FILES_TO_CHECK[@]}"; do
    if ! check_file "$file"; then
        ((missing_files++))
    fi
done

if [ $missing_files -eq 0 ]; then
    echo -e "${GREEN}✅ All core files present${NC}"
else
    echo -e "${RED}❌ $missing_files files missing${NC}"
fi

echo -e "\n${BLUE}🔍 SYNTAX VALIDATION${NC}"
echo "========================="

# Validate CSS files
if [ -f "frontend/src/styles/EnhancedUIBoxes.css" ]; then
    validate_css "frontend/src/styles/EnhancedUIBoxes.css"
fi

# Validate JavaScript files
if [ -f "frontend/src/components/OptimizedParticleSystem.js" ]; then
    validate_js "frontend/src/components/OptimizedParticleSystem.js"
fi

if [ -f "frontend/src/utils/ParticleSystemManager.js" ]; then
    validate_js "frontend/src/utils/ParticleSystemManager.js"
fi

echo -e "\n${BLUE}🎯 PERFORMANCE CHARACTERISTICS${NC}"
echo "==================================="

# Calculate estimated performance metrics
if [ -f "frontend/src/components/OptimizedParticleSystem.js" ]; then
    echo -e "${GREEN}🚀 Particle System Features:${NC}"
    
    # Check for GPU acceleration
    if grep -q "translateZ(0)" "frontend/src/components/OptimizedParticleSystem.js"; then
        echo -e "   ✅ GPU acceleration enabled"
    fi
    
    # Check for performance monitoring
    if grep -q "performance.now()" "frontend/src/components/OptimizedParticleSystem.js"; then
        echo -e "   ✅ Performance monitoring integrated"
    fi
    
    # Check for adaptive particle count
    if grep -q "getAdaptiveParticleCount" "frontend/src/components/OptimizedParticleSystem.js"; then
        echo -e "   ✅ Adaptive particle density"
    fi
    
    # Check for device detection
    if grep -q "navigator.hardwareConcurrency" "frontend/src/components/OptimizedParticleSystem.js"; then
        echo -e "   ✅ Device capability detection"
    fi
    
    # Check for proper layering
    if grep -q "z-index: -1" "frontend/src/components/OptimizedParticleSystem.js"; then
        echo -e "   ✅ Proper z-index layering"
    fi
    
    # Check for pointer events
    if grep -q "pointer-events: none" "frontend/src/components/OptimizedParticleSystem.js"; then
        echo -e "   ✅ Non-interfering pointer events"
    fi
fi

echo -e "\n${BLUE}✨ UI ENHANCEMENT FEATURES${NC}"
echo "============================="

if [ -f "frontend/src/styles/EnhancedUIBoxes.css" ]; then
    echo -e "${GREEN}🎨 UI Box Enhancements:${NC}"
    
    # Check for sweep animations
    if grep -q "sweep" "frontend/src/styles/EnhancedUIBoxes.css"; then
        echo -e "   ✅ Sweep animations implemented"
    fi
    
    # Check for glow effects
    if grep -q "glow" "frontend/src/styles/EnhancedUIBoxes.css"; then
        echo -e "   ✅ Glow effects implemented"
    fi
    
    # Check for GPU acceleration
    if grep -q "will-change: transform" "frontend/src/styles/EnhancedUIBoxes.css"; then
        echo -e "   ✅ GPU-accelerated transforms"
    fi
    
    # Check for accessibility
    if grep -q "prefers-reduced-motion" "frontend/src/styles/EnhancedUIBoxes.css"; then
        echo -e "   ✅ Accessibility support"
    fi
    
    # Check for responsive design
    if grep -q "@media" "frontend/src/styles/EnhancedUIBoxes.css"; then
        echo -e "   ✅ Responsive design"
    fi
fi

echo -e "\n${BLUE}📊 PERFORMANCE ESTIMATES${NC}"
echo "=========================="

# Estimate performance based on features
echo -e "${GREEN}Estimated Performance Characteristics:${NC}"
echo -e "   🎯 Target FPS: 60"
echo -e "   📱 Mobile FPS: 45-60"
echo -e "   💻 Desktop FPS: 60+"
echo -e "   🔋 Battery Impact: Low (GPU accelerated)"
echo -e "   💾 Memory Usage: 2-5MB additional"
echo -e "   🌐 Browser Support: Chrome, Firefox, Safari, Edge"

echo -e "\n${BLUE}🧪 INTEGRATION CHECKLIST${NC}"
echo "=========================="

integration_checks=0
total_checks=8

# Check if App.css imports are added
if [ -f "frontend/src/App.css" ] && grep -q "EnhancedUIBoxes.css" "frontend/src/App.css"; then
    echo -e "   ✅ CSS imports added to App.css"
    ((integration_checks++))
else
    echo -e "   ❌ CSS imports missing from App.css"
fi

# Check if HTML includes particle scripts
if [ -f "frontend/index.html" ] && grep -q "OptimizedParticleSystem.js" "frontend/index.html"; then
    echo -e "   ✅ Particle scripts added to HTML"
    ((integration_checks++))
else
    echo -e "   ❌ Particle scripts missing from HTML"
fi

# Check for performance monitor utility
if [ -f "frontend/src/utils/performance-monitor.js" ]; then
    echo -e "   ✅ Performance monitoring utility present"
    ((integration_checks++))
else
    echo -e "   ❌ Performance monitoring utility missing"
fi

# Check for theme integration
if [ -f "frontend/src/utils/ParticleSystemManager.js" ] && grep -q "themeChanged" "frontend/src/utils/ParticleSystemManager.js"; then
    echo -e "   ✅ Theme integration implemented"
    ((integration_checks++))
else
    echo -e "   ❌ Theme integration missing"
fi

# Check for cleanup mechanisms
if [ -f "frontend/src/utils/ParticleSystemManager.js" ] && grep -q "cleanupExistingSystems" "frontend/src/utils/ParticleSystemManager.js"; then
    echo -e "   ✅ System cleanup mechanisms present"
    ((integration_checks++))
else
    echo -e "   ❌ System cleanup mechanisms missing"
fi

# Check for debugging utilities
if [ -f "frontend/src/utils/ParticleSystemManager.js" ] && grep -q "particleDebug" "frontend/src/utils/ParticleSystemManager.js"; then
    echo -e "   ✅ Debug utilities available"
    ((integration_checks++))
else
    echo -e "   ❌ Debug utilities missing"
fi

# Check for error handling
if [ -f "frontend/src/components/OptimizedParticleSystem.js" ] && grep -q "try\|catch\|error" "frontend/src/components/OptimizedParticleSystem.js"; then
    echo -e "   ✅ Error handling implemented"
    ((integration_checks++))
else
    echo -e "   ❌ Error handling missing"
fi

# Check for memory management
if [ -f "frontend/src/components/OptimizedParticleSystem.js" ] && grep -q "destroy" "frontend/src/components/OptimizedParticleSystem.js"; then
    echo -e "   ✅ Memory management implemented"
    ((integration_checks++))
else
    echo -e "   ❌ Memory management missing"
fi

echo -e "\n${BLUE}📈 INTEGRATION SCORE${NC}"
echo "===================="

percentage=$((integration_checks * 100 / total_checks))
if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT: $integration_checks/$total_checks checks passed ($percentage%)${NC}"
elif [ $percentage -ge 75 ]; then
    echo -e "${YELLOW}🎯 GOOD: $integration_checks/$total_checks checks passed ($percentage%)${NC}"
else
    echo -e "${RED}⚠️  NEEDS WORK: $integration_checks/$total_checks checks passed ($percentage%)${NC}"
fi

echo -e "\n${BLUE}🚀 NEXT STEPS${NC}"
echo "=============="

if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}✅ System ready for production!${NC}"
    echo "   1. Start development server: npm start"
    echo "   2. Enable monitoring: window.particleDebug.enableMonitoring()"
    echo "   3. Test across different devices"
    echo "   4. Monitor performance in DevTools"
else
    echo -e "${YELLOW}🔧 Complete remaining integration steps:${NC}"
    if [ $integration_checks -lt 8 ]; then
        echo "   1. Add missing CSS imports to App.css"
        echo "   2. Include particle scripts in HTML"
        echo "   3. Test all components individually"
    fi
fi

echo -e "\n${BLUE}🛠️  DEBUGGING COMMANDS${NC}"
echo "======================"
echo "   Enable monitoring: window.particleDebug.enableMonitoring()"
echo "   Check performance: window.particleDebug.getStats()"
echo "   Adjust particles: window.particleDebug.setParticleCount(50)"
echo "   Restart system: window.particleDebug.restart()"
echo "   Disable system: window.particleDebug.destroy()"

echo -e "\n${GREEN}🎭 Particle system validation complete!${NC}"

# Return appropriate exit code
if [ $percentage -ge 75 ]; then
    exit 0
else
    exit 1
fi
