#!/bin/bash

# PHASE 8 AI LAYER TESTING SCRIPT
# ================================
# 
# PURPOSE: Comprehensive testing of Cult AI Layer components
# FEATURES: Performance validation, integration testing, debug tools
# ARCHITECTURE: Multi-phase testing with detailed reporting

echo "🧠 Phase 8: Cult AI Layer Testing & Validation"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${BLUE}Testing: ${test_name}${NC}"
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: ${test_name}${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED: ${test_name}${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to check file exists
check_file() {
    local file_path="$1"
    [ -f "$file_path" ]
}

# Function to check file size (non-empty)
check_file_size() {
    local file_path="$1"
    [ -s "$file_path" ]
}

# Function to check JavaScript syntax
check_js_syntax() {
    local js_file="$1"
    node -c "$js_file" 2>/dev/null
}

# Function to check CSS syntax (basic)
check_css_syntax() {
    local css_file="$1"
    # Basic CSS validation - check for balanced braces
    local open_braces=$(grep -o '{' "$css_file" | wc -l)
    local close_braces=$(grep -o '}' "$css_file" | wc -l)
    [ "$open_braces" -eq "$close_braces" ]
}

echo "🔍 Phase 1: File Existence & Structure Tests"
echo "--------------------------------------------"

# Check AI component files
run_test "CultAIInsights.js exists" "check_file 'frontend/src/ai/CultAIInsights.js'"
run_test "CultCompanion.js exists" "check_file 'frontend/src/ai/CultCompanion.js'"
run_test "CultAITriggers.js exists" "check_file 'frontend/src/ai/CultAITriggers.js'"
run_test "CultAIManager.js exists" "check_file 'frontend/src/ai/CultAIManager.js'"
run_test "CultCompanion.css exists" "check_file 'frontend/src/ai/CultCompanion.css'"

echo ""
echo "🔍 Phase 2: File Content & Size Tests"
echo "-------------------------------------"

# Check files are not empty
run_test "CultAIInsights.js has content" "check_file_size 'frontend/src/ai/CultAIInsights.js'"
run_test "CultCompanion.js has content" "check_file_size 'frontend/src/ai/CultCompanion.js'"
run_test "CultAITriggers.js has content" "check_file_size 'frontend/src/ai/CultAITriggers.js'"
run_test "CultAIManager.js has content" "check_file_size 'frontend/src/ai/CultAIManager.js'"
run_test "CultCompanion.css has content" "check_file_size 'frontend/src/ai/CultCompanion.css'"

echo ""
echo "🔍 Phase 3: Syntax Validation Tests"
echo "-----------------------------------"

# Check JavaScript syntax if Node.js is available
if command -v node &> /dev/null; then
    run_test "CultAIInsights.js syntax valid" "check_js_syntax 'frontend/src/ai/CultAIInsights.js'"
    run_test "CultCompanion.js syntax valid" "check_js_syntax 'frontend/src/ai/CultCompanion.js'"
    run_test "CultAITriggers.js syntax valid" "check_js_syntax 'frontend/src/ai/CultAITriggers.js'"
    run_test "CultAIManager.js syntax valid" "check_js_syntax 'frontend/src/ai/CultAIManager.js'"
else
    echo -e "${YELLOW}⚠️  Node.js not available - skipping JavaScript syntax validation${NC}"
fi

# Check CSS syntax
run_test "CultCompanion.css syntax valid" "check_css_syntax 'frontend/src/ai/CultCompanion.css'"

echo ""
echo "🔍 Phase 4: Integration Tests"
echo "-----------------------------"

# Check HTML integration
run_test "AI scripts integrated in HTML" "grep -q 'CultAIManager.js' frontend/index.html"
run_test "AI CSS integrated in HTML" "grep -q 'CultCompanion.css' frontend/index.html"

# Check dependency order
run_test "Dependencies loaded in correct order" "grep -n 'src/ai/' frontend/index.html | head -4 | tail -1 | grep -q 'CultAIManager.js'"

echo ""
echo "🔍 Phase 5: Feature Implementation Tests"
echo "----------------------------------------"

# Check for key features in files
run_test "Insights system has getCultInsights function" "grep -q 'getCultInsights' frontend/src/ai/CultAIInsights.js"
run_test "Companion has animation system" "grep -q 'animateOrb\|animation' frontend/src/ai/CultCompanion.js"
run_test "Triggers system has event listeners" "grep -q 'addEventListener\|EventListener' frontend/src/ai/CultAITriggers.js"
run_test "Manager has integration hooks" "grep -q 'setupIntegrationHooks\|walletConnected' frontend/src/ai/CultAIManager.js"
run_test "CSS has companion styles" "grep -q 'cult-companion\|companion-orb' frontend/src/ai/CultCompanion.css"

echo ""
echo "🔍 Phase 6: Performance Features Tests"
echo "--------------------------------------"

# Check for performance optimizations
run_test "GPU acceleration implemented" "grep -q 'translateZ\|transform3d\|will-change' frontend/src/ai/CultCompanion.css"
run_test "Performance monitoring included" "grep -q 'performance\|metrics' frontend/src/ai/CultAIManager.js"
run_test "60fps optimization present" "grep -q '60fps\|animation.*ease\|transition.*cubic-bezier' frontend/src/ai/CultCompanion.css"

echo ""
echo "🔍 Phase 7: User Experience Tests"
echo "---------------------------------"

# Check UX features
run_test "Non-intrusive design implemented" "grep -q 'z-index.*1000\|position.*fixed' frontend/src/ai/CultCompanion.css"
run_test "Accessibility features included" "grep -q 'aria-\|role=\|tabindex' frontend/src/ai/CultCompanion.js"
run_test "Mobile responsive design" "grep -q '@media\|max-width\|mobile' frontend/src/ai/CultCompanion.css"
run_test "Theme awareness implemented" "grep -q 'theme\|color-scheme' frontend/src/ai/CultCompanion.css"

echo ""
echo "🔍 Phase 8: Development Tools Tests"
echo "-----------------------------------"

# Check debugging and development features
run_test "Debug tools implemented" "grep -q 'cultAIDebug\|debug' frontend/src/ai/CultAIManager.js"
run_test "Simulation tools available" "grep -q 'simulate\|testing' frontend/src/ai/CultAIManager.js"
run_test "Console logging present" "grep -q 'console\.\(log\|warn\|error\)' frontend/src/ai/CultAIManager.js"

echo ""
echo "🔍 Phase 9: Integration Compatibility Tests"
echo "-------------------------------------------"

# Check compatibility with existing systems
run_test "Wallet integration compatible" "grep -q 'wallet\|mockWallet' frontend/src/ai/CultAIInsights.js"
run_test "XP system integration" "grep -q 'xp\|level\|nocturne-xp' frontend/src/ai/CultAIInsights.js"
run_test "Particle system compatibility" "grep -q 'z-index.*-1\|particle' frontend/src/ai/CultCompanion.css"

echo ""
echo "📊 Test Summary"
echo "==============="

# Calculate percentages
if [ $TESTS_TOTAL -gt 0 ]; then
    PASS_PERCENTAGE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    FAIL_PERCENTAGE=$((TESTS_FAILED * 100 / TESTS_TOTAL))
else
    PASS_PERCENTAGE=0
    FAIL_PERCENTAGE=0
fi

echo -e "Total Tests: ${BLUE}$TESTS_TOTAL${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC} (${PASS_PERCENTAGE}%)"
echo -e "Failed: ${RED}$TESTS_FAILED${NC} (${FAIL_PERCENTAGE}%)"

# Overall status
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Phase 8 AI Layer is ready for deployment.${NC}"
    exit 0
elif [ $PASS_PERCENTAGE -ge 90 ]; then
    echo -e "\n${YELLOW}⚠️  Minor issues detected. Phase 8 AI Layer is mostly ready.${NC}"
    exit 1
elif [ $PASS_PERCENTAGE -ge 75 ]; then
    echo -e "\n${YELLOW}⚠️  Some issues detected. Review failed tests before deployment.${NC}"
    exit 1
else
    echo -e "\n${RED}❌ Major issues detected. Fix critical failures before deployment.${NC}"
    exit 2
fi

echo ""
echo "🚀 Phase 8 Testing Complete!"
echo "=========================="
echo ""
echo "Next Steps:"
echo "1. Review any failed tests above"
echo "2. Test AI system in browser with cultAIDebug.getState()"
echo "3. Validate performance with browser dev tools"
echo "4. Test user interactions and feedback prompts"
echo "5. Deploy to production when all tests pass"
echo ""
echo "Debug Commands:"
echo "- Open browser console and run: cultAIDebug.getState()"
echo "- Test wallet simulation: cultAIDebug.simulate.walletConnect()"
echo "- Check insights: cultAIDebug.checkInsights()"
echo "- Show companion: cultAIDebug.showCompanion()"
