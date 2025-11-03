"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { Calendar, TrendingUp, Target, CheckCircle, Award, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AnalyticsProps {
  tasks: any[]
  habits: any[]
  goals: any[]
  journals: any[]
  events: any[]
  achievements: any[]
}

export function Analytics({ tasks, habits, goals, journals, events, achievements }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")

  const analytics = useMemo(() => {
    const now = new Date()
    const startDate = new Date()
    let timeUnit: 'day' | 'month' = 'day'
    const timePoints: { date: Date, dateStr: string, label: string }[] = []

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7)
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          timePoints.push({
            date,
            dateStr: date.toISOString().split("T")[0],
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
          })
        }
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        const daysInMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
        for (let i = daysInMonth - 1; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          timePoints.push({
            date,
            dateStr: date.toISOString().split("T")[0],
            label: `${date.getMonth() + 1}/${date.getDate()}`,
          })
        }
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        timeUnit = 'month'
        for (let i = 11; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          timePoints.push({
            date,
            dateStr: date.toISOString().split("T")[0].substring(0, 7), // YYYY-MM
            label: date.toLocaleDateString("en-US", { month: "short" }),
          })
        }
        break
    }

    // Task completion analytics
    const filteredTasks = tasks.filter(task => new Date(task.createdAt) >= startDate)
    const completedTasks = filteredTasks.filter((task) => task.completed)
    const taskCompletionRate = filteredTasks.length > 0 ? (completedTasks.length / filteredTasks.length) * 100 : 0

    // Habit streak analytics
    const habitStreaks = habits.map((habit) => ({
      name: habit.name,
      streak: habit.streak,
      longestStreak: habit.longestStreak || habit.streak,
    }))

    // Goal progress analytics
    const goalProgress = goals.map((goal) => ({
      name: goal.title,
      progress: goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0,
      completed: goal.completed,
    }))

    // Mood trends from journals
    const moodData = journals
      .filter((journal) => new Date(journal.date) >= startDate)
      .map((journal) => ({
        date: journal.date,
        mood: journal.mood,
        energy: journal.energy || 5,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Daily/Monthly productivity score
    const productivityData = timePoints.map(point => {
      let dayTasks, dayHabits, dayJournals
      if (timeUnit === 'day') {
        dayTasks = tasks.filter((task) => task.createdAt?.startsWith(point.dateStr))
        dayHabits = habits.filter((habit) => habit.completedDates?.includes(point.dateStr))
        dayJournals = journals.filter((journal) => journal.date === point.dateStr)
      } else { // month
        dayTasks = tasks.filter((task) => task.createdAt?.startsWith(point.dateStr))
        dayHabits = habits.filter((habit) => habit.completedDates?.some(d => d.startsWith(point.dateStr)))
        dayJournals = journals.filter((journal) => journal.date.startsWith(point.dateStr))
      }

      const score = Math.min(100, dayTasks.length * 10 + dayHabits.length * 15 + dayJournals.length * 5)

      return {
        date: point.label,
        score,
        tasks: dayTasks.length,
        habits: dayHabits.length,
      }
    })

    return {
      taskCompletionRate,
      habitStreaks,
      goalProgress,
      moodData,
      productivityData,
      totalTasks: filteredTasks.length,
      completedTasks: completedTasks.length,
      totalHabits: habits.length,
      totalGoals: goals.length,
      completedGoals: goals.filter((g) => g.completed).length,
      totalAchievements: (achievements || []).length,
    }
  }, [tasks, habits, goals, journals, timeRange, achievements])

  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 flex-shrink-0"
      >
        <h1 className="text-4xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              className="capitalize"
            >
              {range}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto pr-2 max-h-[calc(100vh-200px)]">
      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-400" size={24} />
            <h3 className="font-semibold">Tasks</h3>
          </div>
          <p className="text-2xl font-bold">{analytics.completedTasks}</p>
          <p className="text-sm text-white/60 dark:text-gray-400">of {analytics.totalTasks} completed</p>
          <div className="mt-2 bg-white/10 dark:bg-gray-700/50 rounded-full h-2">
            <div
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analytics.taskCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-blue-400" size={24} />
            <h3 className="font-semibold">Habits</h3>
          </div>
          <p className="text-2xl font-bold">{analytics.totalHabits}</p>
          <p className="text-sm text-white/60 dark:text-gray-400">active habits</p>
          <div className="mt-2">
            <p className="text-xs text-blue-400">
              Avg streak:{" "}
              {Math.round(
                analytics.habitStreaks.reduce((acc, h) => acc + h.streak, 0) /
                  Math.max(1, analytics.habitStreaks.length),
              )}{" "}
              days
            </p>
          </div>
        </div>

        <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-yellow-400" size={24} />
            <h3 className="font-semibold">Goals</h3>
          </div>
          <p className="text-2xl font-bold">{analytics.completedGoals}</p>
          <p className="text-sm text-white/60 dark:text-gray-400">of {analytics.totalGoals} achieved</p>
          <div className="mt-2 bg-white/10 dark:bg-gray-700/50 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${analytics.totalGoals > 0 ? (analytics.completedGoals / analytics.totalGoals) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="text-purple-400" size={24} />
            <h3 className="font-semibold">Achievements</h3>
          </div>
          <p className="text-2xl font-bold">{analytics.totalAchievements}</p>
          <p className="text-sm text-white/60 dark:text-gray-400">badges earned</p>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Weekly Productivity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={analytics.productivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#colorGradient)" />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Goal Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy size={20} />
            Goal Progress
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.goalProgress.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Habit Streaks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={20} />
            Habit Streaks
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.habitStreaks.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="streak" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="longestStreak" fill="#059669" radius={[4, 4, 0, 0]} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Mood & Energy Trends */}
        {analytics.moodData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Mood & Energy
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
                <YAxis stroke="rgba(255,255,255,0.6)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Achievement Gallery */}
      {analytics.totalAchievements > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award size={20} />
            Recent Achievements
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.slice(0, 8).map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-2">{achievement.icon || "🏆"}</div>
                <h4 className="font-semibold text-sm">{achievement.title}</h4>
                <p className="text-xs text-white/60 dark:text-gray-400 mt-1">{achievement.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      </div>
    </div>
  )
}
