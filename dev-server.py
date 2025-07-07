#!/usr/bin/env python3
"""
NocturneSwap Development Server
Android Codespaces Compatible
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

class NocturneDevServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    
    def do_GET(self):
        # Serve the dev.html file for the root path
        if self.path == '/':
            self.path = '/dev.html'
        return super().do_GET()

def main():
    # Change to frontend directory
    frontend_dir = Path(__file__).parent / 'frontend'
    os.chdir(frontend_dir)
    
    PORT = 3000
    
    print("🌙 NocturneSwap Development Server")
    print("=" * 40)
    print(f"🚀 Starting on port {PORT}")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"🌐 Open: http://localhost:{PORT}")
    print("📱 Android Codespaces Compatible")
    print("🔄 Press Ctrl+C to stop")
    print("=" * 40)
    
    try:
        with socketserver.TCPServer(("", PORT), NocturneDevServer) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
