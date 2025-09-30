/**
 * Electron Preload Script
 * Secure bridge between main and renderer processes
 * Exposes limited, safe APIs to the renderer process
 */

const { contextBridge, ipcRenderer } = require("electron")

console.log("Preload script loading...")

/**
 * Expose protected methods to renderer process
 * Uses contextBridge for security - no direct access to Node.js APIs
 */
contextBridge.exposeInMainWorld("electronAPI", {
  // Database operations - all return promises
  getAllData: () => {
    console.log("Preload: getAllData called")
    return ipcRenderer.invoke("db-get-all-data")
  },

  saveEvents: (events) => {
    console.log("Preload: saveEvents called with", events.length, "events")
    return ipcRenderer.invoke("db-save-events", events)
  },

  saveTasks: (tasks) => {
    console.log("Preload: saveTasks called with", tasks.length, "tasks")
    return ipcRenderer.invoke("db-save-tasks", tasks)
  },

  saveHabits: (habits) => {
    console.log("Preload: saveHabits called with", habits.length, "habits")
    return ipcRenderer.invoke("db-save-habits", habits)
  },

  saveGoals: (goals) => {
    console.log("Preload: saveGoals called with", goals.length, "goals")
    return ipcRenderer.invoke("db-save-goals", goals)
  },

  saveNotes: (notes) => {
    console.log("Preload: saveNotes called with", notes.length, "notes")
    return ipcRenderer.invoke("db-save-notes", notes)
  },

  saveJournals: (journals) => {
    console.log("Preload: saveJournals called with", journals.length, "journals")
    return ipcRenderer.invoke("db-save-journals", journals)
  },

  saveReminders: (reminders) => {
    console.log("Preload: saveReminders called with", reminders.length, "reminders")
    return ipcRenderer.invoke("db-save-reminders", reminders)
  },

  saveSettings: (settings) => {
    console.log("Preload: saveSettings called")
    return ipcRenderer.invoke("db-save-settings", settings)
  },

  // Notification system
  showNotification: (notification) => {
    console.log("Preload: showNotification called:", notification.title)
    return ipcRenderer.invoke("show-notification", notification)
  },

  // Menu event listeners - these set up event handlers
  onMenuNew: (callback) => {
    console.log("Preload: Setting up menu-new listener")
    ipcRenderer.on("menu-new", callback)
  },

  onMenuSave: (callback) => {
    console.log("Preload: Setting up menu-save listener")
    ipcRenderer.on("menu-save", callback)
  },

  onToggleTheme: (callback) => {
    console.log("Preload: Setting up toggle-theme listener")
    ipcRenderer.on("toggle-theme", callback)
  },

  onShowAnalytics: (callback) => {
    console.log("Preload: Setting up show-analytics listener")
    ipcRenderer.on("show-analytics", callback)
  },

  onShowDailyReview: (callback) => {
    console.log("Preload: Setting up show-daily-review listener")
    ipcRenderer.on("show-daily-review", callback)
  },

  onShowWeeklyReview: (callback) => {
    console.log("Preload: Setting up show-weekly-review listener")
    ipcRenderer.on("show-weekly-review", callback)
  },

  onMenuExport: (callback) => {
    console.log("Preload: Setting up menu-export listener")
    ipcRenderer.on("menu-export", callback)
  },

  onShowFocusMode: (callback) => {
    console.log("Preload: Setting up show-focus-mode listener")
    ipcRenderer.on("show-focus-mode", callback)
  },

  // Utility function to remove event listeners (prevents memory leaks)
  removeAllListeners: (channel) => {
    console.log("Preload: Removing all listeners for channel:", channel)
    ipcRenderer.removeAllListeners(channel)
  },
})

console.log("Preload script loaded successfully")
