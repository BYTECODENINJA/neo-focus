/**
 * TypeScript declarations for Electron API
 * Provides type safety for the electronAPI exposed through preload script
 */

export interface ElectronAPI {
  // Database operations
  getAllData: () => Promise<{
    events: any[]
    tasks: any[]
    habits: any[]
    goals: any[]
    notes: any[]
    journals: any[]
    reminders: any[]
    achievements: any[]
    settings: Record<string, any>
  } | null>

  saveEvents: (events: any[]) => Promise<{ success: boolean; error?: string }>
  saveTasks: (tasks: any[]) => Promise<{ success: boolean; error?: string }>
  saveHabits: (habits: any[]) => Promise<{ success: boolean; error?: string }>
  saveGoals: (goals: any[]) => Promise<{ success: boolean; error?: string }>
  saveNotes: (notes: any[]) => Promise<{ success: boolean; error?: string }>
  saveJournals: (journals: any[]) => Promise<{ success: boolean; error?: string }>
  saveReminders: (reminders: any[]) => Promise<{ success: boolean; error?: string }>
  saveSettings: (settings: any) => Promise<{ success: boolean; error?: string }>

  // Notification system
  showNotification: (notification: {
    title: string
    body: string
    icon?: string
  }) => Promise<{ success: boolean; error?: string }>

  // Menu event listeners
  onMenuNew: (callback: () => void) => void
  onMenuSave: (callback: () => void) => void
  onToggleTheme: (callback: () => void) => void
  onShowAnalytics: (callback: () => void) => void
  onShowDailyReview: (callback: () => void) => void
  onShowWeeklyReview: (callback: () => void) => void
  onMenuExport: (callback: () => void) => void
  onShowFocusMode: (callback: () => void) => void

  // Utility functions
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
