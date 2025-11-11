'use client'

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target, TrendingUp, Award, Flame, Trash2 } from "lucide-react"
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
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily" as "daily" | "weekly" | "monthly" | "custom",
    customDays: [] as number[],
  })
  const { addAchievement } = useAchievements()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const addHabit = () => {
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
      setHabits([habit, ...habits])
      setNewHabit({ name: "", description: "", frequency: "daily", customDays: [] })
      setShowAddHabit(false)
    }
  }

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter((habit) => habit.id !== habitId))
  }

  const calculateStreak = (habit: Habit, completedDates: string[]) => {
    let currentStreak = 0
    if (completedDates.length === 0) return 0

    const sortedDates = completedDates.map(date => {
        const d = new Date(date)
        d.setHours(0, 0, 0, 0)
        return d
    }).sort((a, b) => b.getTime() - a.getTime())
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (sortedDates[0].getTime() !== today.getTime()) {
        return 0
    }

    currentStreak = 1

    for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = sortedDates[i]
        const previousDate = sortedDates[i+1]

        let expectedPreviousDate: Date;

        switch (habit.frequency) {
            case "daily":
                expectedPreviousDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
                break;
            case "weekly":
                expectedPreviousDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
                break;
            case "monthly":
                expectedPreviousDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate())
                break;
            case "custom":
                const currentDay = currentDate.getDay();
                const customDays = habit.customDays || [];
                const currentIndex = customDays.indexOf(currentDay);
                const previousIndex = (currentIndex - 1 + customDays.length) % customDays.length;
                const daysToSubtract = (currentDay - customDays[previousIndex] + 7) % 7 || 7;
                expectedPreviousDate = new Date(currentDate.getTime() - daysToSubtract * 24 * 60 * 60 * 1000);
                break;
            default:
                return currentStreak
        }
        
        if (previousDate.getTime() === expectedPreviousDate.getTime()) {
            currentStreak++
        } else {
            break
        }
    }
    
    return currentStreak
  }

  const toggleHabitCompletion = (habitId: string, date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const isCompleted = (habit.completedDates || []).includes(dateString)
          const newCompletedDates = isCompleted
            ? habit.completedDates.filter((d) => d !== dateString)
            : [...(habit.completedDates || []), dateString]

          const newStreak = calculateStreak(habit, newCompletedDates)
          const newLongestStreak = Math.max(habit.longestStreak, newStreak)

          if (!isCompleted && newStreak > habit.streak) {
            triggerCelebration()
            checkAchievements(habit.name, newStreak, newLongestStreak)
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

  const getCompletionRate = (habit: Habit) => {
    if (!habit.createdAt) return 0
    const daysSinceCreated =
      Math.floor((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1
    return Math.round((((habit.completedDates || []).length) / daysSinceCreated) * 100)
  }

  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setHours(0,0,0,0)
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
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
        <Button onClick={() => setShowAddHabit(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus size={20} className="mr-2" />
          Add Habit
        </Button>
      </motion.div>

      <div className="h-full overflow-y-auto">
        <div className="grid gap-6 max-h-[800px] overflow-y-auto">
          <AnimatePresence>
            {habits.map((habit, index) => {
              const isCompletedToday = (habit.completedDates || []).includes(today.toISOString().split("T")[0])
              const completionRate = getCompletionRate(habit)

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
                        onClick={() => toggleHabitCompletion(habit.id, today)}
                        className={`transition-all duration-200 px-4 py-2 text-sm font-semibold rounded-lg ${
                          isCompletedToday
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        }`}
                      >
                        {isCompletedToday ? "Completed!" : "Mark Done"}
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
                        const isCompleted = (habit.completedDates || []).includes(day.toISOString().split("T")[0])
                        return (
                          <motion.div
                            key={day.toISOString()}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => toggleHabitCompletion(habit.id, day)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : day.getTime() === today.getTime()
                                  ? "bg-white/20 text-white border border-white/30"
                                  : "bg-white/5 text-white/40"
                            }`}
                          >
                            {day.getDate()}
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
