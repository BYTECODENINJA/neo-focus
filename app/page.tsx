"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Calendar } from "@/components/calendar"
import { Tasks } from "@/components/tasks"
import { Habits } from "@/components/habits"
import { Goals } from "@/components/goals"
import { Notebook } from "@/components/notebook"
import { Journal } from "@/components/journal"
import { Reminders } from "@/components/reminders"
import { Analytics } from "@/components/analytics"
import { UserSettings } from "@/components/user-settings"
import { FocusMode } from "@/components/focus-mode"
import { ThemeProvider } from "@/components/theme-provider"
import { TimerProvider } from "@/contexts/timer-context"
import { AchievementProvider } from "@/contexts/achievement-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { Toaster } from "sonner"
import { Schedule } from "@/components/schedule"
import { RightPanel } from "@/components/right-panel"
import { PasswordDialog } from "@/components/password-dialog"

export default function Home() {
  const [activeSection, setActiveSection] = useState("calendar")
  const [activeView, setActiveView] = useState("calendar")
  const [isLoading, setIsLoading] = useState(true)

  // Sample data states
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Team Meeting",
      date: "2024-01-15",
      time: "10:00",
      type: "meeting" as const,
      description: "Weekly team sync",
      alarmEnabled: true,
    },
    {
      id: "2",
      title: "Project Deadline",
      date: "2024-01-20",
      time: "17:00",
      type: "important" as const,
      description: "Submit final project",
      alarmEnabled: true,
    },
  ])

  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Complete project proposal",
      completed: false,
      priority: "high" as const,
      dueDate: "2024-01-18",
      category: "work",
    },
    {
      id: "2",
      title: "Review code changes",
      completed: true,
      priority: "medium" as const,
      dueDate: "2024-01-16",
      category: "work",
    },
  ])

  const [habits, setHabits] = useState([
    {
      id: "1",
      name: "Morning Exercise",
      streak: 5,
      target: 30,
      completed: false,
      category: "health",
    },
    {
      id: "2",
      name: "Read for 30 minutes",
      streak: 12,
      target: 21,
      completed: true,
      category: "learning",
    },
  ])

  const [goals, setGoals] = useState([
    {
      id: "1",
      title: "Learn Advanced React",
      description: "Master React patterns and performance optimization",
      category: "learning",
      priority: "high",
      status: "in-progress",
      progress: 65,
      targetDate: "2024-03-01",
      createdAt: new Date().toISOString(),
      milestones: [
        { id: "1", title: "Complete hooks course", completed: true },
        { id: "2", title: "Build portfolio project", completed: false },
      ],
    },
  ])

  const [notes, setNotes] = useState([
    {
      id: "1",
      title: "Meeting Notes",
      content: "Important points from today's meeting...",
      category: "Work",
      tags: ["meeting", "planning"],
      createdAt: new Date().toISOString(),
      isPinned: true,
    },
  ])

  const [journals, setJournals] = useState([
    {
      id: "1",
      title: "Today's Reflection",
      content:
        "Today was a productive day. I managed to complete most of my tasks and learned something new about React optimization.",
      mood: "good",
      energy: 8,
      gratitude: "Grateful for the opportunity to learn and grow",
      reflection: "I should continue focusing on one task at a time",
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      formatting: {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 16,
        textAlign: "left",
        highlights: [],
      },
    },
  ])

  const [reminders, setReminders] = useState([
    {
      id: "1",
      title: "Daily standup",
      description: "Team standup meeting",
      type: "recurring",
      datetime: "2024-01-16T09:00:00",
      isCompleted: false,
      priority: "medium",
      category: "work",
      recurrence: {
        frequency: "daily",
        interval: 1,
      },
      createdAt: new Date().toISOString(),
    },
  ])

  // Initialize app
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Memoized render function to prevent unnecessary re-renders
  const renderActiveSection = useMemo(() => {
    const sectionProps = {
      className: "h-full overflow-hidden",
    }

    switch (activeSection) {
      case "calendar":
        return (
          <div {...sectionProps}>
            <Calendar events={events} setEvents={setEvents} />
          </div>
        )
      case "tasks":
        return (
          <div {...sectionProps}>
            <Tasks tasks={tasks} setTasks={setTasks} />
          </div>
        )
      case "habits":
        return (
          <div {...sectionProps}>
            <Habits habits={habits} setHabits={setHabits} />
          </div>
        )
      case "goals":
        return (
          <div {...sectionProps}>
            <Goals goals={goals} setGoals={setGoals} />
          </div>
        )
      case "notebook":
        return (
          <div {...sectionProps}>
            <Notebook notes={notes} setNotes={setNotes} />
          </div>
        )
      case "journal":
        return (
          <div {...sectionProps}>
            <Journal journals={journals} setJournals={setJournals} />
          </div>
        )
      case "reminders":
        return (
          <div {...sectionProps}>
            <Reminders reminders={reminders} setReminders={setReminders} />
          </div>
        )
      case "analytics":
        return (
          <div {...sectionProps}>
            <Analytics tasks={tasks} habits={habits} goals={goals} journals={journals} />
          </div>
        )
      case "focus":
        return (
          <div {...sectionProps}>
            <FocusMode />
          </div>
        )
      case "settings":
        return (
          <div {...sectionProps}>
            <UserSettings />
          </div>
        )
      default:
        return (
          <div {...sectionProps}>
            <Calendar events={events} setEvents={setEvents} />
          </div>
        )
    }
  }, [activeSection, events, tasks, habits, goals, notes, journals, reminders])

  const renderView = () => {
    switch (activeView) {
      case "calendar":
        return <Calendar events={events} setEvents={setEvents} />
      case "tasks":
        return <Tasks tasks={tasks} setTasks={setTasks} />
      case "habits":
        return <Habits habits={habits} setHabits={setHabits} />
      case "goals":
        return <Goals goals={goals} setGoals={setGoals} />
      case "notebook":
        return <Notebook notes={notes} setNotes={setNotes} />
      case "journal":
        return <Journal journals={journals} setJournals={setJournals} />
      case "schedule":
        return <Schedule />
      case "settings":
        return <UserSettings />
      default:
        return <Calendar events={events} setEvents={setEvents} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">AURA Focus</h2>
          <p className="text-white/60">Loading your workspace...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <NotificationProvider>
        <AchievementProvider>
          <TimerProvider>
            <div
              id="app-container"
              className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
            >
              <PasswordDialog />
              <div className="flex h-screen overflow-hidden">
                <Sidebar activeView={activeView} onViewChange={setActiveView} />
                <main className="flex-1 overflow-auto p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeView}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      {renderView()}
                    </motion.div>
                  </AnimatePresence>
                </main>
                {activeView !== "timer" && activeView !== "settings" && <RightPanel />}
              </div>

              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "rgba(0, 0, 0, 0.8)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                  },
                }}
              />
            </div>
          </TimerProvider>
        </AchievementProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}
