/**
 * Electron Main Process
 * Handles window creation, database operations, and system integration
 * Provides secure communication between renderer and main processes
 */

const { app, BrowserWindow, ipcMain, Menu, Notification, shell } = require("electron")
const path = require("path")
const isDev = process.env.NODE_ENV === "development"
const Database = require("./database")

// Global references
let mainWindow
let database

/**
 * Creates the main application window
 * Configures security settings and loads the application
 */
function createWindow() {
  console.log("Creating main window...")

  // Create the browser window with security settings
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false, // Security: Disable node integration
      contextIsolation: true, // Security: Enable context isolation
      enableRemoteModule: false, // Security: Disable remote module
      preload: path.join(__dirname, "preload.js"), // Secure communication bridge
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    titleBarStyle: "default",
    show: false, // Don't show until ready
    webSecurity: true, // Enable web security
  })

  // Load the application
  if (isDev) {
    console.log("Loading development server...")
    mainWindow.loadURL("http://localhost:3000")
    // Open DevTools in development
    mainWindow.webContents.openDevTools()
  } else {
    console.log("Loading production build...")
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"))
  }

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    console.log("Main window ready, showing...")
    mainWindow.show()

    // Focus the window
    if (isDev) {
      mainWindow.focus()
    }
  })

  // Handle window closed
  mainWindow.on("closed", () => {
    console.log("Main window closed")
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  // Initialize database connection
  console.log("Initializing database...")
  database = new Database()
  database
    .init()
    .then(() => {
      console.log("Database initialized successfully")
    })
    .catch((error) => {
      console.error("Database initialization failed:", error)
    })
}

/**
 * App Event Listeners
 */

// App ready event - create window and set up menu
app.whenReady().then(() => {
  console.log("App ready, creating window...")
  createWindow()
  createApplicationMenu()

  // macOS specific: recreate window when dock icon is clicked
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on("window-all-closed", () => {
  console.log("All windows closed")
  if (process.platform !== "darwin") {
    app.quit()
  }
})

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault()
    shell.openExternal(navigationUrl)
  })
})

/**
 * Database IPC Handlers
 * Secure communication between renderer and main process
 */

// Get all data from database
ipcMain.handle("db-get-all-data", async () => {
  try {
    console.log("Fetching all data from database...")
    const data = await database.getAllData()
    console.log("Successfully retrieved data from database")
    return data
  } catch (error) {
    console.error("Error getting all data:", error)
    return null
  }
})

// Save events to database
ipcMain.handle("db-save-events", async (event, events) => {
  try {
    console.log(`Saving ${events.length} events to database...`)
    await database.saveEvents(events)
    console.log("Events saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error saving events:", error)
    return { success: false, error: error.message }
  }
})

// Save tasks to database
ipcMain.handle("db-save-tasks", async (event, tasks) => {
  try {
    console.log(`Saving ${tasks.length} tasks to database...`)
    await database.saveTasks(tasks)
    console.log("Tasks saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error saving tasks:", error)
    return { success: false, error: error.message }
  }
})

// Save habits to database
ipcMain.handle("db-save-habits", async (event, habits) => {
  try {
    console.log(`Saving ${habits.length} habits to database...`)
    await database.saveHabits(habits)
    console.log("Habits saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error saving habits:", error)
    return { success: false, error: error.message }
  }
})

// Save goals to database
ipcMain.handle("db-save-goals", async (event, goals) => {
  try {
    console.log(`Saving ${goals.length} goals to database...`)
    await database.saveGoals(goals)
    console.log("Goals saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error saving goals:", error)
    return { success: false, error: error.message }
  }
})

// Save notes to database
ipcMain.handle("db-save-notes", async (event, notes) => {
  try {
    console.log(`Saving ${notes.length} notes to database...`)
    await database.saveNotes(notes)
    console.log("Notes saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error saving notes:", error)
    return { success: false, error: error.message }
  }
})

// Save journals to database
ipcMain.handle("db-save-journals", async (event, journals) => {
  try {
    console.log(`Saving ${journals.length} journals to database...`)
    await database.saveJournals(journals)
    console.log("Journals saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error saving journals:", error)
    return { success: false, error: error.message }
  }
})

// Save reminders to database
ipcMain.handle("db-save-reminders", async (event, reminders) => {
  try {
    console.log(`Saving ${reminders.length} reminders to database...`)
    await database.saveReminders(reminders)
    console.log("Reminders saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error saving reminders:", error)
    return { success: false, error: error.message }
  }
})

// Save settings to database
ipcMain.handle("db-save-settings", async (event, settings) => {
  try {
    console.log("Saving settings to database...")
    await database.saveSettings(settings)
    console.log("Settings saved successfully")
    return { success: true }
  } catch (error) {
    console.error("Error saving settings:", error)
    return { success: false, error: error.message }
  }
})

/**
 * Notification Handler
 * Shows system notifications
 */
ipcMain.handle("show-notification", async (event, { title, body, icon }) => {
  try {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body,
        icon: icon || path.join(__dirname, "assets", "icon.png"),
        silent: false,
      })

      notification.show()
      console.log("Notification shown:", title)
      return { success: true }
    } else {
      console.warn("Notifications not supported on this system")
      return { success: false, error: "Notifications not supported" }
    }
  } catch (error) {
    console.error("Error showing notification:", error)
    return { success: false, error: error.message }
  }
})

/**
 * Application Menu Creation
 * Creates native menu with keyboard shortcuts
 */
function createApplicationMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "New Entry",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            console.log("Menu: New entry triggered")
            if (mainWindow) {
              mainWindow.webContents.send("menu-new")
            }
          },
        },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            console.log("Menu: Save triggered")
            if (mainWindow) {
              mainWindow.webContents.send("menu-save")
            }
          },
        },
        { type: "separator" },
        {
          label: "Export Data",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            console.log("Menu: Export data triggered")
            if (mainWindow) {
              mainWindow.webContents.send("menu-export")
            }
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            console.log("Menu: Quit triggered")
            app.quit()
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectall" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Dark Mode",
          accelerator: "CmdOrCtrl+D",
          click: () => {
            console.log("Menu: Toggle theme triggered")
            if (mainWindow) {
              mainWindow.webContents.send("toggle-theme")
            }
          },
        },
        {
          label: "Analytics",
          accelerator: "CmdOrCtrl+A",
          click: () => {
            console.log("Menu: Show analytics triggered")
            if (mainWindow) {
              mainWindow.webContents.send("show-analytics")
            }
          },
        },
        { type: "separator" },
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Tools",
      submenu: [
        {
          label: "Daily Review",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            console.log("Menu: Show daily review triggered")
            if (mainWindow) {
              mainWindow.webContents.send("show-daily-review")
            }
          },
        },
        {
          label: "Weekly Review",
          accelerator: "CmdOrCtrl+W",
          click: () => {
            console.log("Menu: Show weekly review triggered")
            if (mainWindow) {
              mainWindow.webContents.send("show-weekly-review")
            }
          },
        },
        { type: "separator" },
        {
          label: "Focus Mode",
          accelerator: "CmdOrCtrl+F",
          click: () => {
            console.log("Menu: Focus mode triggered")
            if (mainWindow) {
              mainWindow.webContents.send("show-focus-mode")
            }
          },
        },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ]

  // macOS specific menu adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    })

    // Window menu adjustments for macOS
    template[5].submenu = [
      { role: "close" },
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
    ]
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  console.log("Application menu created")
}

/**
 * Error Handling
 */
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason)
})

// Graceful shutdown
app.on("before-quit", async () => {
  console.log("App shutting down, closing database...")
  if (database) {
    database.close()
  }
})
