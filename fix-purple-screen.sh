#!/bin/bash
# Purple screen fix - restore working version

echo "🔧 Purple Screen Emergency Fix"
echo "=============================="

echo "🚨 Detected purple screen issue!"
echo "📋 Diagnosis: Complex React version was selected"
echo "💡 Solution: Restoring working professional version"

# Backup the broken version
if [ -f "frontend/index.html" ]; then
    cp frontend/index.html frontend/index-broken-backup.html
    echo "✅ Backed up broken version to index-broken-backup.html"
fi

# Restore the working professional version
if [ -f "frontend/index-professional.html" ]; then
    cp frontend/index-professional.html frontend/index.html
    echo "✅ Restored working professional version"
else
    echo "❌ Professional version not found!"
    
    # Fallback to stable version
    if [ -f "frontend/index-stable.html" ]; then
        cp frontend/index-stable.html frontend/index.html
        echo "✅ Fallback: Restored stable version"
    else
        echo "❌ No working versions found!"
        exit 1
    fi
fi

# Rebuild
echo ""
echo "🔨 Rebuilding..."
./build.sh

echo ""
echo "🧪 Testing build..."
if [ -f "build/index.html" ]; then
    FILE_SIZE=$(stat -c%s build/index.html)
    echo "✅ Build successful: $FILE_SIZE bytes"
    
    # Check for working content
    if grep -q "NocturneSwap" build/index.html && grep -q "Professional" build/index.html; then
        echo "✅ Content verification passed"
    else
        echo "❌ Content verification failed"
        exit 1
    fi
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "🎉 Purple screen fixed!"
echo "💻 The DEX should now load properly"
echo "🔒 Tip: Use './deploy-selector.sh' to safely choose versions"
