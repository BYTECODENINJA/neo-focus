#!/usr/bin/env python3
"""
NEO FOCUS Database Manager
Handles local data storage with proper persistence for packaged applications
"""

import sqlite3
import json
import os
import sys
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize the database manager with proper local storage path
        
        Args:
            db_path: Optional custom database path. If None, uses default location.
        """
        self.db_path = self._get_database_path(db_path)
        self._lock = threading.Lock()
        self._init_database()
        logger.info(f"Database initialized at: {self.db_path}")
    
    def _get_database_path(self, custom_path: Optional[str] = None) -> str:
        """
        Get the appropriate database path for local storage.
        Use a per-user writable location to avoid permission errors when installed under Program Files.
        """
        if custom_path:
            return custom_path
        
        # Check if running as packaged executable
        if getattr(sys, 'frozen', False):
            # Running as compiled executable
            # Store data under %LOCALAPPDATA%\NEO-FOCUS\Data (per-user, writable)
            local_app_data = os.environ.get('LOCALAPPDATA')
            if local_app_data:
                app_data_dir = os.path.join(local_app_data, 'NEO-FOCUS', 'Data')
            else:
                # Fallback to user home directory if LOCALAPPDATA is not set
                app_data_dir = os.path.join(Path.home(), '.neo-focus', 'Data')
        else:
            # Running as script - use current directory
            base_path = os.path.dirname(os.path.abspath(__file__))
            app_data_dir = os.path.join(base_path, 'Data')
        
        # Create directory if it doesn't exist
        os.makedirs(app_data_dir, exist_ok=True)
        
        db_path = os.path.join(app_data_dir, 'neofocus.db')
        logger.info(f"Database path determined: {db_path}")
        return db_path
    
    def _init_database(self):
        """Initialize the database with all required tables"""
        try:
            with self._lock:
                with sqlite3.connect(self.db_path) as conn:
                    conn.execute("PRAGMA foreign_keys = ON")
                    conn.execute("PRAGMA journal_mode = WAL")  # Better performance
                    conn.execute("PRAGMA synchronous = NORMAL")  # Good balance of safety/speed
                    
                    # Create all tables
                    self._create_tables(conn)
                    
                    # Initialize default settings
                    self._init_default_settings(conn)
                    
                    logger.info("Database initialization completed successfully")
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    def _create_tables(self, conn: sqlite3.Connection):
        """Create all necessary database tables"""
        
        # Settings table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Events table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                time TEXT,
                location TEXT,
                type TEXT NOT NULL,
                color TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tasks table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT FALSE,
                priority TEXT DEFAULT 'medium',
                due_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Habits table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS habits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                frequency TEXT DEFAULT 'daily',
                custom_days TEXT,
                streak INTEGER DEFAULT 0,
                longest_streak INTEGER DEFAULT 0,
                completed_dates TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Goals table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS goals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                type TEXT DEFAULT 'daily',
                target_value INTEGER DEFAULT 0,
                current_value INTEGER DEFAULT 0,
                unit TEXT,
                category TEXT,
                deadline TEXT,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Notes table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT,
                category TEXT,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Journals table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS journals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                content TEXT NOT NULL,
                mood TEXT,
                energy INTEGER,
                gratitude TEXT,
                reflection TEXT,
                date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Reminders table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                message TEXT,
                type TEXT DEFAULT 'general',
                time TEXT,
                days TEXT,
                enabled BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Achievements table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                icon TEXT,
                earned_date TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Focus sessions table
        conn.execute("""
            CREATE TABLE IF NOT EXISTS focus_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                duration INTEGER NOT NULL,
                start_time TIMESTAMP,
                end_time TIMESTAMP,
                status TEXT DEFAULT 'completed',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        logger.info("All database tables created successfully")
    
    def _init_default_settings(self, conn: sqlite3.Connection):
        """Initialize default application settings"""
        default_settings = {
            'name': 'User',
            'theme': 'dark',
            'notifications': 'true',
            'autoSave': 'true',
            'focusDuration': '25',
            'breakDuration': '5',
            'longBreakDuration': '15',
            'sessionsBeforeLongBreak': '4'
        }
        
        for key, value in default_settings.items():
            conn.execute("""
                INSERT OR IGNORE INTO settings (key, value)
                VALUES (?, ?)
            """, (key, value))
        
        conn.commit()
        logger.info("Default settings initialized")
    
    def get_all_data(self) -> Dict[str, Any]:
        """Get all data from the database in the format expected by the frontend"""
        try:
            with self._lock:
                with sqlite3.connect(self.db_path) as conn:
                    conn.row_factory = sqlite3.Row
                    
                    # Get settings
                    settings = {}
                    cursor = conn.execute("SELECT key, value FROM settings")
                    for row in cursor.fetchall():
                        settings[row['key']] = self._parse_setting_value(row['value'])
                    
                    # Get all other data
                    data = {
                        'settings': settings,
                        'events': self._get_events(conn),
                        'tasks': self._get_tasks(conn),
                        'habits': self._get_habits(conn),
                        'goals': self._get_goals(conn),
                        'notes': self._get_notes(conn),
                        'journals': self._get_journals(conn),
                        'reminders': self._get_reminders(conn),
                        'achievements': self._get_achievements(conn),
                        'focusSessions': self._get_focus_sessions(conn)
                    }
                    
                    logger.info("Data retrieved successfully")
                    return data
        except Exception as e:
            logger.error(f"Error getting data: {e}")
            return self._get_default_data()
    
    def save_all_data(self, data: Dict[str, Any]) -> bool:
        """Save all data to the database"""
        try:
            with self._lock:
                with sqlite3.connect(self.db_path) as conn:
                    # Clear existing data (except settings)
                    self._clear_all_data(conn)
                    
                    # Save each data type
                    if 'settings' in data:
                        self._save_settings(conn, data['settings'])
                    
                    if 'events' in data:
                        self._save_events(conn, data['events'])
                    
                    if 'tasks' in data:
                        self._save_tasks(conn, data['tasks'])
                    
                    if 'habits' in data:
                        self._save_habits(conn, data['habits'])
                    
                    if 'goals' in data:
                        self._save_goals(conn, data['goals'])
                    
                    if 'notes' in data:
                        self._save_notes(conn, data['notes'])
                    
                    if 'journals' in data:
                        self._save_journals(conn, data['journals'])
                    
                    if 'reminders' in data:
                        self._save_reminders(conn, data['reminders'])
                    
                    if 'achievements' in data:
                        self._save_achievements(conn, data['achievements'])
                    
                    if 'focusSessions' in data:
                        self._save_focus_sessions(conn, data['focusSessions'])
                    
                    logger.info("All data saved successfully")
                    return True
        except Exception as e:
            logger.error(f"Error saving data: {e}")
            return False
    
    def _get_default_data(self) -> Dict[str, Any]:
        """Get default data structure"""
        return {
            'settings': {
                'name': 'User',
                'theme': 'dark',
                'notifications': True,
                'autoSave': True,
                'focusDuration': 25,
                'breakDuration': 5,
                'longBreakDuration': 15,
                'sessionsBeforeLongBreak': 4
            },
            'events': [],
            'tasks': [],
            'habits': [],
            'goals': [],
            'notes': [],
            'journals': [],
            'reminders': [],
            'achievements': [],
            'focusSessions': []
        }
    
    # Data retrieval methods
    def _get_events(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM events ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]
    
    def _get_tasks(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]
    
    def _get_habits(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM habits ORDER BY created_at DESC")
        habits = []
        for row in cursor.fetchall():
            habit = dict(row)
            # Parse completed_dates from JSON
            if habit.get('completed_dates'):
                try:
                    habit['completedDates'] = json.loads(habit['completed_dates'])
                except:
                    habit['completedDates'] = []
            else:
                habit['completedDates'] = []
            
            # Parse custom_days from JSON
            if habit.get('custom_days'):
                try:
                    habit['customDays'] = json.loads(habit['custom_days'])
                except:
                    habit['customDays'] = []
            else:
                habit['customDays'] = []
            
            habits.append(habit)
        return habits
    
    def _get_goals(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM goals ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]
    
    def _get_notes(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM notes ORDER BY created_at DESC")
        notes = []
        for row in cursor.fetchall():
            note = dict(row)
            # Parse tags from JSON
            if note.get('tags'):
                try:
                    note['tags'] = json.loads(note['tags'])
                except:
                    note['tags'] = []
            else:
                note['tags'] = []
            notes.append(note)
        return notes
    
    def _get_journals(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM journals ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]
    
    def _get_reminders(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM reminders ORDER BY created_at DESC")
        reminders = []
        for row in cursor.fetchall():
            reminder = dict(row)
            # Parse days from JSON
            if reminder.get('days'):
                try:
                    reminder['days'] = json.loads(reminder['days'])
                except:
                    reminder['days'] = []
            else:
                reminder['days'] = []
            reminders.append(reminder)
        return reminders
    
    def _get_achievements(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM achievements ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]
    
    def _get_focus_sessions(self, conn: sqlite3.Connection) -> List[Dict]:
        cursor = conn.execute("SELECT * FROM focus_sessions ORDER BY created_at DESC")
        return [dict(row) for row in cursor.fetchall()]
    
    # Data saving methods
    def _clear_all_data(self, conn: sqlite3.Connection):
        """Clear all data from tables (except settings)"""
        tables = ['events', 'tasks', 'habits', 'goals', 'notes', 
                 'journals', 'reminders', 'achievements', 'focus_sessions']
        
        for table in tables:
            conn.execute(f"DELETE FROM {table}")
    
    def _save_settings(self, conn: sqlite3.Connection, settings: Dict[str, Any]):
        for key, value in settings.items():
            conn.execute("""
                INSERT OR REPLACE INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            """, (key, str(value)))
    
    def _save_events(self, conn: sqlite3.Connection, events: List[Dict]):
        for event in events:
            conn.execute("""
                INSERT INTO events (title, description, date, time, location, type, color, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event.get('title', ''),
                event.get('description', ''),
                event.get('date', ''),
                event.get('time', ''),
                event.get('location', ''),
                event.get('type', 'personal'),
                event.get('color', '#3b82f6'),
                event.get('createdAt'),
                event.get('updatedAt')
            ))
    
    def _save_tasks(self, conn: sqlite3.Connection, tasks: List[Dict]):
        for task in tasks:
            conn.execute("""
                INSERT INTO tasks (title, description, completed, priority, due_date, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                task.get('title', ''),
                task.get('description', ''),
                task.get('completed', False),
                task.get('priority', 'medium'),
                task.get('dueDate', ''),
                task.get('createdAt')
            ))
    
    def _save_habits(self, conn: sqlite3.Connection, habits: List[Dict]):
        for habit in habits:
            conn.execute("""
                INSERT INTO habits (name, description, frequency, custom_days, streak, longest_streak, completed_dates, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                habit.get('name', ''),
                habit.get('description', ''),
                habit.get('frequency', 'daily'),
                json.dumps(habit.get('customDays', [])),
                habit.get('streak', 0),
                habit.get('longestStreak', 0),
                json.dumps(habit.get('completedDates', [])),
                habit.get('createdAt')
            ))
    
    def _save_goals(self, conn: sqlite3.Connection, goals: List[Dict]):
        for goal in goals:
            conn.execute("""
                INSERT INTO goals (title, description, type, target_value, current_value, unit, category, deadline, completed, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                goal.get('title', ''),
                goal.get('description', ''),
                goal.get('type', 'daily'),
                goal.get('targetValue', 0),
                goal.get('currentValue', 0),
                goal.get('unit', ''),
                goal.get('category', ''),
                goal.get('deadline', ''),
                goal.get('completed', False),
                goal.get('createdAt')
            ))
    
    def _save_notes(self, conn: sqlite3.Connection, notes: List[Dict]):
        for note in notes:
            conn.execute("""
                INSERT INTO notes (title, content, category, tags, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                note.get('title', ''),
                note.get('content', ''),
                note.get('category', ''),
                json.dumps(note.get('tags', [])),
                note.get('createdAt'),
                note.get('updatedAt')
            ))
    
    def _save_journals(self, conn: sqlite3.Connection, journals: List[Dict]):
        for journal in journals:
            conn.execute("""
                INSERT INTO journals (title, content, mood, energy, gratitude, reflection, date, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                journal.get('title', ''),
                journal.get('content', ''),
                journal.get('mood', ''),
                journal.get('energy', 0),
                journal.get('gratitude', ''),
                journal.get('reflection', ''),
                journal.get('date', ''),
                journal.get('createdAt')
            ))
    
    def _save_reminders(self, conn: sqlite3.Connection, reminders: List[Dict]):
        for reminder in reminders:
            conn.execute("""
                INSERT INTO reminders (title, message, type, time, days, enabled, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                reminder.get('title', ''),
                reminder.get('message', ''),
                reminder.get('type', 'general'),
                reminder.get('time', ''),
                json.dumps(reminder.get('days', [])),
                reminder.get('enabled', True),
                reminder.get('created_at')
            ))
    
    def _save_achievements(self, conn: sqlite3.Connection, achievements: List[Dict]):
        for achievement in achievements:
            conn.execute("""
                INSERT INTO achievements (type, title, description, icon, earned_date, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                achievement.get('type', ''),
                achievement.get('title', ''),
                achievement.get('description', ''),
                achievement.get('icon', ''),
                achievement.get('earnedDate'),
                achievement.get('createdAt')
            ))
    
    def _save_focus_sessions(self, conn: sqlite3.Connection, sessions: List[Dict]):
        for session in sessions:
            conn.execute("""
                INSERT INTO focus_sessions (title, duration, start_time, end_time, status, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                session.get('title', ''),
                session.get('duration', 0),
                session.get('startTime'),
                session.get('endTime'),
                session.get('status', 'completed'),
                session.get('notes', ''),
                session.get('createdAt')
            ))
    
    def _parse_setting_value(self, value: str) -> Any:
        """Parse setting value from string to appropriate type"""
        if value.lower() == 'true':
            return True
        elif value.lower() == 'false':
            return False
        elif value.isdigit():
            return int(value)
        elif value.replace('.', '').isdigit():
            return float(value)
        else:
            return value
    
    def backup_database(self, backup_path: str) -> bool:
        """Create a backup of the database"""
        try:
            shutil.copy2(self.db_path, backup_path)
            logger.info(f"Database backed up to: {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Error backing up database: {e}")
            return False
    
    def get_database_info(self) -> Dict[str, Any]:
        """Get information about the database"""
        try:
            with self._lock:
                with sqlite3.connect(self.db_path) as conn:
                    # Get table counts
                    tables = ['events', 'tasks', 'habits', 'goals', 'notes', 
                             'journals', 'reminders', 'achievements', 'focus_sessions']
                    counts = {}
                    
                    for table in tables:
                        cursor = conn.execute(f"SELECT COUNT(*) FROM {table}")
                        counts[table] = cursor.fetchone()[0]
                    
                    # Get database file size
                    file_size = os.path.getsize(self.db_path)
                    
                    return {
                        'path': self.db_path,
                        'size_bytes': file_size,
                        'size_mb': round(file_size / (1024 * 1024), 2),
                        'table_counts': counts,
                        'created_at': datetime.fromtimestamp(os.path.getctime(self.db_path)).isoformat()
                    }
        except Exception as e:
            logger.error(f"Error getting database info: {e}")
            return {}
