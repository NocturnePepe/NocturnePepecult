#!/bin/bash

echo "🌙 NocturneSwap Development Server"
echo "=================================="
echo ""
echo "🚀 Starting development server..."
echo "📱 Android Codespaces compatible mode"
echo ""

# Method 1: Try Python HTTP server
if command -v python3 &> /dev/null; then
    echo "✅ Python3 found - Starting HTTP server on port 3000"
    echo "🌐 Open: http://localhost:3000/dev.html"
    echo "📁 Serving from: $(pwd)/frontend"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    cd frontend
    python3 -m http.server 3000
else
    echo "❌ Python3 not found"
fi
