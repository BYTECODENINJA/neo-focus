"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Bell, Clock, Calendar, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/contexts/notification-context"

import { Reminder } from "@/types"

interface RemindersProps {
  reminders: Reminder[]
  setReminders: (reminders: Reminder[]) => void
}

export function Reminders({ reminders, setReminders }: RemindersProps) {
  const [showAddReminder, setShowAddReminder] = useState(false)
  const [newReminder, setNewReminder] = useState({
    title: "",
    message: "",
    type: "general" as const,
    time: "",
    days: [] as number[],
    date: "", // For one-time reminders
    isOneTime: false, // Flag for one-time reminder
  })

  const { showNotification } = useNotifications()

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const reminderTypes = [
    { value: "general", label: "General", icon: "📋" },
    { value: "task", label: "Task", icon: "✅" },
    { value: "habit", label: "Habit", icon: "🎯" },
    { value: "break", label: "Break", icon: "☕" },
    { value: "hydration", label: "Hydration", icon: "💧" },
    { value: "custom", label: "Custom", icon: "🔔" },
  ]

  // Check for due reminders every minute
  useEffect(() => {
    // Check reminders immediately when component mounts
    const checkReminders = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      const currentDay = now.getDay()
      const currentDate = now.toISOString().split('T')[0]

      reminders.forEach((reminder: any) => {
        if (!reminder.enabled) return
        
        // Check one-time reminders
        if (reminder.isOneTime && reminder.date) {
          if (reminder.time === currentTime && reminder.date === currentDate) {
            // Play sound when reminder is triggered
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(err => console.error("Error playing notification sound:", err));
            
            // Show notification
            showNotification(reminder.title, reminder.message)
            
            // Fallback notification using alert if permissions not granted
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
              alert(`Reminder: ${reminder.title}\n${reminder.message}`);
            }
            
            // Disable the one-time reminder after showing
            setReminders(prevReminders => 
              prevReminders.map(r => r.id === reminder.id ? { ...r, enabled: false } : r)
            )
          }
          return
        }
        
        // Check recurring reminders
        if (
          reminder.time === currentTime &&
          (reminder.days.length === 0 || reminder.days.includes(currentDay))
        ) {
          // Play sound when reminder is triggered
          const audio = new Audio('/notification-sound.mp3');
          audio.play().catch(err => console.error("Error playing notification sound:", err));
          
          // Show notification
          showNotification(reminder.title, reminder.message)
          
          // Fallback notification using alert if permissions not granted
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission !== "granted") {
            alert(`Reminder: ${reminder.title}\n${reminder.message}`);
          }
        }
      })
    }

    // Check immediately on mount and when reminders change
    checkReminders();
    
    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds instead of 60 seconds
    return () => clearInterval(interval)
  }, [reminders, showNotification])

  const addReminder = () => {
    if (newReminder.title && newReminder.time) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: newReminder.title,
        message: newReminder.message,
        type: newReminder.type,
        time: newReminder.time,
        days: newReminder.days,
        enabled: true,
        created_at: new Date().toISOString(),
        isOneTime: newReminder.isOneTime || false,
        date: newReminder.date || "",
      } as any
      setReminders([reminder, ...reminders])
      setNewReminder({ title: "", message: "", type: "general", time: "", days: [], date: "", isOneTime: false })
      setShowAddReminder(false)
    }
  }

  const toggleReminder = (reminderId: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, enabled: !reminder.enabled } : reminder,
      ),
    )
  }

  const deleteReminder = (reminderId: string) => {
    setReminders(reminders.filter((reminder) => reminder.id !== reminderId))
  }

  const getReminderTypeInfo = (type: string) => {
    return reminderTypes.find((t) => t.value === type) || reminderTypes[0]
  }

  const getScheduleText = (reminder: Reminder) => {
    const days = reminder.days || [];
    if (days.length === 0) {
      return "Daily"
    } else if (days.length === 7) {
      return "Every day"
    } else if (days.length === 5 && days.every((d) => d >= 1 && d <= 5)) {
      return "Weekdays"
    } else if (days.length === 2 && days.includes(0) && days.includes(6)) {
      return "Weekends"
    } else {
      return days.map((d) => dayNames[d]).join(", ")
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-4xl font-bold">Reminders</h1>
        <Button onClick={() => setShowAddReminder(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus size={20} className="mr-2" />
          Add Reminder
        </Button>
      </motion.div>

      {/* Reminders List */}
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-200px)]">
        <AnimatePresence>
          {reminders.map((reminder, index) => {
            const typeInfo = getReminderTypeInfo(reminder.type)

            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6 ${
                  !reminder.enabled ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <h3 className="text-lg font-bold">{reminder.title}</h3>
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                        {typeInfo.label}
                      </span>
                    </div>

                    {reminder.message && (
                      <p className="text-white/60 dark:text-gray-400 text-sm mb-3">{reminder.message}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-white/60 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{reminder.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{getScheduleText(reminder)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => toggleReminder(reminder.id)} variant="ghost" size="sm" className="p-2">
                      {reminder.enabled ? (
                        <ToggleRight size={20} className="text-green-400" />
                      ) : (
                        <ToggleLeft size={20} className="text-gray-400" />
                      )}
                    </Button>
                    <Button
                      onClick={() => deleteReminder(reminder.id)}
                      variant="ghost"
                      size="sm"
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {reminders.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-12 text-center"
          >
            <Bell size={48} className="mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-bold mb-2">No reminders set</h3>
            <p className="text-white/60 dark:text-gray-400 mb-4">
              Create reminders to stay on top of your tasks and habits
            </p>
            <Button onClick={() => setShowAddReminder(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Plus size={16} className="mr-2" />
              Add Your First Reminder
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showAddReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900 to-indigo-900 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-white/20 dark:border-gray-700/50 w-96 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold mb-4">Add New Reminder</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Reminder title"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400"
                />

                <textarea
                  placeholder="Message (optional)"
                  value={newReminder.message}
                  onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400 h-20 resize-none"
                />

                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as any })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white"
                >
                  {reminderTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="oneTime"
                    checked={newReminder.isOneTime}
                    onChange={(e) => setNewReminder({ ...newReminder, isOneTime: e.target.checked, days: [] })}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="oneTime" className="text-sm text-white/80">
                    One-time reminder
                  </label>
                </div>

                {newReminder.isOneTime && (
                  <input
                    type="date"
                    value={newReminder.date}
                    onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white"
                  />
                )}

                {!newReminder.isOneTime && (
                <div>
                  <p className="text-sm text-white/60 dark:text-gray-400 mb-2">Repeat on (leave empty for daily):</p>
                  <div className="flex gap-2 flex-wrap">
                    {dayNames.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const newDays = newReminder.days.includes(index)
                            ? newReminder.days.filter((d) => d !== index)
                            : [...newReminder.days, index]
                          setNewReminder({ ...newReminder, days: newDays })
                        }}
                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                          newReminder.days.includes(index)
                            ? "bg-purple-500 text-white"
                            : "bg-white/10 dark:bg-gray-700/50 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={addReminder} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
                    Add Reminder
                  </Button>
                  <Button onClick={() => setShowAddReminder(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
