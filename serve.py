#!/usr/bin/env python3
"""
Simple HTTP server to serve the React frontend without npm
Works on Android Codespaces and other environments without Node.js
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse
import mimetypes

class ReactDevServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="/workspaces/NocturnePepecult/frontend/public", **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        # For React Router, serve index.html for all routes except static files
        if not self.path.startswith('/static/') and not '.' in self.path.split('/')[-1]:
            self.path = '/index.html'
        return super().do_GET()

def main():
    PORT = int(os.environ.get('PORT', 3000))
    
    # Change to the frontend directory
    os.chdir('/workspaces/NocturnePepecult/frontend/public')
    
    try:
        with socketserver.TCPServer(("", PORT), ReactDevServer) as httpd:
            print(f"🌙 NocturneSwap Dev Server")
            print(f"🚀 Server starting on http://localhost:{PORT}")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"🔄 Press Ctrl+C to stop the server")
            print()
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()
