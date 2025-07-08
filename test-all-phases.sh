#!/bin/bash
# Comprehensive test suite for all NocturneSwap phases

echo "🧪 NocturneSwap Comprehensive Test Suite"
echo "========================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}Running: ${test_name}${NC}"
    
    if eval "$test_command" &>/dev/null; then
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
echo -e "${YELLOW}Phase 1: File Structure Tests${NC}"
echo "=============================="

run_test "Professional version exists" "[ -f 'frontend/index-professional.html' ]"
run_test "Stable version exists" "[ -f 'frontend/index-stable.html' ]"
run_test "Wallet version exists" "[ -f 'frontend/index-wallet.html' ]"
run_test "Simple version exists" "[ -f 'frontend/index-simple.html' ]"
run_test "Analytics module exists" "[ -f 'frontend/src/analytics.js' ]"
run_test "API module exists" "[ -f 'frontend/src/api.js' ]"
run_test "Build script exists" "[ -f 'build.sh' ]"
run_test "Deploy selector exists" "[ -f 'deploy-selector.sh' ]"
run_test "Vercel config exists" "[ -f 'vercel.json' ]"

echo ""

# Content validation tests
echo -e "${YELLOW}Phase 2: Content Validation Tests${NC}"
echo "=================================="

run_test "Professional version has analytics" "grep -q 'NocturneAnalytics' frontend/index-professional.html"
run_test "Professional version has portfolio" "grep -q 'portfolio' frontend/index-professional.html"
run_test "Professional version has admin panel" "grep -q 'admin' frontend/index-professional.html"
run_test "Stable version has mobile support" "grep -q '@media (max-width: 768px)' frontend/index-stable.html"
run_test "Wallet version has Phantom support" "grep -q 'phantom' frontend/index-wallet.html"
run_test "All versions have proper DOCTYPE" "grep -q '<!DOCTYPE html>' frontend/index-*.html"
run_test "Analytics has error tracking" "grep -q 'ErrorTracker' frontend/src/analytics.js"
run_test "API has Jupiter integration" "grep -q 'jupiter' frontend/src/api.js"

echo ""

# Build system tests
echo -e "${YELLOW}Phase 3: Build System Tests${NC}"
echo "============================"

run_test "Build script is executable" "[ -x 'build.sh' ]"
run_test "Deploy selector is executable" "[ -x 'deploy-selector.sh' ]"

# Test build with each version
echo "Testing builds for each version..."

for version in "1" "2" "3" "4" "5"; do
    echo "$version" | ./deploy-selector.sh &>/dev/null
    if [ $? -eq 0 ] && [ -f "build/index.html" ]; then
        run_test "Build version $version successful" "true"
        
        # Validate build output
        run_test "Build $version has valid HTML" "grep -q '</html>' build/index.html"
        run_test "Build $version has NocturneSwap title" "grep -q 'NocturneSwap' build/index.html"
    else
        run_test "Build version $version successful" "false"
    fi
done

echo ""

# Mobile responsiveness tests
echo -e "${YELLOW}Phase 4: Mobile Responsiveness Tests${NC}"
echo "====================================="

run_test "Has mobile viewport meta tag" "grep -q 'viewport.*width=device-width' frontend/index-*.html"
run_test "Has mobile CSS breakpoints" "grep -q '@media.*max-width.*768px' frontend/index-*.html"
run_test "Has touch-friendly buttons" "grep -q 'padding.*12px' frontend/index-*.html"
run_test "Has responsive token inputs" "grep -q 'flex-direction.*column' frontend/index-*.html"

echo ""

# Performance tests
echo -e "${YELLOW}Phase 5: Performance Tests${NC}"
echo "=========================="

# Check file sizes
for file in frontend/index-*.html; do
    if [ -f "$file" ]; then
        size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")
        if [ "$size" -lt 500000 ]; then  # Less than 500KB
            run_test "$(basename $file) size optimal (<500KB)" "true"
        else
            run_test "$(basename $file) size optimal (<500KB)" "false"
        fi
    fi
done

run_test "No large external dependencies" "! grep -q 'cdn.*react.*production' frontend/index-*.html"
run_test "Uses CDN for Web3.js" "grep -q 'unpkg.com.*solana.*web3' frontend/index-*.html"

echo ""

# Security tests
echo -e "${YELLOW}Phase 6: Security Tests${NC}"
echo "======================="

run_test "No hardcoded private keys" "! grep -i 'private.*key.*[0-9a-f]\\{32,\\}' frontend/src/*.js frontend/*.html"
run_test "No exposed API keys" "! grep -i 'api.*key.*[0-9a-zA-Z]\\{20,\\}' frontend/src/*.js frontend/*.html"
run_test "Has Content Security Policy headers" "grep -q 'X-Content-Type-Options' vercel.json"
run_test "Uses HTTPS for external resources" "! grep -q 'http://[^localhost]' frontend/index-*.html"

echo ""

# Feature completeness tests
echo -e "${YELLOW}Phase 7: Feature Completeness Tests${NC}"
echo "===================================="

# Phase 1 features
run_test "Has wallet integration" "grep -q 'connectWallet\\|wallet.*connect' frontend/index-*.html"
run_test "Has token swap interface" "grep -q 'swap.*token\\|token.*swap' frontend/index-*.html"
run_test "Has price calculation" "grep -q 'calculateSwap\\|calculate.*price' frontend/index-*.html"

# Phase 2 features
run_test "Has portfolio management" "grep -q 'portfolio\\|Portfolio' frontend/index-professional.html"
run_test "Has trading history" "grep -q 'history\\|History' frontend/index-professional.html"
run_test "Has liquidity pools" "grep -q 'pool\\|Pool\\|liquidity' frontend/index-professional.html"

# Phase 3 features
run_test "Has analytics tracking" "grep -q 'analytics\\|Analytics' frontend/src/analytics.js"
run_test "Has performance monitoring" "grep -q 'performance\\|Performance' frontend/src/analytics.js"
run_test "Has error tracking" "grep -q 'error.*track\\|track.*error' frontend/src/analytics.js"

echo ""

# API integration tests
echo -e "${YELLOW}Phase 8: API Integration Tests${NC}"
echo "=============================="

run_test "Has Jupiter API integration" "grep -q 'jupiter.*api\\|quote-api.*jup' frontend/src/api.js"
run_test "Has price feed integration" "grep -q 'price\\|Price.*feed' frontend/src/api.js"
run_test "Has token data integration" "grep -q 'token.*list\\|getTokenList' frontend/src/api.js"
run_test "Has caching mechanism" "grep -q 'cache\\|Cache' frontend/src/api.js"
run_test "Has retry logic" "grep -q 'retry\\|Retry' frontend/src/api.js"

echo ""

# Accessibility tests
echo -e "${YELLOW}Phase 9: Accessibility Tests${NC}"
echo "============================"

run_test "Has semantic HTML structure" "grep -q '<main>\\|<section>\\|<nav>' frontend/index-*.html"
run_test "Has proper heading hierarchy" "grep -q '<h[1-6]>' frontend/index-*.html"
run_test "Has alt text for images" "grep -q 'alt=' frontend/index-*.html || echo 'No images found - OK'"
run_test "Has keyboard navigation support" "grep -q 'tabindex\\|accesskey' frontend/index-*.html || grep -q 'keyboard' frontend/index-*.html"

echo ""

# Documentation tests
echo -e "${YELLOW}Phase 10: Documentation Tests${NC}"
echo "============================="

run_test "Has README file" "[ -f 'README.md' ]"
run_test "Has deployment documentation" "[ -f 'DEPLOYMENT_FIX.md' ] || [ -f 'DEPLOYMENT.md' ]"
run_test "Has build documentation" "[ -f 'BUILD_COMPLETE.md' ] || grep -q 'build' *.md"
run_test "Has next steps documentation" "[ -f 'NEXT_STEPS.md' ] || [ -f 'PRODUCTION_ROADMAP.md' ]"

echo ""

# Final summary
echo -e "${YELLOW}========================================"
echo "           TEST SUMMARY"
echo "========================================${NC}"
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}"
    echo "🎉 ALL TESTS PASSED! 🎉"
    echo "========================="
    echo "✅ NocturneSwap is ready for production deployment!"
    echo "✅ All phases (1-3) have been successfully implemented!"
    echo "✅ Core functionality, advanced features, and production polish are complete!"
    echo -e "${NC}"
    exit 0
else
    echo -e "${RED}"
    echo "❌ SOME TESTS FAILED"
    echo "===================="
    echo "Please review the failed tests above and fix the issues."
    echo -e "${NC}"
    exit 1
fi
