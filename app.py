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

class DataRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/data':
            try:
                # Get data from database
                db_manager = DatabaseManager()
                data = db_manager.get_all_data()
                
                if data:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                    self.end_headers()
                    self.wfile.write(json.dumps(data).encode())
                else:
                    self.send_response(404)
                    self.end_headers()
            except Exception as e:
                logger.error(f"Error reading data: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/save':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                # Save data to database
                db_manager = DatabaseManager()
                success = db_manager.save_all_data(data)
                
                if success:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps({'success': True}).encode())
                else:
                    self.send_response(500)
                    self.end_headers()
            except Exception as e:
                logger.error(f"Error saving data: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            super().do_POST()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

class NeoFocusApp:
    def __init__(self):
        self.window = None
        self.app_path = self._get_app_path()
        self.server = None
        self.server_thread = None
        # Initialize database manager
        self.db_manager = DatabaseManager()
        logger.info("NEO FOCUS App initialized successfully")
    
    def save_data(self, data):
        """Save data to database - called from JavaScript via PyWebView"""
        try:
            success = self.db_manager.save_all_data(data)
            if success:
                logger.info("Data saved successfully to database")
            else:
                logger.error("Failed to save data to database")
            return success
        except Exception as e:
            logger.error(f"Error saving data: {e}")
            return False
    
    def load_data(self):
        """Load data from database - called from JavaScript via PyWebView"""
        try:
            data = self.db_manager.get_all_data()
            if data:
                logger.info("Data loaded successfully from database")
                return data
            else:
                logger.error("Failed to load data from database")
                return None
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            return None
        
    def _get_app_path(self):
        """Get the path to the Next.js build output"""
        if getattr(sys, 'frozen', False):
            # Running as compiled executable
            base_path = sys._MEIPASS
        else:
            # Running as script
            base_path = os.path.dirname(os.path.abspath(__file__))
        
        # Look for the out directory
        out_path = os.path.join(base_path, 'out')
        if os.path.exists(out_path):
            return out_path
        
        # Fallback to parent directory
        parent_out = os.path.join(base_path, '..', 'out')
        if os.path.exists(parent_out):
            return parent_out
            
        return None
    
    def start_local_server(self):
        """Start a local HTTP server to serve the static files"""
        if not self.app_path:
            return None
        
        # Find an available port starting at 8000
        port = 8000
        while port < 8010:
            try:
                # Change to the app directory
                os.chdir(self.app_path)
                
                # Create and start the server
                handler = DataRequestHandler
                self.server = socketserver.TCPServer(("127.0.0.1", port), handler)
                self.server.allow_reuse_address = True
                
                # Start server in a separate thread
                self.server_thread = threading.Thread(target=self.server.serve_forever)
                self.server_thread.daemon = True
                self.server_thread.start()
                
                # Copy data file to app directory if it doesn't exist
                self._ensure_data_file()
                
                return f"http://127.0.0.1:{port}"
            except OSError:
                port += 1
                continue
        
        return None
    
    def _ensure_data_file(self):
        """Ensure the data file exists in the app directory"""
        data_file = os.path.join(self.app_path, 'neofocus-data.json')
        if not os.path.exists(data_file):
            # Copy from base directory if it exists
            base_data_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'neofocus-data.json')
            if os.path.exists(base_data_file):
                import shutil
                shutil.copy2(base_data_file, data_file)
            else:
                # Create default data file
                default_data = {
                    "events": [],
                    "tasks": [],
                    "habits": [],
                    "goals": [],
                    "notes": [],
                    "journals": [],
                    "reminders": [],
                    "achievements": [],
                    "settings": {
                        "name": "User",
                        "theme": "dark",
                        "notifications": True,
                        "autoSave": True
                    }
                }
                import json
                with open(data_file, 'w') as f:
                    json.dump(default_data, f, indent=2)
    
    def create_window(self):
        """Create the main application window"""
        if not self.app_path:
            self._show_error("Application files not found. Please ensure the 'out' directory exists.")
            return
        
        # Start local server
        server_url = self.start_local_server()
        if not server_url:
            self._show_error("Failed to start local server for serving application files.")
            return
        
        # Get splash screen path
        splash_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'splash.html')
        splash_url = f"file:///{splash_path.replace(os.sep, '/')}" if os.path.exists(splash_path) else server_url
        
        # Window configuration
        window_config = {
            'title': 'NEO FOCUS',
            'width': 1200,
            'height': 800,
            'min_size': (800, 600),
            'resizable': True,
            'fullscreen': False,
            'frameless': False,
            'easy_drag': True,
            'text_select': True,
            'confirm_close': False,
            'background_color': '#1E1B4B',
            'url': splash_url
        }
        
        try:
            self.window = webview.create_window(**window_config)
            # Expose Python functions to JavaScript
            self.window.expose(self.save_data)
            self.window.expose(self.load_data)
            
            # Function to navigate to main app after a delay
            def load_main_app():
                import time
                time.sleep(2)  # Show splash for 2 seconds
                if self.window:
                    self.window.load_url(server_url)
            
            # Start loading main app in background
            import threading
            threading.Thread(target=load_main_app, daemon=True).start()
            
            webview.start(debug=True, private_mode=False)
        except Exception as e:
            self._show_error(f"Failed to create window: {str(e)}")
        finally:
            # Clean up server when window closes
            if self.server:
                self.server.shutdown()
                self.server.server_close()
    
    def _get_icon_path(self):
        """Get the path to the application icon"""
        icon_paths = [
            os.path.join(os.path.dirname(os.path.abspath(__file__)), 'neo-focus.ico'),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'neo-focus.ico'),
            os.path.join(self.app_path, '..', 'neo-focus.ico') if self.app_path else None
        ]
        
        for path in icon_paths:
            if path and os.path.exists(path):
                return path
        return None
    
    def _get_index_path(self):
        """Get the path to the index.html file"""
        if not self.app_path:
            return None
        
        index_path = os.path.join(self.app_path, 'index.html')
        if os.path.exists(index_path):
            return f"file:///{index_path.replace(os.sep, '/')}"
        
        return None
    
    def _show_error(self, message):
        """Show an error window"""
        error_html = f"""
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
        """
        
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
    """Main entry point"""
    app = NeoFocusApp()
    app.create_window()

if __name__ == '__main__':
    main()
