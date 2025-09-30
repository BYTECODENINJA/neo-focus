#!/usr/bin/env python3
"""
Aura Focus - Desktop Application
Python Desktop App using PyWebView with SQLite Database
"""

import os
import sys
import threading
import time
import json
import sqlite3
import webview
from datetime import datetime, timedelta
from pathlib import Path
import logging
import tkinter as tk
from tkinter import messagebox

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AuraFocusAPI:
    """Backend API for the Aura Focus application"""
    
    def __init__(self):
        self.db_path = self.get_db_path()
        self.init_database()
        self.reminders_active = True
        self.focus_timer_active = False
        self.start_reminder_service()
        
    def get_db_path(self):
        """Get the database path in user's data directory"""
        if sys.platform == "win32":
            data_dir = Path(os.environ['APPDATA']) / 'AuraFocus'
        elif sys.platform == "darwin":
            data_dir = Path.home() / 'Library' / 'Application Support' / 'AuraFocus'
        else:
            data_dir = Path.home() / '.local' / 'share' / 'AuraFocus'
        
        data_dir.mkdir(parents=True, exist_ok=True)
        return data_dir / 'aura_focus.db'
    
    def init_database(self):
        """Initialize SQLite database with all required tables"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Tasks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    priority TEXT DEFAULT 'medium',
                    completed BOOLEAN DEFAULT FALSE,
                    due_date TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Habits table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS habits (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    description TEXT,
                    frequency TEXT DEFAULT 'daily',
                    streak INTEGER DEFAULT 0,
                    completed_dates TEXT DEFAULT '[]',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Goals table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS goals (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    category TEXT DEFAULT 'personal',
                    target_value INTEGER DEFAULT 1,
                    current_value INTEGER DEFAULT 0,
                    unit TEXT,
                    completed BOOLEAN DEFAULT FALSE,
                    has_milestones BOOLEAN DEFAULT FALSE,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Milestones table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS milestones (
                    id TEXT PRIMARY KEY,
                    goal_id TEXT NOT NULL,
                    name TEXT NOT NULL,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
                )
            ''')
            
            # Notes table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notes (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT,
                    folder_id TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (folder_id) REFERENCES folders (id) ON DELETE SET NULL
                )
            ''')
            
            # Folders table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS folders (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    color TEXT DEFAULT '#8b5cf6',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Journal table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS journal (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    mood TEXT DEFAULT 'neutral',
                    energy INTEGER DEFAULT 5,
                    gratitude TEXT,
                    reflection TEXT,
                    date TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Events table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS events (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    date TEXT NOT NULL,
                    time TEXT,
                    type TEXT DEFAULT 'personal',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Reminders table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS reminders (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    date TEXT NOT NULL,
                    time TEXT NOT NULL,
                    repeat_type TEXT DEFAULT 'none',
                    active BOOLEAN DEFAULT TRUE,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Settings table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    id TEXT PRIMARY KEY DEFAULT 'main',
                    theme TEXT DEFAULT 'purple',
                    language TEXT DEFAULT 'en',
                    timezone TEXT DEFAULT 'UTC',
                    username TEXT DEFAULT 'User',
                    work_duration INTEGER DEFAULT 25,
                    break_duration INTEGER DEFAULT 5,
                    notifications BOOLEAN DEFAULT TRUE,
                    total_focus_time INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Insert default settings if not exists
            cursor.execute('''
                INSERT OR IGNORE INTO settings (id, created_at, updated_at) 
                VALUES ('main', ?, ?)
            ''', (datetime.now().isoformat(), datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
            logger.info("Database initialized successfully")
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    def execute_query(self, query, params=None, fetch=False):
        """Execute a database query with error handling"""
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
            cursor = conn.cursor()
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            if fetch:
                result = [dict(row) for row in cursor.fetchall()]
            else:
                result = cursor.rowcount
            
            conn.commit()
            conn.close()
            
            return result
            
        except Exception as e:
            logger.error(f"Database query failed: {e}")
            raise
    
    def get_current_time(self):
        """Get current timestamp"""
        return datetime.now().isoformat()
    
    # Settings Management
    def get_settings(self):
        """Get application settings"""
        settings = self.execute_query("SELECT * FROM settings WHERE id = 'main'", fetch=True)
        return settings[0] if settings else {}
    
    def save_settings(self, data):
        """Save application settings"""
        current_time = self.get_current_time()
        
        # Check if settings exist
        existing = self.execute_query("SELECT id FROM settings WHERE id = 'main'", fetch=True)
        
        if existing:
            # Update existing settings
            update_fields = []
            params = []
            
            for key, value in data.items():
                if key in ['theme', 'language', 'timezone', 'username', 'work_duration', 'break_duration', 'notifications', 'total_focus_time']:
                    update_fields.append(f"{key} = ?")
                    params.append(value)
            
            if update_fields:
                update_fields.append("updated_at = ?")
                params.append(current_time)
                
                query = f"UPDATE settings SET {', '.join(update_fields)} WHERE id = 'main'"
                self.execute_query(query, params)
        else:
            # Insert new settings
            query = '''
                INSERT INTO settings (id, theme, language, timezone, username, work_duration, break_duration, notifications, total_focus_time, created_at, updated_at)
                VALUES ('main', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            '''
            params = (data.get('theme', 'purple'), data.get('language', 'en'), data.get('timezone', 'UTC'),
                     data.get('username', 'User'), data.get('work_duration', 25), data.get('break_duration', 5),
                     data.get('notifications', True), data.get('total_focus_time', 0), current_time, current_time)
            
            self.execute_query(query, params)
        
        return True
    
    # Notification System
    def show_notification(self, title, message, type_="info"):
        """Show system notification"""
        try:
            if sys.platform == "win32":
                import plyer
                plyer.notification.notify(
                    title=title,
                    message=message,
                    timeout=5
                )
            elif sys.platform == "darwin":
                os.system(f'''osascript -e 'display notification "{message}" with title "{title}"' ''')
            else:  # Linux
                os.system(f'notify-send "{title}" "{message}"')
        except Exception as e:
            logger.error(f"Notification failed: {e}")
        
        return {"success": True, "title": title, "message": message}
    
    def show_focus_complete_popup(self, session_name, session_type):
        """Show focus session complete popup"""
        title = f"{session_type} Complete!"
        message = f'Your "{session_name}" session is complete. Time for a break!'
        
        # Show system notification
        self.show_notification(title, message)
        
        return {"success": True, "title": title, "message": message, "type": "focus_complete"}
    
    def show_reminder_popup(self, reminder_title, reminder_description):
        """Show reminder popup"""
        title = "Reminder"
        message = f"{reminder_title}\n{reminder_description}" if reminder_description else reminder_title
        
        # Show system notification
        self.show_notification(title, message)
        
        return {"success": True, "title": title, "message": message, "type": "reminder"}
    
    # Focus Timer Methods
    def start_focus_session(self, session_name, duration_minutes):
        """Start a focus session"""
        self.focus_timer_active = True
        self.current_session = {
            'name': session_name,
            'start_time': time.time(),
            'duration': duration_minutes * 60,  # Convert to seconds
            'type': 'work'
        }
        
        # Start timer in background thread
        threading.Thread(target=self._focus_timer_worker, daemon=True).start()
        
        return {"success": True, "message": f"Focus session '{session_name}' started!"}
    
    def stop_focus_session(self):
        """Stop the current focus session"""
        self.focus_timer_active = False
        return {"success": True, "message": "Focus session stopped"}
    
    def _focus_timer_worker(self):
        """Background worker for focus timer"""
        while self.focus_timer_active and hasattr(self, 'current_session'):
            elapsed = time.time() - self.current_session['start_time']
            
            if elapsed >= self.current_session['duration']:
                # Session complete
                self.focus_timer_active = False
                
                # Show completion popup
                session_name = self.current_session['name']
                session_type = "Work Session" if self.current_session['type'] == 'work' else "Break Time"
                
                self.show_focus_complete_popup(session_name, session_type)
                
                # Update total focus time in settings
                settings = self.get_settings()
                total_focus_time = settings.get('total_focus_time', 0)
                if self.current_session['type'] == 'work':
                    total_focus_time += self.current_session['duration']
                    self.save_settings({'total_focus_time': total_focus_time})
                
                break
            
            time.sleep(1)  # Check every second
    
    # Reminder Service
    def start_reminder_service(self):
        """Start the reminder service"""
        threading.Thread(target=self._reminder_worker, daemon=True).start()
    
    def _reminder_worker(self):
        """Background worker for reminders"""
        while self.reminders_active:
            try:
                current_time = datetime.now()
                current_date = current_time.strftime('%Y-%m-%d')
                current_time_str = current_time.strftime('%H:%M')
                
                # Get active reminders for today
                active_reminders = self.execute_query(
                    "SELECT * FROM reminders WHERE active = 1 AND date = ? AND time = ?",
                    (current_date, current_time_str), fetch=True
                )
                
                for reminder in active_reminders:
                    self.show_reminder_popup(reminder['title'], reminder['description'])
                    
                    # Handle repeat logic
                    if reminder['repeat_type'] != 'none':
                        next_date = self._calculate_next_reminder_date(
                            current_date, reminder['repeat_type']
                        )
                        if next_date:
                            self.update_reminder(reminder['id'], {'date': next_date})
                
                time.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Reminder service error: {e}")
                time.sleep(60)
    
    def _calculate_next_reminder_date(self, current_date, repeat_type):
        """Calculate the next reminder date based on repeat type"""
        try:
            current = datetime.strptime(current_date, '%Y-%m-%d')
            
            if repeat_type == 'daily':
                next_date = current + timedelta(days=1)
            elif repeat_type == 'weekly':
                next_date = current + timedelta(weeks=1)
            elif repeat_type == 'monthly':
                # Simple monthly calculation (same day next month)
                if current.month == 12:
                    next_date = current.replace(year=current.year + 1, month=1)
                else:
                    next_date = current.replace(month=current.month + 1)
            else:
                return None
            
            return next_date.strftime('%Y-%m-%d')
            
        except Exception as e:
            logger.error(f"Next reminder date calculation failed: {e}")
            return None
    
    def stop_reminder_service(self):
        """Stop the reminder service"""
        self.reminders_active = False
    
    # Data Export/Import
    def export_data(self):
        """Export all data to JSON"""
        try:
            export_data = {
                'export_date': datetime.now().isoformat()
            }
            
            # Save to file
            export_path = Path.home() / f'aura_focus_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            with open(export_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            return {"success": True, "path": str(export_path)}
            
        except Exception as e:
            logger.error(f"Data export failed: {e}")
            return {"success": False, "error": str(e)}


def create_app():
    """Create and configure the PyWebView application"""
    api = AuraFocusAPI()
    
    # Get the directory containing this script
    current_dir = Path(__file__).parent
    web_dir = current_dir
    
    # Check if index.html exists
    index_path = web_dir / 'index.html'
    if not index_path.exists():
        logger.error(f"index.html not found at {index_path}")
        return None
    
    # Create the webview window
    window = webview.create_window(
        'Aura Focus - Productivity Suite',
        str(index_path),
        js_api=api,
        width=1200,
        height=800,
        min_size=(800, 600),
        resizable=True
    )
    
    return window, api


def main():
    """Main application entry point"""
    try:
        logger.info("Starting Aura Focus Desktop Application")
        
        # Create the application
        result = create_app()
        if not result:
            logger.error("Failed to create application")
            return 1
        
        window, api = result
        
        # Start the webview
        webview.start(debug=False)  # Set debug=True for development
        
        # Cleanup
        api.stop_reminder_service()
        logger.info("Application stopped")
        
        return 0
        
    except Exception as e:
        logger.error(f"Application failed to start: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
