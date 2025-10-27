/**
 * Unified Type Definitions for NEO FOCUS Application
 * Ensures consistency across all components
 */

// Event interface for calendar and other components
export interface Event {
  id: string
  title: string
  description: string
  date: string // ISO date string (YYYY-MM-DD)
  time: string // Time string (HH:MM)
  location?: string
  type: "work" | "personal" | "health" | "social" | "deadline" | "birthday" | "holiday" | "meeting" | "reminder" | "important" | "other"
  color: string
  createdAt: string
  updatedAt?: string
  comments?: string[]
  eventType: "calendar" | "schedule"
}

// Task interface
export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate: string
  createdAt: string
}

// Habit interface
export interface Habit {
  id: string
  name: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "custom"
  customDays?: number[] // 0 = Sunday, 1 = Monday, etc.
  streak: number
  longestStreak: number
  completedDates: string[]
  createdAt: string
}

// Goal interface
export interface Goal {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "monthly" | "yearly"
  targetValue: number
  currentValue: number
  unit: string
  category: "health" | "career" | "personal" | "finance" | "learning" | "other"
  deadline: string
  completed: boolean
  createdAt: string
}

// Note interface
export interface Note {
  id: string
  title: string
  content: string
  category?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Journal entry interface
export interface JournalEntry {
  id: string
  title: string
  content: string
  mood: "excellent" | "good" | "neutral" | "challenging" | "difficult"
  energy: number
  gratitude: string
  reflection: string
  date: string
  createdAt: string
  formatting?: {
    fontFamily: string
    fontSize: number
    textAlign: "left" | "center" | "right"
    highlights: Array<{
      start: number
      end: number
      color: string
    }>
  }
}

// Reminder interface
export interface Reminder {
  id: string
  title: string
  message: string
  type: "general" | "task" | "habit" | "break" | "hydration" | "custom"
  time: string
  days: number[] // 0 = Sunday, 1 = Monday, etc.
  enabled: boolean
  created_at: string
}

export interface ScheduleItem {
    id: number;
    date: string;
    time: string;
    title: string;
}

// Achievement interface
export interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon?: string
  earnedDate?: string
  createdAt: string
}

// Focus session interface
export interface FocusSession {
  id: string
  title: string
  duration: number // in minutes
  startTime?: string
  endTime?: string
  status: "completed" | "interrupted" | "paused"
  notes?: string
  createdAt: string
}

// Settings interface
export interface Settings {
  name: string
  theme: "light" | "dark" | "system"
  notifications: boolean
  autoSave: boolean
  focusDuration: number
  breakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
  avatar?: string
}

// Database data interface
export interface DatabaseData {
  events: Event[]
  tasks: Task[]
  habits: Habit[]
  goals: Goal[]
  notes: Note[]
  journals: JournalEntry[]
  reminders: Reminder[]
  schedule: ScheduleItem[]
  achievements: Achievement[]
  focusSessions: FocusSession[]
  settings: Settings
}

// Event type configuration
export const eventTypes: Record<Event['type'], { label: string; color: string; bg: string }> = {
  work: { label: "Work", color: "#3b82f6", bg: "bg-blue-500" },
  personal: { label: "Personal", color: "#10b981", bg: "bg-green-500" },
  health: { label: "Health", color: "#f59e0b", bg: "bg-yellow-500" },
  social: { label: "Social", color: "#ec4899", bg: "bg-pink-500" },
  deadline: { label: "Deadline", color: "#ef4444", bg: "bg-red-500" },
  birthday: { label: "Birthday", color: "#f97316", bg: "bg-orange-500" },
  holiday: { label: "Holiday", color: "#06b6d4", bg: "bg-cyan-500" },
  meeting: { label: "Meeting", color: "#8b5cf6", bg: "bg-purple-500" },
  reminder: { label: "Reminder", color: "#10b981", bg: "bg-green-500" },
  important: { label: "Important", color: "#f59e0b", bg: "bg-yellow-500" },
  other: { label: "Other", color: "#8b5cf6", bg: "bg-purple-500" },
}
