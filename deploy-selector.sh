#!/bin/bash
# Choose which version to deploy

echo "🌙 NocturneSwap Version Selector"
echo "==============================="
echo ""
echo "Available versions:"
echo "1. Stable (Current) - Mobile-responsive, error handling, demo mode"
echo "2. Wallet Integration - Phantom/Solflare wallet connection"
echo "3. Simple - Basic demo version"
echo "4. Development - Original dev version"
echo ""

read -p "Which version would you like to deploy? (1-4): " choice

case $choice in
    1)
        echo "✅ Selected: Stable version"
        if [ -f "frontend/index-stable.html" ]; then
            cp frontend/index-stable.html frontend/index.html
            echo "✅ Stable version set as default"
        else
            echo "❌ Stable version not found"
            exit 1
        fi
        ;;
    2)
        echo "✅ Selected: Wallet Integration version"
        if [ -f "frontend/index-wallet.html" ]; then
            cp frontend/index-wallet.html frontend/index.html
            echo "✅ Wallet version set as default"
        else
            echo "❌ Wallet version not found"
            exit 1
        fi
        ;;
    3)
        echo "✅ Selected: Simple version"
        if [ -f "frontend/index-simple.html" ]; then
            cp frontend/index-simple.html frontend/index.html
            echo "✅ Simple version set as default"
        else
            echo "❌ Simple version not found"
            exit 1
        fi
        ;;
    4)
        echo "✅ Selected: Development version"
        if [ -f "frontend/dev.html" ]; then
            cp frontend/dev.html frontend/index.html
            echo "✅ Development version set as default"
        else
            echo "❌ Development version not found"
            exit 1
        fi
        ;;
    *)
        echo "❌ Invalid choice. Using stable version as default."
        cp frontend/index-stable.html frontend/index.html
        ;;
esac

echo ""
echo "🔨 Building selected version..."
./build.sh

echo ""
echo "🚀 Ready for deployment!"
echo "📁 Build output: build/index.html"
echo "🌐 Deploy to Vercel now!"
