#!/bin/bash
# Choose which version to deploy

echo "🌙 NocturneSwap Version Selector"
echo "==============================="
echo ""
echo "Available versions:"
echo "1. Stable - Mobile-responsive, error handling, demo mode"
echo "2. Professional - Full DEX with analytics, portfolio, admin dashboard"
echo "3. Wallet Integration - Phantom/Solflare wallet connection"
echo "4. Simple - Basic demo version"
echo "5. Development - Original dev version"
echo ""

read -p "Which version would you like to deploy? (1-5): " choice

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
        echo "✅ Selected: Professional version"
        if [ -f "frontend/index-professional.html" ]; then
            cp frontend/index-professional.html frontend/index.html
            echo "✅ Professional version set as default"
        else
            echo "❌ Professional version not found"
            exit 1
        fi
        ;;
    3)
        echo "✅ Selected: Wallet Integration version"
        if [ -f "frontend/index-wallet.html" ]; then
            cp frontend/index-wallet.html frontend/index.html
            echo "✅ Wallet version set as default"
        else
            echo "❌ Wallet version not found"
            exit 1
        fi
        ;;
    4)
        echo "✅ Selected: Simple version"
        if [ -f "frontend/index-simple.html" ]; then
            cp frontend/index-simple.html frontend/index.html
            echo "✅ Simple version set as default"
        else
            echo "❌ Simple version not found"
            exit 1
        fi
        ;;
    5)
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
        echo "❌ Invalid choice. Using professional version as default."
        cp frontend/index-professional.html frontend/index.html
        ;;
esac

echo ""
echo "🔨 Building selected version..."
./build.sh

echo ""
echo "🚀 Ready for deployment!"
echo "📁 Build output: build/index.html"
echo "🌐 Deploy to Vercel now!"
echo ""
echo "📊 Selected version features:"
case $choice in
    1)
        echo "   ✅ Mobile responsive design"
        echo "   ✅ Error handling & loading states"
        echo "   ✅ Token swapping interface"
        echo "   ✅ Wallet connection support"
        ;;
    2)
        echo "   ✅ Full professional DEX interface"
        echo "   ✅ Real-time analytics & monitoring"
        echo "   ✅ Portfolio management"
        echo "   ✅ Admin dashboard"
        echo "   ✅ Jupiter API integration ready"
        echo "   ✅ Advanced trading features"
        ;;
    3)
        echo "   ✅ Phantom wallet integration"
        echo "   ✅ Solflare wallet integration"
        echo "   ✅ Balance display"
        echo "   ✅ Transaction signing ready"
        ;;
    4)
        echo "   ✅ Basic token swapping"
        echo "   ✅ Simple, lightweight"
        echo "   ✅ Fast loading"
        ;;
    5)
        echo "   ✅ Development features"
        echo "   ✅ Debug mode"
        ;;
esac
