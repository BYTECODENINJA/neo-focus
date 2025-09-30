"""
Database Manager for AURA Focus
Handles all SQLite database operations
"""

import sqlite3
import json
import logging
from datetime import datetime, date
from typing import List, Dict, Any, Optional
import os

class DatabaseManager:
    def __init__(self, db_path: str = "aura_focus.db"):
        self.db_path = db_path
        self.logger = logging.getLogger(__name__)
        
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def initialize_database(self):
        """Initialize database with all required tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Tasks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    priority TEXT DEFAULT 'medium',
                    status TEXT DEFAULT 'pending',
                    due_date TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Habits table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS habits (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    frequency TEXT DEFAULT 'daily',
                    streak INTEGER DEFAULT 0,
                    best_streak INTEGER DEFAULT 0,
                    last_completed TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Goals table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS goals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    category TEXT,
                    target_value INTEGER DEFAULT 1,
                    current_value INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'active',
                    due_date TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Notes table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT,
                    tags TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Journal entries table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS journal_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    date TEXT NOT NULL,
                    content TEXT,
                    mood INTEGER DEFAULT 5,
                    energy INTEGER DEFAULT 5,
                    tags TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Events table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    start_date TEXT NOT NULL,
                    end_date TEXT,
                    all_day INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Focus sessions table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS focus_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    duration INTEGER NOT NULL,
                    type TEXT DEFAULT 'pomodoro',
                    completed INTEGER DEFAULT 0,
                    date TEXT DEFAULT CURRENT_DATE,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Settings table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            self.logger.info("Database initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Database initialization failed: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    # Task operations
    def create_task(self, title: str, description: str = "", priority: str = "medium", due_date: str = None) -> int:
        """Create a new task"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO tasks (title, description, priority, due_date)
                VALUES (?, ?, ?, ?)
            ''', (title, description, priority, due_date))
            
            task_id = cursor.lastrowid
            conn.commit()
            self.logger.info(f"Created task: {title}")
            return task_id
            
        except Exception as e:
            self.logger.error(f"Failed to create task: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_tasks(self, status: str = None) -> List[Dict]:
        """Get all tasks or tasks by status"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            if status:
                cursor.execute('SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC', (status,))
            else:
                cursor.execute('SELECT * FROM tasks ORDER BY created_at DESC')
            
            tasks = [dict(row) for row in cursor.fetchall()]
            return tasks
            
        except Exception as e:
            self.logger.error(f"Failed to get tasks: {e}")
            return []
        finally:
            conn.close()
    
    def update_task(self, task_id: int, **kwargs) -> bool:
        """Update a task"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Build dynamic update query
            fields = []
            values = []
            for key, value in kwargs.items():
                if key in ['title', 'description', 'priority', 'status', 'due_date']:
                    fields.append(f"{key} = ?")
                    values.append(value)
            
            if not fields:
                return False
            
            fields.append("updated_at = CURRENT_TIMESTAMP")
            values.append(task_id)
            
            query = f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?"
            cursor.execute(query, values)
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            self.logger.error(f"Failed to update task: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    def delete_task(self, task_id: int) -> bool:
        """Delete a task"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            self.logger.error(f"Failed to delete task: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    # Habit operations
    def create_habit(self, name: str, description: str = "", frequency: str = "daily") -> int:
        """Create a new habit"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO habits (name, description, frequency)
                VALUES (?, ?, ?)
            ''', (name, description, frequency))
            
            habit_id = cursor.lastrowid
            conn.commit()
            return habit_id
            
        except Exception as e:
            self.logger.error(f"Failed to create habit: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_habits(self) -> List[Dict]:
        """Get all habits"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM habits ORDER BY created_at DESC')
            habits = [dict(row) for row in cursor.fetchall()]
            return habits
            
        except Exception as e:
            self.logger.error(f"Failed to get habits: {e}")
            return []
        finally:
            conn.close()
    
    def complete_habit(self, habit_id: int) -> bool:
        """Mark habit as completed for today"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            today = date.today().isoformat()
            
            # Get current habit data
            cursor.execute('SELECT * FROM habits WHERE id = ?', (habit_id,))
            habit = cursor.fetchone()
            
            if not habit:
                return False
            
            # Update streak
            new_streak = habit['streak'] + 1
            best_streak = max(habit['best_streak'], new_streak)
            
            cursor.execute('''
                UPDATE habits 
                SET streak = ?, best_streak = ?, last_completed = ?
                WHERE id = ?
            ''', (new_streak, best_streak, today, habit_id))
            
            conn.commit()
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to complete habit: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    # Goal operations
    def create_goal(self, title: str, description: str = "", category: str = "", target_value: int = 1, due_date: str = None) -> int:
        """Create a new goal"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO goals (title, description, category, target_value, due_date)
                VALUES (?, ?, ?, ?, ?)
            ''', (title, description, category, target_value, due_date))
            
            goal_id = cursor.lastrowid
            conn.commit()
            return goal_id
            
        except Exception as e:
            self.logger.error(f"Failed to create goal: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_goals(self) -> List[Dict]:
        """Get all goals"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM goals ORDER BY created_at DESC')
            goals = [dict(row) for row in cursor.fetchall()]
            return goals
            
        except Exception as e:
            self.logger.error(f"Failed to get goals: {e}")
            return []
        finally:
            conn.close()
    
    def update_goal_progress(self, goal_id: int, progress: int) -> bool:
        """Update goal progress"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                UPDATE goals SET current_value = ? WHERE id = ?
            ''', (progress, goal_id))
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            self.logger.error(f"Failed to update goal progress: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    # Note operations
    def create_note(self, title: str, content: str = "", tags: str = "") -> int:
        """Create a new note"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO notes (title, content, tags)
                VALUES (?, ?, ?)
            ''', (title, content, tags))
            
            note_id = cursor.lastrowid
            conn.commit()
            return note_id
            
        except Exception as e:
            self.logger.error(f"Failed to create note: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_notes(self) -> List[Dict]:
        """Get all notes"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM notes ORDER BY updated_at DESC')
            notes = [dict(row) for row in cursor.fetchall()]
            return notes
            
        except Exception as e:
            self.logger.error(f"Failed to get notes: {e}")
            return []
        finally:
            conn.close()
    
    def update_note(self, note_id: int, title: str = None, content: str = None, tags: str = None) -> bool:
        """Update a note"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            fields = []
            values = []
            
            if title is not None:
                fields.append("title = ?")
                values.append(title)
            if content is not None:
                fields.append("content = ?")
                values.append(content)
            if tags is not None:
                fields.append("tags = ?")
                values.append(tags)
            
            if not fields:
                return False
            
            fields.append("updated_at = CURRENT_TIMESTAMP")
            values.append(note_id)
            
            query = f"UPDATE notes SET {', '.join(fields)} WHERE id = ?"
            cursor.execute(query, values)
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            self.logger.error(f"Failed to update note: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    # Journal operations
    def create_journal_entry(self, date_str: str, content: str = "", mood: int = 5, energy: int = 5, tags: str = "") -> int:
        """Create a new journal entry"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO journal_entries (date, content, mood, energy, tags)
                VALUES (?, ?, ?, ?, ?)
            ''', (date_str, content, mood, energy, tags))
            
            entry_id = cursor.lastrowid
            conn.commit()
            return entry_id
            
        except Exception as e:
            self.logger.error(f"Failed to create journal entry: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_journal_entries(self, limit: int = 30) -> List[Dict]:
        """Get journal entries"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM journal_entries ORDER BY date DESC LIMIT ?', (limit,))
            entries = [dict(row) for row in cursor.fetchall()]
            return entries
            
        except Exception as e:
            self.logger.error(f"Failed to get journal entries: {e}")
            return []
        finally:
            conn.close()
    
    def get_journal_entry_by_date(self, date_str: str) -> Optional[Dict]:
        """Get journal entry for specific date"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT * FROM journal_entries WHERE date = ?', (date_str,))
            entry = cursor.fetchone()
            return dict(entry) if entry else None
            
        except Exception as e:
            self.logger.error(f"Failed to get journal entry: {e}")
            return None
        finally:
            conn.close()
    
    # Focus session operations
    def create_focus_session(self, duration: int, session_type: str = "pomodoro", completed: bool = False) -> int:
        """Create a new focus session"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO focus_sessions (duration, type, completed, date)
                VALUES (?, ?, ?, ?)
            ''', (duration, session_type, int(completed), date.today().isoformat()))
            
            session_id = cursor.lastrowid
            conn.commit()
            return session_id
            
        except Exception as e:
            self.logger.error(f"Failed to create focus session: {e}")
            conn.rollback()
            raise
        finally:
            conn.close()
    
    def get_focus_sessions(self, date_str: str = None) -> List[Dict]:
        """Get focus sessions"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            if date_str:
                cursor.execute('SELECT * FROM focus_sessions WHERE date = ? ORDER BY created_at DESC', (date_str,))
            else:
                cursor.execute('SELECT * FROM focus_sessions ORDER BY created_at DESC LIMIT 50')
            
            sessions = [dict(row) for row in cursor.fetchall()]
            return sessions
            
        except Exception as e:
            self.logger.error(f"Failed to get focus sessions: {e}")
            return []
        finally:
            conn.close()
    
    # Settings operations
    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a setting value"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
            result = cursor.fetchone()
            
            if result:
                try:
                    return json.loads(result['value'])
                except json.JSONDecodeError:
                    return result['value']
            
            return default
            
        except Exception as e:
            self.logger.error(f"Failed to get setting: {e}")
            return default
        finally:
            conn.close()
    
    def set_setting(self, key: str, value: Any) -> bool:
        """Set a setting value"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            if isinstance(value, (dict, list)):
                value_str = json.dumps(value)
            else:
                value_str = str(value)
            
            cursor.execute('''
                INSERT OR REPLACE INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            ''', (key, value_str))
            
            conn.commit()
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to set setting: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    # Statistics
    def get_statistics(self) -> Dict[str, Any]:
        """Get application statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            stats = {}
            
            # Task statistics
            cursor.execute('SELECT COUNT(*) as total FROM tasks')
            stats['total_tasks'] = cursor.fetchone()['total']
            
            cursor.execute('SELECT COUNT(*) as completed FROM tasks WHERE status = "completed"')
            stats['completed_tasks'] = cursor.fetchone()['completed']
            
            # Habit statistics
            cursor.execute('SELECT COUNT(*) as total FROM habits')
            stats['total_habits'] = cursor.fetchone()['total']
            
            cursor.execute('SELECT AVG(streak) as avg_streak FROM habits')
            result = cursor.fetchone()
            stats['avg_habit_streak'] = round(result['avg_streak'] or 0, 1)
            
            # Goal statistics
            cursor.execute('SELECT COUNT(*) as total FROM goals')
            stats['total_goals'] = cursor.fetchone()['total']
            
            cursor.execute('SELECT COUNT(*) as completed FROM goals WHERE status = "completed"')
            stats['completed_goals'] = cursor.fetchone()['completed']
            
            # Focus session statistics
            cursor.execute('SELECT COUNT(*) as total FROM focus_sessions WHERE completed = 1')
            stats['completed_sessions'] = cursor.fetchone()['total']
            
            cursor.execute('SELECT SUM(duration) as total_time FROM focus_sessions WHERE completed = 1')
            result = cursor.fetchone()
            stats['total_focus_time'] = result['total_time'] or 0
            
            # Note and journal statistics
            cursor.execute('SELECT COUNT(*) as total FROM notes')
            stats['total_notes'] = cursor.fetchone()['total']
            
            cursor.execute('SELECT COUNT(*) as total FROM journal_entries')
            stats['total_journal_entries'] = cursor.fetchone()['total']
            
            return stats
            
        except Exception as e:
            self.logger.error(f"Failed to get statistics: {e}")
            return {}
        finally:
            conn.close()
