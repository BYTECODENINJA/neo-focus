"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target, Calendar, Trash2, CheckCircle, Trophy, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"
import { useAchievements } from "@/contexts/achievement-context"

import { Goal } from "@/types"

interface GoalsProps {
  goals: Goal[]
  setGoals: (goals: Goal[]) => void
  achievements: any[]
  setAchievements: (achievements: any[]) => void
}

export function Goals({ goals, setGoals, achievements, setAchievements }: GoalsProps) {
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly" | "yearly">("all")
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    type: "daily" as const,
    targetValue: 1,
    unit: "",
    category: "personal" as const,
    deadline: "",
  })

  const { addAchievement } = useAchievements()

  const filteredGoals = goals.filter((goal) => {
    if (filter === "all") return true
    return goal.type === filter
  })

  const addGoal = () => {
    if (newGoal.title && newGoal.targetValue > 0) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        type: newGoal.type,
        targetValue: newGoal.targetValue,
        currentValue: 0,
        unit: newGoal.unit,
        category: newGoal.category,
        deadline: newGoal.deadline,
        completed: false,
        createdAt: new Date().toISOString(),
      }
      setGoals([goal, ...goals])
      setNewGoal({
        title: "",
        description: "",
        type: "daily",
        targetValue: 1,
        unit: "",
        category: "personal",
        deadline: "",
      })
      setShowAddGoal(false)
    }
  }

  const updateGoalProgress = (goalId: string, newValue: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === goalId) {
          const completed = newValue >= goal.targetValue
          const wasCompleted = goal.completed

          if (completed && !wasCompleted) {
            // Goal just completed - trigger celebration
            confetti({
              particleCount: 200,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"],
            })

            // Add achievement
            addAchievement({
              createdAt: new Date().toISOString(),
              type: "goal_completed",
              title: "Goal Achieved!",
              description: `Completed "${goal.title}"`,
              icon: "🎯",
            })
          }

          return { ...goal, currentValue: newValue, completed }
        }
        return goal
      }),
    )
  }

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter((goal) => goal.id !== goalId))
  }

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health":
        return "text-green-400 bg-green-400/10"
      case "career":
        return "text-blue-400 bg-blue-400/10"
      case "personal":
        return "text-purple-400 bg-purple-400/10"
      case "finance":
        return "text-yellow-400 bg-yellow-400/10"
      case "learning":
        return "text-orange-400 bg-orange-400/10"
      case "other":
        return "text-gray-400 bg-gray-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health":
        return "💪"
      case "career":
        return "💼"
      case "personal":
        return "🎯"
      case "finance":
        return "💰"
      case "learning":
        return "📚"
      case "other":
        return "📋"
      default:
        return "📋"
    }
  }

  const getTypeStats = () => {
    const stats = {
      daily: goals.filter((g) => g.type === "daily").length,
      weekly: goals.filter((g) => g.type === "weekly").length,
      monthly: goals.filter((g) => g.type === "monthly").length,
      yearly: goals.filter((g) => g.type === "yearly").length,
    }
    return stats
  }

  const stats = getTypeStats()

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1 className="text-4xl font-bold">Goals</h1>
        <Button onClick={() => setShowAddGoal(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus size={20} className="mr-2" />
          Add Goal
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/10 dark:border-gray-700/50 p-4">
          <h3 className="text-white/60 dark:text-gray-400 text-sm">Daily Goals</h3>
          <p className="text-2xl font-bold text-blue-400">{stats.daily}</p>
        </div>
        <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/10 dark:border-gray-700/50 p-4">
          <h3 className="text-white/60 dark:text-gray-400 text-sm">Weekly Goals</h3>
          <p className="text-2xl font-bold text-green-400">{stats.weekly}</p>
        </div>
        <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/10 dark:border-gray-700/50 p-4">
          <h3 className="text-white/60 dark:text-gray-400 text-sm">Monthly Goals</h3>
          <p className="text-2xl font-bold text-orange-400">{stats.monthly}</p>
        </div>
        <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-xl border border-white/10 dark:border-gray-700/50 p-4">
          <h3 className="text-white/60 dark:text-gray-400 text-sm">Yearly Goals</h3>
          <p className="text-2xl font-bold text-purple-400">{stats.yearly}</p>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "daily", "weekly", "monthly", "yearly"] as const).map((filterType) => (
          <motion.button
            key={filterType}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
              filter === filterType
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "bg-black/20 dark:bg-gray-800/50 text-white/60 dark:text-gray-400 hover:bg-white/10 dark:hover:bg-gray-700/50"
            }`}
          >
            {filterType}
          </motion.button>
        ))}
      </div>

      {/* Goals List */}
      <div className="flex-1 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4 pr-2">
          <AnimatePresence>
            {filteredGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  goal.completed
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-white/5 dark:bg-gray-700/20 border-white/10 dark:border-gray-600/30 hover:bg-white/10 dark:hover:bg-gray-700/30"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                      <h3
                        className={`font-bold ${goal.completed ? "line-through text-white/60 dark:text-gray-400" : ""}`}
                      >
                        {goal.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-white/10 dark:bg-gray-600/30 text-white/60 dark:text-gray-400">
                        {goal.type}
                      </span>
                      {goal.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs"
                        >
                          <Trophy size={12} />
                          Completed
                        </motion.div>
                      )}
                    </div>
                    {goal.description && (
                      <p
                        className={`text-sm mb-2 ${goal.completed ? "text-white/40 dark:text-gray-500" : "text-white/60 dark:text-gray-400"}`}
                      >
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-white/40 dark:text-gray-500 hover:text-red-400 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Progress Visualization */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60 dark:text-gray-400 flex items-center gap-1">
                      <TrendingUp size={14} />
                      Progress
                    </span>
                    <span className="text-white/80 dark:text-gray-200">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 dark:bg-gray-600/30 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage(goal)}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        goal.completed ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-blue-500"
                      }`}
                    />
                  </div>
                  <div className="text-xs text-white/50 dark:text-gray-500 mt-1">
                    {Math.round(getProgressPercentage(goal))}% complete
                  </div>
                </div>

                {/* Progress Controls */}
                {!goal.completed && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={goal.targetValue}
                      value={goal.currentValue}
                      onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                      className="w-20 p-2 rounded-lg bg-black/20 dark:bg-gray-600/50 border border-white/10 dark:border-gray-500/50 text-white text-sm"
                    />
                    <Button
                      onClick={() => updateGoalProgress(goal.id, goal.currentValue + 1)}
                      size="sm"
                      variant="outline"
                      disabled={goal.currentValue >= goal.targetValue}
                    >
                      +1
                    </Button>
                    <Button
                      onClick={() => updateGoalProgress(goal.id, goal.targetValue)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Complete
                    </Button>
                  </div>
                )}

                {goal.deadline && (
                  <div className="flex items-center gap-1 text-xs text-white/50 dark:text-gray-500 mt-2">
                    <Calendar size={12} />
                    <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredGoals.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
              <Target size={48} className="mx-auto mb-4 text-white/40 dark:text-gray-500" />
              <h3 className="text-xl font-bold mb-2">No goals found</h3>
              <p className="text-white/60 dark:text-gray-400 mb-4">Start setting goals to track your progress</p>
              <Button onClick={() => setShowAddGoal(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
                <Plus size={16} className="mr-2" />
                Add Your First Goal
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
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
              <h3 className="text-xl font-bold mb-4">Add New Goal</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400"
                />
                <textarea
                  placeholder="Goal description (optional)"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400 h-20 resize-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as any })}
                    className="p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                    className="p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white"
                  >
                    <option value="health">💪 Health</option>
                    <option value="career">💼 Career</option>
                    <option value="personal">🎯 Personal</option>
                    <option value="finance">💰 Finance</option>
                    <option value="learning">📚 Learning</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Target value"
                    value={newGoal.targetValue}
                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: Number(e.target.value) })}
                    className="p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Unit (e.g., hours, books)"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                    className="p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400"
                  />
                </div>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white"
                />
                <div className="flex gap-2">
                  <Button onClick={addGoal} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
                    Add Goal
                  </Button>
                  <Button onClick={() => setShowAddGoal(false)} variant="outline" className="flex-1">
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