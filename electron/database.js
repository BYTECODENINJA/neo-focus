/**
 * SQLite Database Manager for NEO FOCUS Desktop Application
 * Handles all database operations with proper error handling and logging
 */

const sqlite3 = require("sqlite3").verbose()
const path = require("path")
const fs = require("fs")
const { app } = require("electron")

class Database {
  constructor() {
    // Get user data directory for database storage
    const userDataPath = app.getPath("userData")
    this.dbPath = path.join(userDataPath, "neofocus.db")
    this.db = null

    console.log("Database will be stored at:", this.dbPath)
  }

  /**
   * Initialize database connection and create tables
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      // Ensure directory exists
      const dbDir = path.dirname(this.dbPath)
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
        console.log("Created database directory:", dbDir)
      }

      // Open database connection
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error("Error opening database:", err)
          reject(err)
          return
        }

        console.log("Connected to SQLite database")
        this.createTables()
          .then(() => {
            console.log("Database initialization completed")
            resolve()
          })
          .catch(reject)
      })
    })
  }

  /**
   * Create all necessary tables
   * @returns {Promise<void>}
   */
  async createTables() {
    const tables = [
      // Events table for calendar events
      `CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        category TEXT,
        color TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tasks table for todo items
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        priority TEXT DEFAULT 'medium',
        due_date TEXT,
        category TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Habits table for habit tracking
      `CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        frequency TEXT DEFAULT 'daily',
        target_count INTEGER DEFAULT 1,
        current_streak INTEGER DEFAULT 0,
        best_streak INTEGER DEFAULT 0,
        color TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Goals table for long-term objectives
      `CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        target_date TEXT,
        progress INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        category TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Notes table for notebook entries
      `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        tags TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Journals table for daily reflections
      `CREATE TABLE IF NOT EXISTS journals (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        mood INTEGER,
        energy_level INTEGER,
        gratitude TEXT,
        reflection TEXT,
        content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Reminders table for notifications
      `CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        reminder_time TEXT NOT NULL,
        repeat_type TEXT DEFAULT 'none',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Settings table for user preferences
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
    ]

    // Execute table creation queries
    for (const tableQuery of tables) {
      await this.runQuery(tableQuery)
    }

    console.log("All database tables created successfully")
  }

  /**
   * Execute a SQL query
   * @param {string} query - SQL query to execute
   * @param {Array} params - Query parameters
   * @returns {Promise<any>}
   */
  runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) {
          console.error("Database query error:", err)
          reject(err)
        } else {
          resolve({ id: this.lastID, changes: this.changes })
        }
      })
    })
  }

  /**
   * Get all data from database
   * @returns {Promise<Object>}
   */
  async getAllData() {
    try {
      const [events, tasks, habits, goals, notes, journals, reminders, settings] = await Promise.all([
        this.getAllEvents(),
        this.getAllTasks(),
        this.getAllHabits(),
        this.getAllGoals(),
        this.getAllNotes(),
        this.getAllJournals(),
        this.getAllReminders(),
        this.getAllSettings(),
      ])

      return {
        events,
        tasks,
        habits,
        goals,
        notes,
        journals,
        reminders,
        settings,
        achievements: [], // Placeholder for achievements
      }
    } catch (error) {
      console.error("Error getting all data:", error)
      throw error
    }
  }

  /**
   * Get all events
   * @returns {Promise<Array>}
   */
  getAllEvents() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM events ORDER BY start_date DESC", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  /**
   * Save events to database
   * @param {Array} events - Array of event objects
   * @returns {Promise<void>}
   */
  async saveEvents(events) {
    try {
      // Clear existing events
      await this.runQuery("DELETE FROM events")

      // Insert new events
      for (const event of events) {
        await this.runQuery(
          `INSERT INTO events (id, title, description, start_date, end_date, category, color, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            event.id,
            event.title,
            event.description || "",
            event.start,
            event.end || "",
            event.category || "",
            event.color || "",
            event.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ],
        )
      }

      console.log(`Saved ${events.length} events to database`)
    } catch (error) {
      console.error("Error saving events:", error)
      throw error
    }
  }

  /**
   * Get all tasks
   * @returns {Promise<Array>}
   */
  getAllTasks() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM tasks ORDER BY created_at DESC", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  /**
   * Save tasks to database
   * @param {Array} tasks - Array of task objects
   * @returns {Promise<void>}
   */
  async saveTasks(tasks) {
    try {
      await this.runQuery("DELETE FROM tasks")

      for (const task of tasks) {
        await this.runQuery(
          `INSERT INTO tasks (id, title, description, completed, priority, due_date, category, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            task.id,
            task.title,
            task.description || "",
            task.completed ? 1 : 0,
            task.priority || "medium",
            task.dueDate || "",
            task.category || "",
            task.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ],
        )
      }

      console.log(`Saved ${tasks.length} tasks to database`)
    } catch (error) {
      console.error("Error saving tasks:", error)
      throw error
    }
  }

  /**
   * Get all habits
   * @returns {Promise<Array>}
   */
  getAllHabits() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM habits ORDER BY created_at DESC", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  /**
   * Save habits to database
   * @param {Array} habits - Array of habit objects
   * @returns {Promise<void>}
   */
  async saveHabits(habits) {
    try {
      await this.runQuery("DELETE FROM habits")

      for (const habit of habits) {
        await this.runQuery(
          `INSERT INTO habits (id, name, description, frequency, target_count, current_streak, best_streak, color, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            habit.id,
            habit.name,
            habit.description || "",
            habit.frequency || "daily",
            habit.targetCount || 1,
            habit.currentStreak || 0,
            habit.bestStreak || 0,
            habit.color || "",
            habit.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ],
        )
      }

      console.log(`Saved ${habits.length} habits to database`)
    } catch (error) {
      console.error("Error saving habits:", error)
      throw error
    }
  }

  /**
   * Get all goals
   * @returns {Promise<Array>}
   */
  getAllGoals() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM goals ORDER BY created_at DESC", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  /**
   * Save goals to database
   * @param {Array} goals - Array of goal objects
   * @returns {Promise<void>}
   */
  async saveGoals(goals) {
    try {
      await this.runQuery("DELETE FROM goals")

      for (const goal of goals) {
        await this.runQuery(
          `INSERT INTO goals (id, title, description, target_date, progress, status, category, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            goal.id,
            goal.title,
            goal.description || "",
            goal.targetDate || "",
            goal.progress || 0,
            goal.status || "active",
            goal.category || "",
            goal.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ],
        )
      }

      console.log(`Saved ${goals.length} goals to database`)
    } catch (error) {
      console.error("Error saving goals:", error)
      throw error
    }
  }

  /**
   * Get all notes
   * @returns {Promise<Array>}
   */
  getAllNotes() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM notes ORDER BY updated_at DESC", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  /**
   * Save notes to database
   * @param {Array} notes - Array of note objects
   * @returns {Promise<void>}
   */
  async saveNotes(notes) {
    try {
      await this.runQuery("DELETE FROM notes")

      for (const note of notes) {
        await this.runQuery(
          `INSERT INTO notes (id, title, content, tags, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            note.id,
            note.title,
            note.content || "",
            JSON.stringify(note.tags || []),
            note.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ],
        )
      }

      console.log(`Saved ${notes.length} notes to database`)
    } catch (error) {
      console.error("Error saving notes:", error)
      throw error
    }
  }

  /**
   * Get all journals
   * @returns {Promise<Array>}
   */
  getAllJournals() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM journals ORDER BY date DESC", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  /**
   * Save journals to database
   * @param {Array} journals - Array of journal objects
   * @returns {Promise<void>}
   */
  async saveJournals(journals) {
    try {
      await this.runQuery("DELETE FROM journals")

      for (const journal of journals) {
        await this.runQuery(
          `INSERT INTO journals (id, date, mood, energy_level, gratitude, reflection, content, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            journal.id,
            journal.date,
            journal.mood || null,
            journal.energyLevel || null,
            journal.gratitude || "",
            journal.reflection || "",
            journal.content || "",
            journal.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ],
        )
      }

      console.log(`Saved ${journals.length} journals to database`)
    } catch (error) {
      console.error("Error saving journals:", error)
      throw error
    }
  }

  /**
   * Get all reminders
   * @returns {Promise<Array>}
   */
  getAllReminders() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM reminders ORDER BY reminder_time ASC", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      })
    })
  }

  /**
   * Save reminders to database
   * @param {Array} reminders - Array of reminder objects
   * @returns {Promise<void>}
   */
  async saveReminders(reminders) {
    try {
      await this.runQuery("DELETE FROM reminders")

      for (const reminder of reminders) {
        await this.runQuery(
          `INSERT INTO reminders (id, title, description, reminder_time, repeat_type, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reminder.id,
            reminder.title,
            reminder.description || "",
            reminder.time,
            reminder.repeat || "none",
            reminder.active ? 1 : 0,
            reminder.createdAt || new Date().toISOString(),
            new Date().toISOString(),
          ],
        )
      }

      console.log(`Saved ${reminders.length} reminders to database`)
    } catch (error) {
      console.error("Error saving reminders:", error)
      throw error
    }
  }

  /**
   * Get all settings
   * @returns {Promise<Object>}
   */
  getAllSettings() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM settings", (err, rows) => {
        if (err) {
          reject(err)
        } else {
          const settings = {}
          rows.forEach((row) => {
            try {
              settings[row.key] = JSON.parse(row.value)
            } catch {
              settings[row.key] = row.value
            }
          })
          resolve(settings)
        }
      })
    })
  }

  /**
   * Save settings to database
   * @param {Object} settings - Settings object
   * @returns {Promise<void>}
   */
  async saveSettings(settings) {
    try {
      await this.runQuery("DELETE FROM settings")

      for (const [key, value] of Object.entries(settings)) {
        await this.runQuery("INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)", [
          key,
          JSON.stringify(value),
          new Date().toISOString(),
        ])
      }

      console.log("Settings saved to database")
    } catch (error) {
      console.error("Error saving settings:", error)
      throw error
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error("Error closing database:", err)
        } else {
          console.log("Database connection closed")
        }
      })
    }
  }
}

module.exports = Database
