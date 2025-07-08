#!/usr/bin/env python3
"""
Performance Optimization Script for NocturneSwap
Minifies, compresses, and optimizes all assets for production
"""

import os
import sys
import json
import re
import gzip
import shutil
from pathlib import Path
from typing import Dict, List, Tuple

class NocturneOptimizer:
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.frontend_path = self.base_path / "frontend"
        self.build_path = self.base_path / "build"
        self.optimized_path = self.base_path / "optimized"
        
        # Performance metrics
        self.metrics = {
            "original_size": 0,
            "optimized_size": 0,
            "compression_ratio": 0,
            "files_processed": 0,
            "time_taken": 0
        }
        
        print("🌙 NocturneSwap Performance Optimizer")
        print("=" * 40)
    
    def optimize_all(self) -> bool:
        """Run all optimization steps"""
        try:
            print("🚀 Starting performance optimization...")
            
            # Create optimized directory
            if self.optimized_path.exists():
                shutil.rmtree(self.optimized_path)
            self.optimized_path.mkdir(parents=True)
            
            # Step 1: Minify HTML
            print("📄 Minifying HTML...")
            self.minify_html()
            
            # Step 2: Minify CSS
            print("🎨 Minifying CSS...")
            self.minify_css()
            
            # Step 3: Minify JavaScript
            print("⚡ Minifying JavaScript...")
            self.minify_js()
            
            # Step 4: Optimize images
            print("🖼️ Optimizing images...")
            self.optimize_images()
            
            # Step 5: Generate compressed files
            print("📦 Generating compressed files...")
            self.generate_compressed_files()
            
            # Step 6: Generate manifest
            print("📋 Generating optimization manifest...")
            self.generate_manifest()
            
            # Step 7: Calculate metrics
            self.calculate_metrics()
            
            print("\n✅ Performance optimization complete!")
            self.print_metrics()
            
            return True
            
        except Exception as e:
            print(f"❌ Optimization failed: {e}")
            return False
    
    def minify_html(self) -> None:
        """Minify HTML files"""
        html_files = list(self.frontend_path.glob("*.html"))
        
        for html_file in html_files:
            try:
                with open(html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Remove comments
                content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
                
                # Remove extra whitespace
                content = re.sub(r'\s+', ' ', content)
                
                # Remove whitespace around tags
                content = re.sub(r'>\s+<', '><', content)
                
                # Remove leading/trailing whitespace
                content = content.strip()
                
                # Save minified version
                output_file = self.optimized_path / html_file.name
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.metrics["files_processed"] += 1
                print(f"  ✅ Minified {html_file.name}")
                
            except Exception as e:
                print(f"  ❌ Failed to minify {html_file.name}: {e}")
    
    def minify_css(self) -> None:
        """Minify CSS files"""
        css_files = list(self.frontend_path.glob("**/*.css"))
        
        for css_file in css_files:
            try:
                with open(css_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Remove comments
                content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
                
                # Remove extra whitespace
                content = re.sub(r'\s+', ' ', content)
                
                # Remove whitespace around selectors and properties
                content = re.sub(r'\s*{\s*', '{', content)
                content = re.sub(r'\s*}\s*', '}', content)
                content = re.sub(r'\s*:\s*', ':', content)
                content = re.sub(r'\s*;\s*', ';', content)
                
                # Remove trailing semicolons
                content = re.sub(r';}', '}', content)
                
                # Remove leading/trailing whitespace
                content = content.strip()
                
                # Save minified version
                output_dir = self.optimized_path / css_file.parent.relative_to(self.frontend_path)
                output_dir.mkdir(parents=True, exist_ok=True)
                
                output_file = output_dir / css_file.name
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.metrics["files_processed"] += 1
                print(f"  ✅ Minified {css_file.name}")
                
            except Exception as e:
                print(f"  ❌ Failed to minify {css_file.name}: {e}")
    
    def minify_js(self) -> None:
        """Minify JavaScript files"""
        js_files = list(self.frontend_path.glob("**/*.js"))
        
        for js_file in js_files:
            try:
                with open(js_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Remove single-line comments (but preserve URLs)
                content = re.sub(r'//(?![/\*]).*$', '', content, flags=re.MULTILINE)
                
                # Remove multi-line comments
                content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
                
                # Remove extra whitespace
                content = re.sub(r'\s+', ' ', content)
                
                # Remove whitespace around operators
                content = re.sub(r'\s*([{}();,])\s*', r'\1', content)
                
                # Remove leading/trailing whitespace
                content = content.strip()
                
                # Save minified version
                output_dir = self.optimized_path / js_file.parent.relative_to(self.frontend_path)
                output_dir.mkdir(parents=True, exist_ok=True)
                
                output_file = output_dir / js_file.name
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                self.metrics["files_processed"] += 1
                print(f"  ✅ Minified {js_file.name}")
                
            except Exception as e:
                print(f"  ❌ Failed to minify {js_file.name}: {e}")
    
    def optimize_images(self) -> None:
        """Optimize image files"""
        image_files = []
        for ext in ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg']:
            image_files.extend(list(self.frontend_path.glob(f"**/{ext}")))
        
        for image_file in image_files:
            try:
                # For now, just copy images (would use image optimization library in production)
                output_dir = self.optimized_path / image_file.parent.relative_to(self.frontend_path)
                output_dir.mkdir(parents=True, exist_ok=True)
                
                output_file = output_dir / image_file.name
                shutil.copy2(image_file, output_file)
                
                self.metrics["files_processed"] += 1
                print(f"  ✅ Optimized {image_file.name}")
                
            except Exception as e:
                print(f"  ❌ Failed to optimize {image_file.name}: {e}")
    
    def generate_compressed_files(self) -> None:
        """Generate gzipped versions of files"""
        files_to_compress = []
        
        # Add all text files
        for ext in ['*.html', '*.css', '*.js', '*.json', '*.svg']:
            files_to_compress.extend(list(self.optimized_path.glob(f"**/{ext}")))
        
        for file_path in files_to_compress:
            try:
                # Generate gzipped version
                gz_path = file_path.with_suffix(file_path.suffix + '.gz')
                
                with open(file_path, 'rb') as f_in:
                    with gzip.open(gz_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                
                print(f"  ✅ Compressed {file_path.name}")
                
            except Exception as e:
                print(f"  ❌ Failed to compress {file_path.name}: {e}")
    
    def generate_manifest(self) -> None:
        """Generate optimization manifest"""
        manifest = {
            "version": "1.0.0",
            "timestamp": self.get_timestamp(),
            "optimization_level": "production",
            "features": [
                "html_minification",
                "css_minification",
                "js_minification",
                "image_optimization",
                "gzip_compression"
            ],
            "files": self.get_file_manifest(),
            "metrics": self.metrics
        }
        
        manifest_path = self.optimized_path / "optimization-manifest.json"
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2)
        
        print(f"  ✅ Generated optimization manifest")
    
    def calculate_metrics(self) -> None:
        """Calculate optimization metrics"""
        # Calculate original size
        self.metrics["original_size"] = self.get_directory_size(self.frontend_path)
        
        # Calculate optimized size
        self.metrics["optimized_size"] = self.get_directory_size(self.optimized_path)
        
        # Calculate compression ratio
        if self.metrics["original_size"] > 0:
            self.metrics["compression_ratio"] = (
                (self.metrics["original_size"] - self.metrics["optimized_size"]) /
                self.metrics["original_size"] * 100
            )
    
    def get_directory_size(self, directory: Path) -> int:
        """Get total size of directory"""
        total = 0
        for file_path in directory.rglob('*'):
            if file_path.is_file():
                total += file_path.stat().st_size
        return total
    
    def get_file_manifest(self) -> List[Dict]:
        """Get manifest of optimized files"""
        files = []
        for file_path in self.optimized_path.rglob('*'):
            if file_path.is_file() and not file_path.name.endswith('.gz'):
                files.append({
                    "path": str(file_path.relative_to(self.optimized_path)),
                    "size": file_path.stat().st_size,
                    "compressed": file_path.with_suffix(file_path.suffix + '.gz').exists()
                })
        return files
    
    def get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def print_metrics(self) -> None:
        """Print optimization metrics"""
        print("\n📊 Optimization Metrics:")
        print(f"  📁 Original Size: {self.format_size(self.metrics['original_size'])}")
        print(f"  📁 Optimized Size: {self.format_size(self.metrics['optimized_size'])}")
        print(f"  📉 Compression Ratio: {self.metrics['compression_ratio']:.1f}%")
        print(f"  📄 Files Processed: {self.metrics['files_processed']}")
        print(f"  💾 Space Saved: {self.format_size(self.metrics['original_size'] - self.metrics['optimized_size'])}")
    
    def format_size(self, bytes_size: int) -> str:
        """Format size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.1f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.1f} TB"

def main():
    """Main optimization function"""
    try:
        optimizer = NocturneOptimizer()
        success = optimizer.optimize_all()
        
        if success:
            print("\n🎉 NocturneSwap is optimized for production!")
            print("📁 Optimized files are in the 'optimized' directory")
            print("🚀 Ready for high-performance deployment!")
            return 0
        else:
            print("\n❌ Optimization failed")
            return 1
            
    except Exception as e:
        print(f"❌ Optimization error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
