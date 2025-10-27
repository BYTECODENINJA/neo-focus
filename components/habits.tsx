"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target, TrendingUp, Award, Flame, AlertCircle, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"
import { useAchievements } from "@/contexts/achievement-context"

import { Habit } from "@/types"

interface HabitsProps {
  habits: Habit[]
  setHabits: (habits: Habit[]) => void
  achievements: any[]
  setAchievements: (achievements: any[]) => void
}

export function Habits({ habits, setHabits, achievements, setAchievements }: HabitsProps) {
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [showDateNotice, setShowDateNotice] = useState(false)
  const [dateNoticeMessage, setDateNoticeMessage] = useState("")
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily" as "daily" | "weekly" | "monthly" | "custom",
    customDays: [] as number[],
  })
  const { addAchievement } = useAchievements()

  const today = new Date().toISOString().split("T")[0]

  const addHabit = () => {
    console.log("addHabit called", { newHabit, habits })
    if (newHabit.name) {
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabit.name,
        description: newHabit.description,
        frequency: newHabit.frequency,
        customDays: newHabit.frequency === "custom" ? newHabit.customDays : undefined,
        streak: 0,
        longestStreak: 0,
        completedDates: [],
        createdAt: new Date().toISOString(),
      }
      console.log("Creating habit:", habit)
      setHabits([habit, ...habits])
      setNewHabit({ name: "", description: "", frequency: "daily", customDays: [] })
      setShowAddHabit(false)
      console.log("Habit added successfully")
    } else {
      console.log("No habit name provided")
    }
  }

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter((habit) => habit.id !== habitId))
  }

  const toggleHabitCompletion = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return

    const isCompletedToday = (habit.completedDates || []).includes(today)
    
    // If trying to unmark a completed habit, check if it's allowed
    if (isCompletedToday) {
      const today = new Date()
      const todayDay = today.getDay()
      const todayDate = today.getDate()
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
      
      let canUnmark = false
      let message = ""
      
      switch (habit.frequency) {
        case "daily":
          // For daily habits, can unmark after the next day is completed
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          const tomorrowStr = tomorrow.toISOString().split("T")[0]
          canUnmark = (habit.completedDates || []).includes(tomorrowStr)
          if (!canUnmark) {
            message = "Daily habits can only be unmarked after the next day's completion."
          }
          break
          
        case "weekly":
          // For weekly habits, can unmark after the next Sunday is completed
          const nextSunday = new Date()
          const daysUntilNextSunday = (7 - todayDay) % 7
          nextSunday.setDate(today.getDate() + daysUntilNextSunday)
          const nextSundayStr = nextSunday.toISOString().split("T")[0]
          canUnmark = (habit.completedDates || []).includes(nextSundayStr)
          if (!canUnmark) {
            message = `Weekly habits can only be unmarked after the next Sunday (${nextSunday.toLocaleDateString()}).`
          }
          break
          
        case "monthly":
          // For monthly habits, can unmark after the next last day of month is completed
          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          const nextMonthLastDayStr = nextMonth.toISOString().split("T")[0]
          canUnmark = (habit.completedDates || []).includes(nextMonthLastDayStr)
          if (!canUnmark) {
            message = `Monthly habits can only be unmarked after the next last day of month (${nextMonth.toLocaleDateString()}).`
          }
          break
          
        case "custom":
          // For custom habits, can unmark after the next custom day is completed
          const nextCustomDay = getNextCustomDay(habit)
          if (nextCustomDay) {
            const nextCustomDayStr = nextCustomDay.toISOString().split("T")[0]
            canUnmark = (habit.completedDates || []).includes(nextCustomDayStr)
            if (!canUnmark) {
              message = `Custom habits can only be unmarked after the next scheduled day (${nextCustomDay.toLocaleDateString()}).`
            }
          } else {
            canUnmark = true // If no next custom day, allow unmarking
          }
          break
          
        default:
          canUnmark = true
      }
      
      if (!canUnmark) {
        setDateNoticeMessage(message)
        setShowDateNotice(true)
        
        // Auto-hide the notice after 4 seconds
        setTimeout(() => {
          setShowDateNotice(false)
        }, 4000)
        
        return
      }
    }

    // Check if habit is due today before allowing completion
    if (!isCompletedToday && !isHabitDueToday(habit)) {
      let message = ""
      const today = new Date()
      const todayDay = today.getDay()
      const todayDate = today.getDate()
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
      
      if (habit.frequency === "weekly") {
        const daysUntilSunday = (7 - todayDay) % 7
        const nextSunday = new Date()
        nextSunday.setDate(today.getDate() + daysUntilSunday)
        message = `This weekly habit can only be completed on Sundays. Next completion date: ${nextSunday.toLocaleDateString()}`
      } else if (habit.frequency === "monthly") {
        const daysUntilEndOfMonth = lastDayOfMonth - todayDate
        const lastDayDate = new Date(today.getFullYear(), today.getMonth(), lastDayOfMonth)
        message = `This monthly habit can only be completed on the last day of the month. Next completion date: ${lastDayDate.toLocaleDateString()}`
      }
      
      setDateNoticeMessage(message)
      setShowDateNotice(true)
      
      // Auto-hide the notice after 4 seconds
      setTimeout(() => {
        setShowDateNotice(false)
      }, 4000)
      
      return
    }

    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const isCompletedToday = (habit.completedDates || []).includes(today)
          let newCompletedDates: string[]
          let newStreak = habit.streak
          let newLongestStreak = habit.longestStreak

          if (isCompletedToday) {
            // Remove today's completion
            newCompletedDates = habit.completedDates.filter((date) => date !== today)
            newStreak = Math.max(0, habit.streak - 1)
          } else {
            // Add today's completion
            newCompletedDates = [...(habit.completedDates || []), today]

            // Calculate new streak
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split("T")[0]

            if ((habit.completedDates || []).includes(yesterdayStr) || habit.streak === 0) {
              newStreak = habit.streak + 1
            } else {
              newStreak = 1
            }

            newLongestStreak = Math.max(newLongestStreak, newStreak)

            // Trigger celebration and achievements
            if (newStreak > 0) {
              triggerCelebration()
              checkAchievements(habit.name, newStreak, newLongestStreak)
            }
          }

          return {
            ...habit,
            completedDates: newCompletedDates,
            streak: newStreak,
            longestStreak: newLongestStreak,
          }
        }
        return habit
      })
    )
  }

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#3b82f6", "#10b981"],
    })
  }

  const checkAchievements = (habitName: string, streak: number, longestStreak: number) => {
    const milestones = [7, 30, 100, 365]

    milestones.forEach((milestone) => {
      if (streak === milestone) {
        addAchievement({
          createdAt: new Date().toISOString(),
          type: "habit_streak",
          title: `${milestone} Day Streak!`,
          description: `Completed "${habitName}" for ${milestone} days in a row`,
          icon: milestone >= 100 ? "🔥" : milestone >= 30 ? "⚡" : "🌟",
        })
      }
    })
  }

  const isHabitDueToday = (habit: Habit) => {
    const today = new Date()
    const todayDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const todayDate = today.getDate()
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

    switch (habit.frequency) {
      case "daily":
        return true
      case "weekly":
        return todayDay === 0 // Sunday (last day of week)
      case "monthly":
        return todayDate === lastDayOfMonth // Last day of current month
      case "custom":
        return habit.customDays?.includes(todayDay) || false
      default:
        return true
    }
  }

  const getCompletionRate = (habit: Habit) => {
    const daysSinceCreated =
      Math.floor((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Math.round((((habit.completedDates || []).length) / daysSinceCreated) * 100)
  }

  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push({
        date: date.toISOString().split("T")[0],
        day: date.getDate(),
        isToday: i === 0,
      })
    }
    return days
  }

  const getNextCustomDay = (habit: Habit) => {
    if (!habit.customDays || habit.customDays.length === 0) return null
    
    const today = new Date()
    const todayDay = today.getDay()
    
    // Find the next custom day
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date()
      checkDate.setDate(today.getDate() + i)
      const checkDay = checkDate.getDay()
      
      if (habit.customDays.includes(checkDay)) {
        return checkDate
      }
    }
    
    return null
  }

  const last7Days = getLast7Days()
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="flex-1">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-4xl font-bold">Habits</h1>
        <Button onClick={() => {
          console.log("Add Habit button clicked")
          setShowAddHabit(true)
        }} className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus size={20} className="mr-2" />
          Add Habit
        </Button>
      </motion.div>

      {/* Date Notice Card */}
      {showDateNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6 bg-yellow-500/20 backdrop-blur-lg rounded-xl border border-yellow-500/30 p-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-400 mb-1">Habit Schedule Restriction</h4>
              <p className="text-white/80 text-sm">{dateNoticeMessage}</p>
            </div>
            <button
              onClick={() => setShowDateNotice(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Habits Grid */}
      <div className="h-full overflow-y-auto">
        <div className="grid gap-6 max-h-[800px] overflow-y-auto">
          <AnimatePresence>
            {habits.map((habit, index) => {
              const isCompletedToday = (habit.completedDates || []).includes(today)
              const completionRate = getCompletionRate(habit)
              const isDueToday = isHabitDueToday(habit)

              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{habit.name}</h3>
                        {habit.streak > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-1 bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-sm"
                          >
                            <Flame size={14} />
                            {habit.streak}
                          </motion.div>
                        )}
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full capitalize">
                          {habit.frequency}
                        </span>
                      </div>
                      {habit.description && (
                        <p className="text-white/60 dark:text-gray-400 text-sm mb-3">{habit.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => toggleHabitCompletion(habit.id)}
                        disabled={!isDueToday}
                        className={`${
                          isCompletedToday
                            ? "bg-green-600 hover:bg-green-700"
                            : isDueToday
                              ? "bg-white/10 hover:bg-white/20"
                              : "bg-gray-500/20 cursor-not-allowed"
                        }`}
                      >
                        {isCompletedToday ? "Completed" : isDueToday ? "Mark Done" : "Not Due"}
                      </Button>
                      <Button
                        onClick={() => deleteHabit(habit.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 border-red-400/30"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Flame size={16} className="text-orange-400" />
                        <span className="text-white/60 dark:text-gray-400 text-sm">Streak</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-400">{habit.streak}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Award size={16} className="text-yellow-400" />
                        <span className="text-white/60 dark:text-gray-400 text-sm">Best</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">{habit.longestStreak}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp size={16} className="text-green-400" />
                        <span className="text-white/60 dark:text-gray-400 text-sm">Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">{completionRate}%</p>
                    </div>
                  </div>

                  {/* 7-Day Progress */}
                  <div>
                    <p className="text-white/60 dark:text-gray-400 text-sm mb-2">Last 7 days</p>
                    <div className="flex gap-1">
                      {last7Days.map((day) => {
                        const isCompleted = (habit.completedDates || []).includes(day.date)
                        return (
                          <motion.div
                            key={day.date}
                            whileHover={{ scale: 1.1 }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : day.isToday
                                  ? "bg-white/20 text-white border border-white/30"
                                  : "bg-white/5 text-white/40"
                            }`}
                          >
                            {day.day}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom Days Display */}
                  {habit.frequency === "custom" && habit.customDays && (
                    <div className="mt-4">
                      <p className="text-white/60 dark:text-gray-400 text-sm mb-2">Schedule</p>
                      <div className="flex gap-1">
                        {dayNames.map((day, index) => (
                          <div
                            key={day}
                            className={`px-2 py-1 rounded text-xs ${
                              habit.customDays?.includes(index)
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-white/5 text-white/40"
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {habits.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-12 text-center"
            >
              <Target size={48} className="mx-auto mb-4 text-white/40" />
              <h3 className="text-xl font-bold mb-2">No habits yet</h3>
              <p className="text-white/60 dark:text-gray-400 mb-4">Start building better habits today</p>
              <Button onClick={() => setShowAddHabit(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Plus size={16} className="mr-2" />
                Add Your First Habit
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
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
              <h3 className="text-xl font-bold mb-4">Add New Habit</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Habit name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400 h-20 resize-none"
                />
                <select
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value as any })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Days</option>
                </select>

                {newHabit.frequency === "custom" && (
                  <div>
                    <p className="text-sm text-white/60 dark:text-gray-400 mb-2">Select days:</p>
                    <div className="flex gap-2 flex-wrap">
                      {dayNames.map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const newDays = newHabit.customDays.includes(index)
                              ? newHabit.customDays.filter((d) => d !== index)
                              : [...newHabit.customDays, index]
                            setNewHabit({ ...newHabit, customDays: newDays })
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            newHabit.customDays.includes(index)
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
                  <Button onClick={addHabit} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
                    Add Habit
                  </Button>
                  <Button onClick={() => setShowAddHabit(false)} variant="outline" className="flex-1">
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