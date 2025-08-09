"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, CheckCircle, Target, Trophy, BookOpen, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReviewModalProps {
  type: "daily" | "weekly"
  onClose: () => void
  tasks: any[]
  habits: any[]
  goals: any[]
  journals: any[]
}

export function ReviewModal({ type, onClose, tasks, habits, goals, journals }: ReviewModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})

  const dailyPrompts = [
    {
      icon: CheckCircle,
      title: "Today's Accomplishments",
      question: "What did you accomplish today that you're proud of?",
      key: "accomplishments",
    },
    {
      icon: Target,
      title: "Challenges Faced",
      question: "What challenges did you face today and how did you handle them?",
      key: "challenges",
    },
    {
      icon: TrendingUp,
      title: "Tomorrow's Focus",
      question: "What are your top 3 priorities for tomorrow?",
      key: "tomorrow",
    },
    {
      icon: BookOpen,
      title: "Lessons Learned",
      question: "What did you learn today that you can apply going forward?",
      key: "lessons",
    },
  ]

  const weeklyPrompts = [
    {
      icon: Trophy,
      title: "Weekly Wins",
      question: "What were your biggest wins this week?",
      key: "wins",
    },
    {
      icon: Target,
      title: "Goal Progress",
      question: "How did you progress toward your goals this week?",
      key: "progress",
    },
    {
      icon: TrendingUp,
      title: "Areas for Improvement",
      question: "What areas would you like to improve next week?",
      key: "improvement",
    },
    {
      icon: Calendar,
      title: "Next Week's Plan",
      question: "What are your main objectives for next week?",
      key: "plan",
    },
  ]

  const prompts = type === "daily" ? dailyPrompts : weeklyPrompts
  const currentPrompt = prompts[currentStep]

  const handleNext = () => {
    if (currentStep < prompts.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save review and close
      console.log("Review completed:", responses)
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateResponse = (key: string, value: string) => {
    setResponses({ ...responses, [key]: value })
  }

  // Calculate stats for the review period
  const getStats = () => {
    const now = new Date()
    const startDate = new Date()

    if (type === "daily") {
      startDate.setHours(0, 0, 0, 0)
    } else {
      startDate.setDate(now.getDate() - 7)
    }

    const completedTasks = tasks.filter(
      (task) => task.completed && new Date(task.updatedAt || task.createdAt) >= startDate,
    ).length

    const habitCompletions = habits.reduce((total, habit) => {
      return total + habit.completedDates.filter((date: string) => new Date(date) >= startDate).length
    }, 0)

    const goalProgress = goals.filter(
      (goal) => goal.currentValue > 0 && new Date(goal.updatedAt || goal.createdAt) >= startDate,
    ).length

    return { completedTasks, habitCompletions, goalProgress }
  }

  const stats = getStats()
  const Icon = currentPrompt.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-purple-900 to-indigo-900 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold capitalize">{type} Review</h2>
              <p className="text-white/60 dark:text-gray-400">
                Step {currentStep + 1} of {prompts.length}
              </p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X size={20} />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white/10 dark:bg-gray-700/50 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / prompts.length) * 100}%` }}
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Stats Overview (First Step) */}
        {currentStep === 0 && (
          <div className="p-6 border-b border-white/10 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold mb-4">Your {type} at a glance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black/20 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <CheckCircle className="text-green-400 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-sm text-white/60 dark:text-gray-400">Tasks Completed</p>
              </div>
              <div className="bg-black/20 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <Target className="text-blue-400 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{stats.habitCompletions}</p>
                <p className="text-sm text-white/60 dark:text-gray-400">Habit Completions</p>
              </div>
              <div className="bg-black/20 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <Trophy className="text-yellow-400 mx-auto mb-2" size={24} />
                <p className="text-2xl font-bold">{stats.goalProgress}</p>
                <p className="text-sm text-white/60 dark:text-gray-400">Goals Progressed</p>
              </div>
            </div>
          </div>
        )}

        {/* Current Prompt */}
        <div className="p-6 flex-1">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">{currentPrompt.title}</h3>
            <p className="text-white/70 dark:text-gray-300">{currentPrompt.question}</p>
          </div>

          <textarea
            value={responses[currentPrompt.key] || ""}
            onChange={(e) => updateResponse(currentPrompt.key, e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full h-32 p-4 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-white/50 dark:placeholder-gray-400 resize-none"
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 dark:border-gray-700/50 flex justify-between">
          <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
            Previous
          </Button>
          <Button onClick={handleNext} className="bg-gradient-to-r from-purple-500 to-blue-500">
            {currentStep === prompts.length - 1 ? "Complete Review" : "Next"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
