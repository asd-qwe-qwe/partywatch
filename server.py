#!/usr/bin/env python3
"""
Simple HTTP server that serves static files and proxies API requests
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import json
import os

class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests - serve static files"""
        if self.path == '/':
            self.path = '/index.html'
        
        try:
            file_path = self.path.lstrip('/')
            if not os.path.exists(file_path):
                self.send_response(404)
                self.end_headers()
                return
            
            with open(file_path, 'rb') as f:
                content = f.read()
            
            # Set content type
            if file_path.endswith('.html'):
                self.send_response(200)
                self.send_header('Content-type', 'text/html')
            elif file_path.endswith('.js'):
                self.send_response(200)
                self.send_header('Content-type', 'application/javascript')
            elif file_path.endswith('.css'):
                self.send_response(200)
                self.send_header('Content-type', 'text/css')
            elif file_path.endswith('.png'):
                self.send_response(200)
                self.send_header('Content-type', 'image/png')
            else:
                self.send_response(200)
                self.send_header('Content-type', 'application/octet-stream')
            
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
    
    def do_POST(self):
        """Handle POST requests - mock API responses"""
        if self.path.startswith('/createRoom'):
            # Mock createRoom response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Generate a random room ID
            import random
            import string
            room_id = '/' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
            
            response = {
                'name': room_id
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('', port), RequestHandler)  # '' means listen on all interfaces
    print(f'Server running on http://localhost:{port}')
    print('Press Ctrl+C to stop')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        server.shutdown()

