'use client'

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
import { RightPanel } from "@/components/right-panel"
import { DailySchedule } from "@/components/daily-schedule"
import { ThemeProvider } from "@/components/theme-provider"
import { TimerProvider } from "@/contexts/timer-context"
import { AchievementProvider } from "@/contexts/achievement-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { Toaster } from "sonner"
import { db, AutoSave } from "@/lib/database"
import { Event, Task, Habit, Goal, Note, JournalEntry, Reminder, Achievement, DatabaseData, ScheduleItem } from "@/types"

export default function Home() {
  const [activeSection, setActiveSection] = useState("calendar")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null);

  // Sample data states
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [journals, setJournals] = useState<JournalEntry[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])

  // Initialize auto-save
  const autoSave = AutoSave.getInstance()

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const data = await db.getAllData()
        if (data) {
          setEvents(data.events || [])
          setTasks(data.tasks || [])
          setHabits(data.habits || [])
          setGoals(data.goals || [])
          setNotes(data.notes || [])
          setJournals(data.journals || [])
          setReminders(data.reminders || [])
          setSchedule(data.schedule || [])
          console.log("Fetched Achievements:", data.achievements);
          setAchievements(data.achievements || [])
          
          // Update sidebar with username from settings
          if (data.settings && data.settings.name) {
            window.dispatchEvent(new CustomEvent("userDataUpdated", {
              detail: { 
                username: data.settings.name,
                avatar: data.settings.avatar || null
              }
            }))
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError(error as Error);
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Auto-save data when it changes
  useEffect(() => {
    if (!isLoading) {
      autoSave.queueSave("events", events)
    }
  }, [events, isLoading, autoSave])

  useEffect(() => {
    if (!isLoading) {
      autoSave.queueSave("tasks", tasks)
    }
  }, [tasks, isLoading, autoSave])

  useEffect(() => {
    if (!isLoading) {
      autoSave.queueSave("habits", habits)
    }
  }, [habits, isLoading, autoSave])

  useEffect(() => {
    if (!isLoading) {
      autoSave.queueSave("goals", goals)
    }
  }, [goals, isLoading, autoSave])

  useEffect(() => {
    if (!isLoading) {
      autoSave.queueSave("notes", notes)
    }
  }, [notes, isLoading, autoSave])

  useEffect(() => {
    if (!isLoading) {
      autoSave.queueSave("journals", journals)
    }
  }, [journals, isLoading, autoSave])

  useEffect(() => {
    if (!isLoading) {
      autoSave.queueSave("reminders", reminders)
    }
  }, [reminders, isLoading, autoSave])

  useEffect(() => {
    if (!isLoading) {
      autoSave.queueSave("schedule", schedule)
    }
  }, [schedule, isLoading, autoSave])

  // Save data before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      autoSave.forceSave()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [autoSave])

  const handleSaveScheduleEvent = async (eventToSave: ScheduleItem) => {
    const eventsOnSameDay = schedule.filter(
      (event) =>
        event.date === eventToSave.date &&
        event.id !== eventToSave.id &&
        event.eventType === "schedule"
    );
  
    const newStartTime = new Date(`${eventToSave.date}T${eventToSave.startTime}`).getTime();
    const newEndTime = new Date(`${eventToSave.date}T${eventToSave.endTime}`).getTime();
  
    for (const existingEvent of eventsOnSameDay) {
      if (existingEvent.startTime && existingEvent.endTime) {
        const existingStartTime = new Date(
          `${existingEvent.date}T${existingEvent.startTime}`
        ).getTime();
        const existingEndTime = new Date(
          `${existingEvent.date}T${existingEvent.endTime}`
        ).getTime();
  
        if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
          throw new Error(`Time conflict with event: "${existingEvent.title}"`);
        }
      }
    }
  
    setSchedule((prevSchedule) => {
      const eventIndex = prevSchedule.findIndex((e) => e.id === eventToSave.id);
      if (eventIndex !== -1) {
        const updatedSchedule = [...prevSchedule];
        updatedSchedule[eventIndex] = eventToSave;
        return updatedSchedule;
      } else {
        return [...prevSchedule, eventToSave];
      }
    });
  };
  
  const handleDeleteScheduleEvent = async (eventId: string) => {
    setSchedule((prevSchedule) => prevSchedule.filter((e) => e.id !== eventId));
  };

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
            <Habits habits={habits} setHabits={setHabits} achievements={achievements} setAchievements={setAchievements} />
          </div>
        )
      case "goals":
        return (
          <div {...sectionProps}>
            <Goals goals={goals} setGoals={setGoals} achievements={achievements} setAchievements={setAchievements} />
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
      case "schedule":
        return (
          <div {...sectionProps}>
            <DailySchedule 
              events={schedule as any}
              isLoading={isLoading}
              error={error}
              onSaveEvent={handleSaveScheduleEvent as any}
              onDeleteEvent={handleDeleteScheduleEvent}
            />
          </div>
        )
      case "analytics":
        return (
          <div {...sectionProps}>
            <Analytics tasks={tasks} habits={habits} goals={goals} journals={journals} events={events} achievements={achievements} />
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
  }, [activeSection, events, tasks, habits, goals, notes, journals, reminders, schedule, isLoading, error, achievements])

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
        <AchievementProvider achievements={achievements} setAchievements={setAchievements}>
          <TimerProvider>
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
              <div className="flex h-screen">
                <Sidebar 
                  activeSection={activeSection} 
                  setActiveSection={setActiveSection} 
                  isCollapsed={isCollapsed}
                  setIsCollapsed={setIsCollapsed}
                />

                <main className="flex-1 overflow-hidden">
                  <div className="h-full p-6">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        {renderActiveSection}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </main>

                {/* Right Panel */}
                <RightPanel events={events} activeSection={activeSection} />
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
