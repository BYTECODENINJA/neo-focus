
import webview
import os
import sys
import threading
import http.server
import socketserver
import json
import logging
from pathlib import Path
from database_manager import DatabaseManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ApiRequestHandler(http.server.SimpleHTTPRequestHandler):
    db_manager = DatabaseManager('data/neofocus.db')

    def do_GET(self):
        if self.path == '/api/tasks':
            try:
                tasks = self.db_manager.get_tasks()
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(tasks).encode())
            except Exception as e:
                logger.error(f"Error getting tasks: {e}")
                self.send_response(500)
                self.end_headers()
        elif self.path == '/api/calendar-events':
            try:
                events = self.db_manager.get_calendar_events()
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(events).encode())
            except Exception as e:
                logger.error(f"Error getting calendar events: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/tasks':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                task_id = self.db_manager.add_task(data['title'], data.get('category'), data.get('startTime'), data.get('endTime'))
                self.send_response(201)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'id': task_id}).encode())
            except Exception as e:
                logger.error(f"Error adding task: {e}")
                self.send_response(500)
                self.end_headers()
        elif self.path == '/api/calendar-events':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                event_id = self.db_manager.add_calendar_event(data['title'], data['date'], data.get('time'), data.get('category'), data.get('recurring'))
                self.send_response(201)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'id': event_id}).encode())
            except Exception as e:
                logger.error(f"Error adding calendar event: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            super().do_POST()

class NeoFocusApp:
    def __init__(self):
        self.window = None
        self.app_path = self._get_app_path()
        self.server = None
        self.server_thread = None
        self.db_manager = DatabaseManager('data/neofocus.db')
        logger.info("NEO FOCUS App initialized successfully")

    def _get_app_path(self):
        if getattr(sys, 'frozen', False):
            base_path = sys._MEIPASS
        else:
            base_path = os.path.dirname(os.path.abspath(__file__))
        
        out_path = os.path.join(base_path, 'out')
        if os.path.exists(out_path):
            return out_path
        
        parent_out = os.path.join(base_path, '..', 'out')
        if os.path.exists(parent_out):
            return parent_out
            
        return None

    def start_local_server(self):
        if not self.app_path:
            return None
        
        port = 8000
        while port < 8010:
            try:
                os.chdir(self.app_path)
                
                handler = ApiRequestHandler
                self.server = socketserver.TCPServer(("127.0.0.1", port), handler)
                self.server.allow_reuse_address = True
                
                self.server_thread = threading.Thread(target=self.server.serve_forever)
                self.server_thread.daemon = True
                self.server_thread.start()
                
                return f"http://127.0.0.1:{port}"
            except OSError:
                port += 1
                continue
        
        return None

    def create_window(self):
        if not self.app_path:
            self._show_error("Application files not found. Please ensure the 'out' directory exists.")
            return
        
        server_url = self.start_local_server()
        if not server_url:
            self._show_error("Failed to start local server for serving application files.")
            return
        
        splash_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'splash.html')
        splash_url = f"file:///{splash_path.replace(os.sep, '/')}" if os.path.exists(splash_path) else server_url
        
        window_config = {
            'title': 'NEO FOCUS',
            'width': 1200,
            'height': 800,
            'min_size': (1200, 800),
            'resizable': False,
            'fullscreen': False,
            'frameless': False,
            'easy_drag': True,
            'text_select': True,
            'confirm_close': False,
            'background_color': '#1E1B4B',
            'url': splash_url,
            'webview_fixed_size': True  # Force fixed size regardless of display scaling
        }
        
        try:
            self.window = webview.create_window(**window_config)
            
            def load_main_app():
                import time
                time.sleep(2)
                if self.window:
                    self.window.load_url(server_url)
            
            threading.Thread(target=load_main_app, daemon=True).start()
            
            webview.start(debug=True, private_mode=False)
        except Exception as e:
            self._show_error(f"Failed to create window: {str(e)}")
        finally:
            if self.server:
                self.server.shutdown()
                self.server.server_close()

    def _show_error(self, message):
        error_html = f'''
        <html>
        <head>
            <title>NEO FOCUS - Error</title>
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }}
                .error-container {{
                    text-align: center;
                    padding: 2rem;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 90%;
                }}
                h1 {{
                    color: #EF4444;
                    margin-bottom: 1rem;
                    font-size: 2rem;
                }}
                p {{
                    margin: 0.5rem 0;
                    line-height: 1.6;
                }}
                .icon {{
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }}
                .app-name {{
                    color: #a78bfa;
                    font-weight: bold;
                    margin-top: 1rem;
                }}
            </style>
        </head>
        <body>
            <div class="error-container">
                <div class="icon">⚠️</div>
                <h1>Application Error</h1>
                <p>{message}</p>
                <p>Please ensure all application files are present and try again.</p>
                <p class="app-name">NEO FOCUS</p>
            </div>
        </body>
        </html>
        '''
        
        self.window = webview.create_window(
            'NEO FOCUS - Error',
            html=error_html,
            width=600,
            height=400,
            resizable=False,
            frameless=False
        )
        webview.start()

def main():
    app = NeoFocusApp()
    app.create_window()

if __name__ == '__main__':
    main()
