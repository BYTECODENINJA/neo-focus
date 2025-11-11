
import sqlite3
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path)
        self.create_tables()

    def create_tables(self):
        cursor = self.conn.cursor()

        # Tasks table for daily schedule
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed BOOLEAN NOT NULL,
                category TEXT,
                startTime TEXT,
                endTime TEXT
            )
        ''')

        # Calendar events table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS calendar_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                date TEXT NOT NULL,
                time TEXT,
                category TEXT,
                recurring TEXT
            )
        ''')

        # Notes table for notebook
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                tags TEXT,
                category TEXT,
                createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL
            )
        ''')

        self.conn.commit()

    def add_task(self, title, category, startTime, endTime):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO tasks (title, completed, category, startTime, endTime) VALUES (?, ?, ?, ?, ?)",
                       (title, False, category, startTime, endTime))
        self.conn.commit()
        return cursor.lastrowid

    def get_tasks(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM tasks")
        return cursor.fetchall()

    def update_task(self, task_id, title, completed, category, startTime, endTime):
        cursor = self.conn.cursor()
        cursor.execute("UPDATE tasks SET title=?, completed=?, category=?, startTime=?, endTime=? WHERE id=?",
                       (title, completed, category, startTime, endTime, task_id))
        self.conn.commit()

    def delete_task(self, task_id):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id=?", (task_id,))
        self.conn.commit()

    def add_calendar_event(self, title, date, time, category, recurring):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO calendar_events (title, date, time, category, recurring) VALUES (?, ?, ?, ?, ?)",
                       (title, date, time, category, recurring))
        self.conn.commit()
        return cursor.lastrowid

    def get_calendar_events(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM calendar_events")
        return cursor.fetchall()

    def update_calendar_event(self, event_id, title, date, time, category, recurring):
        cursor = self.conn.cursor()
        cursor.execute("UPDATE calendar_events SET title=?, date=?, time=?, category=?, recurring=? WHERE id=?",
                       (title, date, time, category, recurring, event_id))
        self.conn.commit()

    def delete_calendar_event(self, event_id):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM calendar_events WHERE id=?", (event_id,))
        self.conn.commit()

    def get_notes(self):
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM notes ORDER BY updatedAt DESC")
        return cursor.fetchall()

    def add_note(self, note):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO notes (id, title, content, tags, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (note['id'], note['title'], note['content'], ','.join(note['tags']), note['category'], note['createdAt'], note['updatedAt']))
        self.conn.commit()

    def update_note(self, note):
        cursor = self.conn.cursor()
        cursor.execute("UPDATE notes SET title=?, content=?, tags=?, category=?, updatedAt=? WHERE id=?",
                       (note['title'], note['content'], ','.join(note['tags']), note['category'], note['updatedAt'], note['id']))
        self.conn.commit()

    def delete_note(self, note_id):
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM notes WHERE id=?", (note_id,))
        self.conn.commit()
