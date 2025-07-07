#!/usr/bin/env python3
"""
Production build script for NocturneSwap
Creates optimized version without requiring npm
"""

import os
import sys
import shutil
import json
from pathlib import Path

def create_build_directory():
    """Create build directory structure"""
    build_dir = Path("build")
    if build_dir.exists():
        shutil.rmtree(build_dir)
    
    build_dir.mkdir()
    (build_dir / "static").mkdir()
    (build_dir / "static" / "css").mkdir()
    (build_dir / "static" / "js").mkdir()
    
    return build_dir

def create_production_html(build_dir):
    """Create production HTML file"""
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="NocturneSwap - Solana DEX" />
    <title>NocturneSwap - Solana DEX</title>
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌙</text></svg>">
    <link href="./static/css/main.css" rel="stylesheet">
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/react-router-dom@6/dist/umd/react-router-dom.production.min.js"></script>
    <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></script>
    <script src="./static/js/main.js"></script>
</body>
</html>'''
    
    with open(build_dir / "index.html", "w") as f:
        f.write(html_content)

def extract_css_from_dev_html():
    """Extract CSS from dev.html"""
    try:
        dev_html_path = Path("frontend") / "dev.html"
        with open(dev_html_path, "r") as f:
            content = f.read()
        
        # Extract CSS between <style> tags
        start = content.find("<style>") + 7
        end = content.find("</style>")
        css_content = content[start:end]
        
        return css_content
    except Exception as e:
        print(f"Error extracting CSS: {e}")
        return ""

def extract_js_from_dev_html():
    """Extract JavaScript from dev.html"""
    try:
        dev_html_path = Path("frontend") / "dev.html"
        with open(dev_html_path, "r") as f:
            content = f.read()
        
        # Extract JavaScript between <script type="text/babel"> tags
        start = content.find('<script type="text/babel">') + 26
        end = content.rfind("</script>")
        js_content = content[start:end]
        
        # Remove babel transform requirement
        js_content = js_content.replace("const { useState, useEffect, useContext, createContext } = React;", 
                                      "const { useState, useEffect, useContext, createContext } = React;")
        
        return js_content
    except Exception as e:
        print(f"Error extracting JavaScript: {e}")
        return ""

def create_build_files(build_dir):
    """Create optimized CSS and JS files"""
    
    # Create CSS file
    css_content = extract_css_from_dev_html()
    if css_content:
        with open(build_dir / "static" / "css" / "main.css", "w") as f:
            f.write(css_content)
    
    # Create JS file
    js_content = extract_js_from_dev_html()
    if js_content:
        with open(build_dir / "static" / "js" / "main.js", "w") as f:
            f.write(js_content)

def create_manifest(build_dir):
    """Create manifest.json"""
    manifest = {
        "short_name": "NocturneSwap",
        "name": "NocturneSwap - Solana DEX",
        "icons": [
            {
                "src": "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌙</text></svg>",
                "sizes": "64x64 32x32 24x24 16x16",
                "type": "image/svg+xml"
            }
        ],
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#000000",
        "background_color": "#ffffff"
    }
    
    with open(build_dir / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)

def main():
    # Get the current working directory (should be project root)
    project_root = Path.cwd()
    
    # Ensure we're in the right directory (look for key files)
    if not (project_root / "frontend" / "dev.html").exists():
        print("❌ Error: Please run this script from the project root directory")
        print("   Expected to find: frontend/dev.html")
        sys.exit(1)
    
    print("🌙 NocturneSwap Production Build")
    print("=" * 40)
    print(f"📁 Building from: {project_root}")
    print("📦 Creating build directory...")
    
    build_dir = create_build_directory()
    
    print("📄 Creating production HTML...")
    create_production_html(build_dir)
    
    print("🎨 Extracting and optimizing CSS...")
    print("📜 Extracting and optimizing JavaScript...")
    create_build_files(build_dir)
    
    print("📱 Creating manifest...")
    create_manifest(build_dir)
    
    print("✅ Build complete!")
    print(f"📁 Files created in: {build_dir.absolute()}")
    print("🚀 Ready for deployment!")
    print()
    print("To serve the production build:")
    print("  cd build && python3 -m http.server 8080")
    print("  Then open: http://localhost:8080")

if __name__ == "__main__":
    main()
