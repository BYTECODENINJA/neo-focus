/**
 * Database Interface
 * Handles data persistence for both web and Electron environments
 * Provides fallback to localStorage for web version
 */

interface DatabaseData {
  events: any[]
  tasks: any[]
  habits: any[]
  goals: any[]
  notes: any[]
  journals: any[]
  reminders: any[]
  achievements: any[]
  settings: Record<string, any>
}

class Database {
  private isElectron: boolean

  constructor() {
    this.isElectron = typeof window !== "undefined" && !!window.electronAPI
    console.log("Database initialized:", this.isElectron ? "Electron mode" : "Web mode")
  }

  /**
   * Get all data from storage
   */
  async getAllData(): Promise<DatabaseData | null> {
    try {
      console.log("Fetching data from localStorage...")
      const data = localStorage.getItem("neofocus-data")
      return data ? JSON.parse(data) : this.getDefaultData()
    } catch (error) {
      console.error("Error getting all data:", error)
      return this.getDefaultData()
    }
  }

  /**
   * Save events data
   */
  async saveEvents(events: any[]): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, events }
      localStorage.setItem("neofocus-data", JSON.stringify(updatedData))
      console.log("Events saved successfully")
    } catch (error) {
      console.error("Error saving events:", error)
      throw error
    }
  }

  /**
   * Save tasks data
   */
  async saveTasks(tasks: any[]): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, tasks }
      localStorage.setItem("neofocus-data", JSON.stringify(updatedData))
      console.log("Tasks saved successfully")
    } catch (error) {
      console.error("Error saving tasks:", error)
      throw error
    }
  }

  /**
   * Save habits data
   */
  async saveHabits(habits: any[]): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, habits }
      localStorage.setItem("neofocus-data", JSON.stringify(updatedData))
      console.log("Habits saved successfully")
    } catch (error) {
      console.error("Error saving habits:", error)
      throw error
    }
  }

  /**
   * Save goals data
   */
  async saveGoals(goals: any[]): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, goals }
      localStorage.setItem("neofocus-data", JSON.stringify(updatedData))
      console.log("Goals saved successfully")
    } catch (error) {
      console.error("Error saving goals:", error)
      throw error
    }
  }

  /**
   * Save notes data
   */
  async saveNotes(notes: any[]): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, notes }
      localStorage.setItem("neofocus-data", JSON.stringify(updatedData))
      console.log("Notes saved successfully")
    } catch (error) {
      console.error("Error saving notes:", error)
      throw error
    }
  }

  /**
   * Save journals data
   */
  async saveJournals(journals: any[]): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, journals }
      localStorage.setItem("neofocus-data", JSON.stringify(updatedData))
      console.log("Journals saved successfully")
    } catch (error) {
      console.error("Error saving journals:", error)
      throw error
    }
  }

  /**
   * Save reminders data
   */
  async saveReminders(reminders: any[]): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, reminders }
      localStorage.setItem("neofocus-data", JSON.stringify(updatedData))
      console.log("Reminders saved successfully")
    } catch (error) {
      console.error("Error saving reminders:", error)
      throw error
    }
  }

  /**
   * Save settings data
   */
  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, settings }
      localStorage.setItem("neofocus-data", JSON.stringify(updatedData))
      console.log("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      throw error
    }
  }

  /**
   * Get default data structure
   */
  private getDefaultData(): DatabaseData {
    return {
      events: [],
      tasks: [],
      habits: [],
      goals: [],
      notes: [],
      journals: [],
      reminders: [],
      achievements: [],
      settings: {},
    }
  }
}

/**
 * Auto-save functionality with debouncing
 */
export class AutoSave {
  private static instance: AutoSave
  private saveQueue: Map<string, any> = new Map()
  private saveTimeout: NodeJS.Timeout | null = null
  private readonly SAVE_DELAY = 1000 // 1 second debounce

  private constructor() {}

  static getInstance(): AutoSave {
    if (!AutoSave.instance) {
      AutoSave.instance = new AutoSave()
    }
    return AutoSave.instance
  }

  /**
   * Queue data for auto-save with debouncing
   */
  queueSave(type: string, data: any): void {
    this.saveQueue.set(type, data)

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }

    // Set new timeout
    this.saveTimeout = setTimeout(() => {
      this.processSaveQueue()
    }, this.SAVE_DELAY)
  }

  /**
   * Force immediate save of all queued data
   */
  async forceSave(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    await this.processSaveQueue()
  }

  /**
   * Process the save queue
   */
  private async processSaveQueue(): Promise<void> {
    if (this.saveQueue.size === 0) return

    console.log("Processing auto-save queue...")

    try {
      const promises: Promise<void>[] = []

      for (const [type, data] of this.saveQueue) {
        switch (type) {
          case "events":
            promises.push(db.saveEvents(data))
            break
          case "tasks":
            promises.push(db.saveTasks(data))
            break
          case "habits":
            promises.push(db.saveHabits(data))
            break
          case "goals":
            promises.push(db.saveGoals(data))
            break
          case "notes":
            promises.push(db.saveNotes(data))
            break
          case "journals":
            promises.push(db.saveJournals(data))
            break
          case "reminders":
            promises.push(db.saveReminders(data))
            break
          case "settings":
            promises.push(db.saveSettings(data))
            break
        }
      }

      await Promise.all(promises)
      console.log("Auto-save completed successfully")
      this.saveQueue.clear()
    } catch (error) {
      console.error("Auto-save failed:", error)
    }
  }
}

// Export singleton instance
export const db = new Database()
