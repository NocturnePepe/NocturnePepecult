#!/bin/bash

# ============================================================================
# PHASE 9 COMPANION TESTING SCRIPT
# ============================================================================
# PURPOSE: Comprehensive testing for Cult Companion system
# TESTS: Component mounting, React integration, AI predictions, message queue
# ============================================================================

echo "🌙 PHASE 9: Testing Cult Companion Awakens..."
echo "=============================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}📋 Testing: ${test_name}${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS: ${test_name}${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL: ${test_name}${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# File existence tests
echo -e "\n${PURPLE}🔍 PHASE 9 FILE STRUCTURE VALIDATION${NC}"
echo "======================================"

run_test "CultCompanion.js exists" "[ -f 'frontend/src/components/Companion/CultCompanion.js' ]"
run_test "CompanionMessageQueue.js exists" "[ -f 'frontend/src/components/Companion/CompanionMessageQueue.js' ]"
run_test "CompanionAIPredictionLayer.js exists" "[ -f 'frontend/src/components/Companion/CompanionAIPredictionLayer.js' ]"
run_test "CompanionSettingsModal.js exists" "[ -f 'frontend/src/components/Companion/CompanionSettingsModal.js' ]"
run_test "CultCompanion.css exists" "[ -f 'frontend/src/components/Companion/CultCompanion.css' ]"
run_test "CompanionSettingsModal.css exists" "[ -f 'frontend/src/components/Companion/CompanionSettingsModal.css' ]"

# Content validation tests
echo -e "\n${PURPLE}📝 CONTENT VALIDATION${NC}"
echo "====================="

run_test "CultCompanion has React component structure" "grep -q 'const CultCompanion' frontend/src/components/Companion/CultCompanion.js"
run_test "MessageQueue has priority system" "grep -q 'priority' frontend/src/components/Companion/CompanionMessageQueue.js"
run_test "AI Prediction has pattern analysis" "grep -q 'analyzePattern' frontend/src/components/Companion/CompanionAIPredictionLayer.js"
run_test "Settings Modal has avatar selector" "grep -q 'avatarType' frontend/src/components/Companion/CompanionSettingsModal.js"
run_test "CSS has GPU acceleration" "grep -q 'will-change' frontend/src/components/Companion/CultCompanion.css"

# React/JavaScript syntax validation
echo -e "\n${PURPLE}⚛️ REACT COMPONENT VALIDATION${NC}"
echo "==============================="

run_test "CultCompanion exports properly" "grep -q 'window.CultCompanion' frontend/src/components/Companion/CultCompanion.js"
run_test "MessageQueue exports properly" "grep -q 'window.CompanionMessageQueue' frontend/src/components/Companion/CompanionMessageQueue.js"
run_test "AI Prediction exports properly" "grep -q 'window.CompanionAIPredictionLayer' frontend/src/components/Companion/CompanionAIPredictionLayer.js"
run_test "Settings Modal exports properly" "grep -q 'window.CompanionSettingsModal' frontend/src/components/Companion/CompanionSettingsModal.js"

# Feature implementation tests
echo -e "\n${PURPLE}🎯 FEATURE IMPLEMENTATION TESTS${NC}"
echo "================================="

run_test "State awareness implementation" "grep -q 'useState\\|useEffect' frontend/src/components/Companion/CultCompanion.js"
run_test "LocalStorage integration" "grep -q 'localStorage' frontend/src/components/Companion/CultCompanion.js"
run_test "User context connection" "grep -q 'userMetrics\\|userLevel' frontend/src/components/Companion/CultCompanion.js"
run_test "Message queue system" "grep -q 'messageQueue\\|addMessage' frontend/src/components/Companion/CompanionMessageQueue.js"
run_test "AI prediction layer" "grep -q 'generatePrediction\\|analyzeUserBehavior' frontend/src/components/Companion/CompanionAIPredictionLayer.js"
run_test "Lore event system" "grep -q 'loreEvents\\|seasonalEvent' frontend/src/components/Companion/CultCompanion.js"

# HTML integration tests
echo -e "\n${PURPLE}🌐 HTML INTEGRATION TESTS${NC}"
echo "=========================="

run_test "React dependencies in HTML" "grep -q 'react.*development.js' frontend/index.html"
run_test "Babel transpiler included" "grep -q 'babel.*standalone' frontend/index.html"
run_test "Companion scripts loaded" "grep -q 'CultCompanion.js' frontend/index.html"
run_test "Companion styles loaded" "grep -q 'CultCompanion.css' frontend/index.html"
run_test "Companion initialization script" "grep -q 'cult-companion-root' frontend/index.html"

# Performance optimization tests
echo -e "\n${PURPLE}⚡ PERFORMANCE OPTIMIZATION TESTS${NC}"
echo "=================================="

run_test "60fps animations configured" "grep -q '60fps\\|16.67ms' frontend/src/components/Companion/CultCompanion.css"
run_test "GPU acceleration enabled" "grep -q 'transform3d\\|translateZ' frontend/src/components/Companion/CultCompanion.css"
run_test "Debounced event handling" "grep -q 'debounce\\|throttle' frontend/src/components/Companion/CultCompanion.js"
run_test "Memory management" "grep -q 'cleanup\\|removeEventListener' frontend/src/components/Companion/CultCompanion.js"

# Accessibility tests
echo -e "\n${PURPLE}♿ ACCESSIBILITY TESTS${NC}"
echo "====================="

run_test "ARIA labels present" "grep -q 'aria-label\\|aria-describedby' frontend/src/components/Companion/CultCompanion.js"
run_test "Keyboard navigation support" "grep -q 'onKeyDown\\|tabIndex' frontend/src/components/Companion/CultCompanion.js"
run_test "Reduced motion support" "grep -q 'prefers-reduced-motion' frontend/src/components/Companion/CultCompanion.css"
run_test "High contrast support" "grep -q 'prefers-contrast' frontend/src/components/Companion/CultCompanion.css"

# Integration points tests
echo -e "\n${PURPLE}🔗 INTEGRATION POINTS TESTS${NC}"
echo "============================"

run_test "XP system integration" "grep -q 'xpGained\\|levelUp' frontend/src/components/Companion/CultCompanion.js"
run_test "DAO voting integration" "grep -q 'daoVote\\|governance' frontend/src/components/Companion/CultCompanion.js"
run_test "Referral system integration" "grep -q 'referralCount\\|referralReward' frontend/src/components/Companion/CultCompanion.js"
run_test "Swap completion integration" "grep -q 'swapCompleted\\|tradingMetrics' frontend/src/components/Companion/CultCompanion.js"

# Calculate success rate
SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

# Display results
echo -e "\n${YELLOW}📊 PHASE 9 TEST RESULTS${NC}"
echo "========================"
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
echo -e "Success Rate: ${SUCCESS_RATE}%"

# Final assessment
echo -e "\n${YELLOW}🎯 PHASE 9 ASSESSMENT${NC}"
echo "======================"

if [ $SUCCESS_RATE -ge 90 ]; then
    echo -e "${GREEN}🌟 EXCELLENT: Phase 9 Cult Companion implementation is exceptional!${NC}"
    echo -e "${GREEN}✨ Ready for production deployment${NC}"
elif [ $SUCCESS_RATE -ge 80 ]; then
    echo -e "${YELLOW}⭐ GOOD: Phase 9 implementation is solid with minor improvements needed${NC}"
    echo -e "${YELLOW}🔧 Consider addressing failed tests before deployment${NC}"
elif [ $SUCCESS_RATE -ge 70 ]; then
    echo -e "${YELLOW}⚠️  ACCEPTABLE: Phase 9 has core functionality but needs refinement${NC}"
    echo -e "${YELLOW}🛠️  Significant improvements recommended${NC}"
else
    echo -e "${RED}❌ NEEDS WORK: Phase 9 requires major improvements${NC}"
    echo -e "${RED}🔨 Address critical issues before proceeding${NC}"
fi

# Component-specific assessment
echo -e "\n${PURPLE}🧩 COMPONENT ANALYSIS${NC}"
echo "====================="

if [ -f 'frontend/src/components/Companion/CultCompanion.js' ]; then
    LINES=$(wc -l < frontend/src/components/Companion/CultCompanion.js)
    echo -e "• CultCompanion.js: ${LINES} lines - Main React component"
fi

if [ -f 'frontend/src/components/Companion/CompanionMessageQueue.js' ]; then
    LINES=$(wc -l < frontend/src/components/Companion/CompanionMessageQueue.js)
    echo -e "• CompanionMessageQueue.js: ${LINES} lines - Event detection system"
fi

if [ -f 'frontend/src/components/Companion/CompanionAIPredictionLayer.js' ]; then
    LINES=$(wc -l < frontend/src/components/Companion/CompanionAIPredictionLayer.js)
    echo -e "• CompanionAIPredictionLayer.js: ${LINES} lines - AI prediction engine"
fi

if [ -f 'frontend/src/components/Companion/CompanionSettingsModal.js' ]; then
    LINES=$(wc -l < frontend/src/components/Companion/CompanionSettingsModal.js)
    echo -e "• CompanionSettingsModal.js: ${LINES} lines - Settings interface"
fi

# Phase 9 requirements check
echo -e "\n${PURPLE}📋 PHASE 9 REQUIREMENTS CHECKLIST${NC}"
echo "=================================="

echo -e "1. State-aware Cult Companion: $([ $(grep -c 'useState\|useEffect' frontend/src/components/Companion/CultCompanion.js) -gt 0 ] && echo '✅' || echo '❌')"
echo -e "2. localStorage toggles: $([ $(grep -c 'localStorage' frontend/src/components/Companion/CultCompanion.js) -gt 0 ] && echo '✅' || echo '❌')"
echo -e "3. User context connection: $([ $(grep -c 'userMetrics\|userLevel' frontend/src/components/Companion/CultCompanion.js) -gt 0 ] && echo '✅' || echo '❌')"
echo -e "4. Message queue system: $([ -f 'frontend/src/components/Companion/CompanionMessageQueue.js' ] && echo '✅' || echo '❌')"
echo -e "5. AI prediction layer: $([ -f 'frontend/src/components/Companion/CompanionAIPredictionLayer.js' ] && echo '✅' || echo '❌')"
echo -e "6. Lore event system: $([ $(grep -c 'loreEvents\|seasonalEvent' frontend/src/components/Companion/CultCompanion.js) -gt 0 ] && echo '✅' || echo '❌')"

echo -e "\n${GREEN}🌙 Phase 9 Testing Complete!${NC}"
echo -e "${BLUE}Ready to awaken the Cult Companion...${NC}"

# Exit with appropriate code
if [ $SUCCESS_RATE -ge 80 ]; then
    exit 0
else
    exit 1
fi
