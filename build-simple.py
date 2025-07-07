#!/usr/bin/env python3
"""
Simple build script for deployment platforms
Creates a production build by copying dev.html to build/index.html
"""

import os
import sys
import shutil
from pathlib import Path

def main():
    # Get current directory
    current_dir = Path.cwd()
    
    # Check if we're in the right directory
    if not (current_dir / "frontend" / "dev.html").exists():
        print("❌ Error: frontend/dev.html not found")
        sys.exit(1)
    
    print("🌙 NocturneSwap Simple Build")
    print("=" * 30)
    
    # Create build directory
    build_dir = current_dir / "build"
    if build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir()
    
    # Copy dev.html as index.html
    src_file = current_dir / "frontend" / "dev.html"
    dst_file = build_dir / "index.html"
    
    shutil.copy2(src_file, dst_file)
    
    print(f"✅ Build complete!")
    print(f"📁 Output: {dst_file}")
    print(f"🌐 Ready for deployment!")

if __name__ == "__main__":
    main()
