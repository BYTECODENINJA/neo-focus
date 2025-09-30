// Enhanced SQLite Database Manager for Web
class DatabaseManager {
  constructor() {
    this.dbName = "aura-focus-db"
    this.version = 1
    this.db = null
    this.initializeDatabase()
  }

  async initializeDatabase() {
    try {
      // Use IndexedDB as SQLite-like storage for web
      this.db = await this.openIndexedDB()
      await this.createTables()
      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Database initialization failed:", error)
      // Fallback to localStorage if IndexedDB fails
      this.db = null

      // Initialize localStorage structure if it doesn't exist
      const defaultData = {
        tasks: [],
        habits: [],
        goals: [],
        notes: [],
        folders: [],
        journal: [],
        events: [],
        reminders: [],
        milestones: [],
        settings: {
          theme: "purple",
          language: "en",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          username: "User",
          workDuration: 25,
          breakDuration: 5,
          notifications: true,
        },
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          habitStreak: 0,
          goalsCompleted: 0,
          focusTime: 0,
        },
      }

      if (!localStorage.getItem(this.dbName)) {
        localStorage.setItem(this.dbName, JSON.stringify(defaultData))
      }
    }
  }

  async openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Create object stores (tables)
        const stores = [
          "tasks",
          "habits",
          "goals",
          "notes",
          "folders",
          "journal",
          "events",
          "reminders",
          "settings",
          "stats",
          "milestones",
        ]

        stores.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true })

            // Add indexes based on store type
            switch (storeName) {
              case "tasks":
                store.createIndex("completed", "completed")
                store.createIndex("priority", "priority")
                store.createIndex("dueDate", "dueDate")
                break
              case "notes":
                store.createIndex("folderId", "folderId")
                store.createIndex("createdAt", "createdAt")
                break
              case "events":
                store.createIndex("date", "date")
                break
              case "reminders":
                store.createIndex("datetime", "datetime")
                store.createIndex("active", "active")
                break
              case "goals":
                store.createIndex("category", "category")
                store.createIndex("completed", "completed")
                break
              case "milestones":
                store.createIndex("goalId", "goalId")
                break
            }
          }
        })
      }
    })
  }

  async createTables() {
    // Tables are created in onupgradeneeded event
    return Promise.resolve()
  }

  useFallbackStorage() {
    console.warn("Using localStorage fallback for data persistence")
    this.db = null

    // Initialize localStorage structure if it doesn't exist
    const defaultData = {
      tasks: [],
      habits: [],
      goals: [],
      notes: [],
      folders: [],
      journal: [],
      events: [],
      reminders: [],
      milestones: [],
      settings: {
        theme: "purple",
        language: "en",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        username: "User",
        workDuration: 25,
        breakDuration: 5,
        notifications: true,
      },
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        habitStreak: 0,
        goalsCompleted: 0,
        focusTime: 0,
      },
    }

    if (!localStorage.getItem(this.dbName)) {
      localStorage.setItem(this.dbName, JSON.stringify(defaultData))
    }
  }

  async transaction(storeName, mode = "readonly") {
    if (!this.db) {
      throw new Error("Database not available")
    }

    const transaction = this.db.transaction([storeName], mode)
    const store = transaction.objectStore(storeName)

    return { transaction, store }
  }

  // Generic CRUD operations
  async create(storeName, data) {
    try {
      if (!this.db) {
        return this.createFallback(storeName, data)
      }

      const { store } = await this.transaction(storeName, "readwrite")
      data.id = data.id || Date.now().toString()
      data.createdAt = data.createdAt || new Date().toISOString()
      data.updatedAt = new Date().toISOString()

      return new Promise((resolve, reject) => {
        const request = store.add(data)
        request.onsuccess = () => resolve(data)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Create failed for ${storeName}:`, error)
      return this.createFallback(storeName, data)
    }
  }

  async read(storeName, id = null) {
    try {
      if (!this.db) {
        return this.readFallback(storeName, id)
      }

      const { store } = await this.transaction(storeName, "readonly")

      return new Promise((resolve, reject) => {
        if (id) {
          const request = store.get(id)
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        } else {
          const request = store.getAll()
          request.onsuccess = () => resolve(request.result || [])
          request.onerror = () => reject(request.error)
        }
      })
    } catch (error) {
      console.error(`Read failed for ${storeName}:`, error)
      return this.readFallback(storeName, id)
    }
  }

  async update(storeName, id, updates) {
    try {
      if (!this.db) {
        return this.updateFallback(storeName, id, updates)
      }

      const { store } = await this.transaction(storeName, "readwrite")

      return new Promise((resolve, reject) => {
        const getRequest = store.get(id)
        getRequest.onsuccess = () => {
          const data = getRequest.result
          if (data) {
            Object.assign(data, updates)
            data.updatedAt = new Date().toISOString()

            const putRequest = store.put(data)
            putRequest.onsuccess = () => resolve(data)
            putRequest.onerror = () => reject(putRequest.error)
          } else {
            reject(new Error("Record not found"))
          }
        }
        getRequest.onerror = () => reject(getRequest.error)
      })
    } catch (error) {
      console.error(`Update failed for ${storeName}:`, error)
      return this.updateFallback(storeName, id, updates)
    }
  }

  async delete(storeName, id) {
    try {
      if (!this.db) {
        return this.deleteFallback(storeName, id)
      }

      const { store } = await this.transaction(storeName, "readwrite")

      return new Promise((resolve, reject) => {
        const request = store.delete(id)
        request.onsuccess = () => resolve(true)
        request.onerror = () => reject(request.error)
      })
    } catch (error) {
      console.error(`Delete failed for ${storeName}:`, error)
      return this.deleteFallback(storeName, id)
    }
  }

  // Fallback methods for localStorage
  createFallback(storeName, data) {
    const allData = JSON.parse(localStorage.getItem(this.dbName) || "{}")
    if (!allData[storeName]) allData[storeName] = []

    data.id = data.id || Date.now().toString()
    data.createdAt = data.createdAt || new Date().toISOString()
    data.updatedAt = new Date().toISOString()

    allData[storeName].unshift(data)
    localStorage.setItem(this.dbName, JSON.stringify(allData))
    return data
  }

  readFallback(storeName, id = null) {
    const allData = JSON.parse(localStorage.getItem(this.dbName) || "{}")
    const storeData = allData[storeName] || []

    if (id) {
      return storeData.find((item) => item.id === id) || null
    }
    return storeData
  }

  updateFallback(storeName, id, updates) {
    const allData = JSON.parse(localStorage.getItem(this.dbName) || "{}")
    if (!allData[storeName]) return null

    const index = allData[storeName].findIndex((item) => item.id === id)
    if (index !== -1) {
      Object.assign(allData[storeName][index], updates)
      allData[storeName][index].updatedAt = new Date().toISOString()
      localStorage.setItem(this.dbName, JSON.stringify(allData))
      return allData[storeName][index]
    }
    return null
  }

  deleteFallback(storeName, id) {
    const allData = JSON.parse(localStorage.getItem(this.dbName) || "{}")
    if (!allData[storeName]) return false

    const initialLength = allData[storeName].length
    allData[storeName] = allData[storeName].filter((item) => item.id !== id)
    localStorage.setItem(this.dbName, JSON.stringify(allData))

    return allData[storeName].length < initialLength
  }

  // Specialized methods for each entity type
  async getTasks() {
    return await this.read("tasks")
  }

  async addTask(task) {
    return await this.create("tasks", task)
  }

  async updateTask(taskId, updates) {
    return await this.update("tasks", taskId, updates)
  }

  async deleteTask(taskId) {
    return await this.delete("tasks", taskId)
  }

  async getHabits() {
    return await this.read("habits")
  }

  async addHabit(habit) {
    habit.streak = 0
    habit.completedDates = []
    return await this.create("habits", habit)
  }

  async updateHabit(habitId, updates) {
    return await this.update("habits", habitId, updates)
  }

  async deleteHabit(habitId) {
    return await this.delete("habits", habitId)
  }

  async getGoals() {
    return await this.read("goals")
  }

  async addGoal(goal) {
    goal.currentValue = 0
    goal.completed = false
    const savedGoal = await this.create("goals", goal)

    // Save milestones if they exist
    if (goal.milestones && goal.milestones.length > 0) {
      for (const milestone of goal.milestones) {
        await this.create("milestones", {
          goalId: savedGoal.id,
          name: milestone.name,
          completed: false,
        })
      }
    }

    return savedGoal
  }

  async updateGoal(goalId, updates) {
    return await this.update("goals", goalId, updates)
  }

  async deleteGoal(goalId) {
    // Delete associated milestones
    const milestones = await this.getMilestonesByGoal(goalId)
    for (const milestone of milestones) {
      await this.delete("milestones", milestone.id)
    }
    return await this.delete("goals", goalId)
  }

  async getMilestonesByGoal(goalId) {
    if (this.db) {
      try {
        const { store } = await this.transaction("milestones", "readonly")
        const index = store.index("goalId")

        return new Promise((resolve, reject) => {
          const request = index.getAll(goalId)
          request.onsuccess = () => resolve(request.result || [])
          request.onerror = () => reject(request.error)
        })
      } catch (error) {
        console.error("Get milestones failed:", error)
      }
    }

    // Fallback
    const allMilestones = await this.read("milestones")
    return allMilestones.filter((m) => m.goalId === goalId)
  }

  async updateMilestone(milestoneId, updates) {
    return await this.update("milestones", milestoneId, updates)
  }

  async getNotes() {
    return await this.read("notes")
  }

  async addNote(note) {
    return await this.create("notes", note)
  }

  async updateNote(noteId, updates) {
    return await this.update("notes", noteId, updates)
  }

  async deleteNote(noteId) {
    return await this.delete("notes", noteId)
  }

  async getFolders() {
    return await this.read("folders")
  }

  async addFolder(folder) {
    return await this.create("folders", folder)
  }

  async updateFolder(folderId, updates) {
    return await this.update("folders", folderId, updates)
  }

  async deleteFolder(folderId) {
    // Update notes in this folder to have no folder
    const notes = await this.getNotes()
    const notesInFolder = notes.filter((note) => note.folderId === folderId)

    for (const note of notesInFolder) {
      await this.updateNote(note.id, { folderId: null })
    }

    return await this.delete("folders", folderId)
  }

  async getJournalEntries() {
    return await this.read("journal")
  }

  async addJournalEntry(entry) {
    entry.date = new Date().toISOString().split("T")[0]
    return await this.create("journal", entry)
  }

  async updateJournalEntry(entryId, updates) {
    return await this.update("journal", entryId, updates)
  }

  async deleteJournalEntry(entryId) {
    return await this.delete("journal", entryId)
  }

  async getEvents() {
    return await this.read("events")
  }

  async addEvent(event) {
    return await this.create("events", event)
  }

  async updateEvent(eventId, updates) {
    return await this.update("events", eventId, updates)
  }

  async deleteEvent(eventId) {
    return await this.delete("events", eventId)
  }

  async getReminders() {
    return await this.read("reminders")
  }

  async addReminder(reminder) {
    reminder.active = true
    reminder.datetime = `${reminder.date}T${reminder.time}`
    return await this.create("reminders", reminder)
  }

  async updateReminder(reminderId, updates) {
    return await this.update("reminders", reminderId, updates)
  }

  async deleteReminder(reminderId) {
    return await this.delete("reminders", reminderId)
  }

  async getSettings() {
    if (this.db) {
      const settings = await this.read("settings", "main")
      return settings || {}
    }

    // Fallback
    const allData = JSON.parse(localStorage.getItem(this.dbName) || "{}")
    return allData.settings || {}
  }

  async saveSettings(settings) {
    if (this.db) {
      try {
        const existing = await this.read("settings", "main")
        if (existing) {
          return await this.update("settings", "main", settings)
        } else {
          settings.id = "main"
          return await this.create("settings", settings)
        }
      } catch (error) {
        console.error("Save settings failed:", error)
      }
    }

    // Fallback
    const allData = JSON.parse(localStorage.getItem(this.dbName) || "{}")
    allData.settings = { ...allData.settings, ...settings }
    localStorage.setItem(this.dbName, JSON.stringify(allData))
    return allData.settings
  }

  async getStats() {
    if (this.db) {
      const stats = await this.read("stats", "main")
      return stats || {}
    }

    // Fallback
    const allData = JSON.parse(localStorage.getItem(this.dbName) || "{}")
    return allData.stats || {}
  }

  async updateStats(stats) {
    if (this.db) {
      try {
        const existing = await this.read("stats", "main")
        if (existing) {
          return await this.update("stats", "main", stats)
        } else {
          stats.id = "main"
          return await this.create("stats", stats)
        }
      } catch (error) {
        console.error("Update stats failed:", error)
      }
    }

    // Fallback
    const allData = JSON.parse(localStorage.getItem(this.dbName) || "{}")
    allData.stats = { ...allData.stats, ...stats }
    localStorage.setItem(this.dbName, JSON.stringify(allData))
    return allData.stats
  }

  // Export/Import functionality
  async exportData() {
    try {
      const exportData = {}
      const stores = ["tasks", "habits", "goals", "notes", "folders", "journal", "events", "reminders", "milestones"]

      for (const store of stores) {
        exportData[store] = await this.read(store)
      }

      exportData.settings = await this.getSettings()
      exportData.stats = await this.getStats()
      exportData.exportDate = new Date().toISOString()

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `aura-focus-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error("Export failed:", error)
      return false
    }
  }

  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData)
      const stores = ["tasks", "habits", "goals", "notes", "folders", "journal", "events", "reminders", "milestones"]

      // Clear existing data
      for (const store of stores) {
        const existing = await this.read(store)
        for (const item of existing) {
          await this.delete(store, item.id)
        }
      }

      // Import new data
      for (const store of stores) {
        if (data[store] && Array.isArray(data[store])) {
          for (const item of data[store]) {
            await this.create(store, item)
          }
        }
      }

      // Import settings and stats
      if (data.settings) {
        await this.saveSettings(data.settings)
      }

      if (data.stats) {
        await this.updateStats(data.stats)
      }

      return true
    } catch (error) {
      console.error("Import failed:", error)
      return false
    }
  }
}

// Create global database instance
window.db = new DatabaseManager()
