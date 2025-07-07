#!/usr/bin/env python3
"""
NocturneSwap Deployment Script
Handles deployment to various environments
"""

import os
import sys
import subprocess
import json
from pathlib import Path

def check_environment():
    """Check if required tools are available"""
    tools = {
        "python3": "Python 3",
        "git": "Git"
    }
    
    missing = []
    for tool, name in tools.items():
        if not subprocess.run(f"which {tool}", shell=True, capture_output=True).returncode == 0:
            missing.append(name)
    
    if missing:
        print(f"❌ Missing required tools: {', '.join(missing)}")
        return False
    
    return True

def build_frontend():
    """Build the frontend for production"""
    print("🏗️  Building frontend...")
    
    try:
        # Run our custom build script
        result = subprocess.run([sys.executable, "build.py"], 
                              capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Build failed: {result.stderr}")
            return False
        
        print("✅ Frontend built successfully")
        return True
    except Exception as e:
        print(f"❌ Build error: {e}")
        return False

def deploy_to_github_pages():
    """Deploy to GitHub Pages"""
    print("🚀 Deploying to GitHub Pages...")
    
    try:
        # Create gh-pages branch if it doesn't exist
        subprocess.run("git checkout -B gh-pages", shell=True)
        
        # Copy build files to root
        subprocess.run("cp -r build/* .", shell=True)
        
        # Add and commit
        subprocess.run("git add .", shell=True)
        subprocess.run('git commit -m "Deploy NocturneSwap to GitHub Pages"', shell=True)
        
        # Push to gh-pages
        subprocess.run("git push origin gh-pages --force", shell=True)
        
        print("✅ Deployed to GitHub Pages")
        print("🌐 Your app will be available at: https://USERNAME.github.io/REPOSITORY")
        
        return True
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        return False

def deploy_to_netlify():
    """Deploy to Netlify (manual)"""
    print("🌐 Netlify Deployment Instructions:")
    print("1. Go to https://netlify.com")
    print("2. Drag and drop the 'build' folder")
    print("3. Your app will be live instantly!")
    print()
    print("📁 Build folder location: ./build")

def deploy_to_vercel():
    """Deploy to Vercel (manual)"""
    print("⚡ Vercel Deployment Instructions:")
    print("1. Go to https://vercel.com")
    print("2. Import your GitHub repository")
    print("3. Set build command to: python3 build.py")
    print("4. Set output directory to: build")
    print("5. Deploy!")

def start_local_server():
    """Start local development server"""
    print("🌙 Starting local development server...")
    
    try:
        # Check if build exists
        if not Path("build").exists():
            print("📦 Build not found, creating...")
            if not build_frontend():
                return False
        
        # Start server
        os.chdir("build")
        print("🚀 Server starting on http://localhost:8080")
        print("🔄 Press Ctrl+C to stop")
        subprocess.run("python3 -m http.server 8080", shell=True)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")

def main():
    if not check_environment():
        sys.exit(1)
    
    print("🌙 NocturneSwap Deployment Manager")
    print("=" * 40)
    print()
    print("Choose deployment option:")
    print("1. 🏗️  Build for production")
    print("2. 🚀 Deploy to GitHub Pages")
    print("3. 🌐 Deploy to Netlify (manual)")
    print("4. ⚡ Deploy to Vercel (manual)")
    print("5. 🖥️  Start local server")
    print("6. 📋 Show deployment info")
    print()
    
    choice = input("Enter your choice (1-6): ").strip()
    
    if choice == "1":
        build_frontend()
    elif choice == "2":
        if build_frontend():
            deploy_to_github_pages()
    elif choice == "3":
        if build_frontend():
            deploy_to_netlify()
    elif choice == "4":
        if build_frontend():
            deploy_to_vercel()
    elif choice == "5":
        start_local_server()
    elif choice == "6":
        show_deployment_info()
    else:
        print("❌ Invalid choice")

def show_deployment_info():
    """Show deployment information"""
    print("📋 NocturneSwap Deployment Information")
    print("=" * 40)
    print()
    print("🏗️  Build Process:")
    print("  - Frontend: Custom Python build script")
    print("  - No npm/node required")
    print("  - Optimized for production")
    print()
    print("🚀 Deployment Options:")
    print("  - GitHub Pages: Free, automatic from repository")
    print("  - Netlify: Drag & drop deployment")
    print("  - Vercel: Import from GitHub")
    print("  - Local: Python HTTP server")
    print()
    print("📁 Project Structure:")
    print("  - frontend/dev.html: Development version")
    print("  - build/: Production build")
    print("  - contracts/: Solana smart contracts")
    print()
    print("🌐 URLs:")
    print("  - Development: http://localhost:3000/dev.html")
    print("  - Production: http://localhost:8080")
    print()
    print("🔧 Commands:")
    print("  - Build: python3 build.py")
    print("  - Deploy: python3 deploy.py")
    print("  - Dev server: python3 dev-server.py")

if __name__ == "__main__":
    main()
