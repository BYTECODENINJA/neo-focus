/**
 * Database Interface
 * Handles data persistence for both web and PyWebView environments
 * Provides fallback to localStorage for web version
 */

import { DatabaseData, Settings } from "@/types"

class Database {
  private isPyWebView: boolean
  private isPythonDesktop: boolean
  private apiBaseUrl: string

  constructor() {
    this.isPyWebView = typeof window !== "undefined" && (window as any).pywebview !== undefined
    // Detect Python desktop environment (served from local HTTP server started by app.py)
    // Also check for file:// protocol which indicates packaged app
    this.isPythonDesktop = typeof window !== "undefined" &&
      ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      window.location.protocol.startsWith('http') ||
      window.location.protocol === 'file:')

    // Derive API base URL from the actual origin so we don't hard-code port 8000
    this.apiBaseUrl = typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost/api'

    console.log("Database initialized:", this.isPyWebView ? "PyWebView mode" : this.isPythonDesktop ? `Python Desktop mode (${this.apiBaseUrl})` : "Web mode")
  }

  /**
   * Get all data from storage
   */
  async getAllData(): Promise<DatabaseData> {
    try {
      if (this.isPyWebView && (window as any).pywebview?.api?.load_data) {
        console.log("Fetching data via PyWebView API...")
        const data = await (window as any).pywebview.api.load_data()
        return this.formatData(data)
      } else if (this.isPythonDesktop) {
        console.log("Fetching data from HTTP API...")
        return await this.getDataFromAPI()
      } else {
        console.log("Fetching data from localStorage...")
        const data = localStorage.getItem("neofocus-data")
        return data ? JSON.parse(data) : this.getDefaultData()
      }
    } catch (error) {
      console.error("Error getting all data:", error)
      return this.getDefaultData()
    }
  }

  /**
   * Get data from HTTP API (for Python desktop)
   */
  private async getDataFromAPI(): Promise<DatabaseData> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/data`)
      if (response.ok) {
        const data = await response.json()
        // Also save to localStorage for immediate access
        localStorage.setItem("neofocus-data", JSON.stringify(data))
        return this.formatData(data)
      } else {
        console.log("No existing data found, using default data")
        return this.getDefaultData()
      }
    } catch (error) {
      console.log("Error reading from API, using default data:", error)
      return this.getDefaultData()
    }
  }

  /**
   * Format data to ensure proper structure
   */
  private formatData(data: any): DatabaseData {
    return {
      events: data.events || [],
      tasks: data.tasks || [],
      habits: data.habits || [],
      goals: data.goals || [],
      notes: data.notes || [],
      journals: data.journals || [],
      reminders: data.reminders || [],
      achievements: data.achievements || [],
      focusSessions: data.focusSessions || [],
      settings: data.settings || {
        name: "User",
        theme: "dark" as const,
        notifications: true,
        autoSave: true,
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4
      },
    }
  }

  /**
   * Save data to storage
   */
  private async saveDataToStorage(data: Partial<DatabaseData>): Promise<void> {
    try {
      // Ensure all required fields are present
      const completeData: DatabaseData = this.formatData(data)
      
      // Save to localStorage for immediate access
      localStorage.setItem("neofocus-data", JSON.stringify(completeData))
      
      if (this.isPyWebView) {
        // Use PyWebView API
        const success = await (window as any).pywebview.api.save_data(completeData)
        if (success) {
          console.log("Data saved successfully via PyWebView")
        } else {
          console.log("Warning: Could not save via PyWebView")
        }
      } else if (this.isPythonDesktop) {
        // Use HTTP API
        const response = await fetch(`${this.apiBaseUrl}/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(completeData)
        })
        if (response.ok) {
          console.log("Data saved successfully via HTTP API")
        } else {
          console.log("Warning: Could not save via HTTP API")
        }
      }
    } catch (error) {
      console.log("Warning: Could not save to storage, but data is saved in localStorage:", error)
    }
  }

  /**
   * Save events data
   */
  async saveEvents(events: any[]): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, events }
      await this.saveDataToStorage(updatedData)
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
      await this.saveDataToStorage(updatedData)
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
      await this.saveDataToStorage(updatedData)
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
      await this.saveDataToStorage(updatedData)
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
      await this.saveDataToStorage(updatedData)
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
      await this.saveDataToStorage(updatedData)
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
      await this.saveDataToStorage(updatedData)
      console.log("Reminders saved successfully")
    } catch (error) {
      console.error("Error saving reminders:", error)
      throw error
    }
  }

  /**
   * Save settings data
   */
  async saveSettings(settings: any): Promise<void> {
    try {
      const currentData = await this.getAllData()
      const updatedData = { ...currentData, settings }
      await this.saveDataToStorage(updatedData)
      console.log("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      throw error
    }
  }

  /**
   * Save all data at once
   */
  async saveAllData(data: DatabaseData): Promise<void> {
    try {
      await this.saveDataToStorage(data)
      console.log("All data saved successfully")
    } catch (error) {
      console.error("Error saving all data:", error)
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
      focusSessions: [],
      settings: {
        name: "User",
        theme: "dark",
        notifications: true,
        autoSave: true,
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4
      },
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
