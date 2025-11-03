"use client"

import { useState } from "react"
import { Plus, Check, X, Calendar, Flag, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Task } from "@/types"

interface TasksProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
}

export function Tasks({ tasks, setTasks }: TasksProps) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [showDateNotice, setShowDateNotice] = useState(false)
  const [dateNoticeMessage, setDateNoticeMessage] = useState("")
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
  })

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === "pending") return !task.completed
      if (filter === "completed") return task.completed
      return true
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

  const addTask = () => {
    if (newTask.title) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        completed: false,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        createdAt: new Date().toISOString(),
      }
      setTasks([task, ...tasks])
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "" })
      setShowAddTask(false)
    }
  }

  const toggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // If trying to mark as complete, check the due date
    if (!task.completed && task.dueDate) {
      const today = new Date()
      const dueDate = new Date(task.dueDate)
      
      // Reset time to compare only dates
      today.setHours(0, 0, 0, 0)
      dueDate.setHours(0, 0, 0, 0)
      
      if (today < dueDate) {
        const formattedDueDate = new Date(task.dueDate).toLocaleDateString()
        setDateNoticeMessage(`This task cannot be marked complete yet. It's scheduled for ${formattedDueDate}.`)
        setShowDateNotice(true)
        
        // Auto-hide the notice after 4 seconds
        setTimeout(() => {
          setShowDateNotice(false)
        }, 4000)
        
        return
      }
    }

    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400 border-red-400"
      case "medium":
        return "text-yellow-400 border-yellow-400"
      case "low":
        return "text-green-400 border-green-400"
      default:
        return "text-gray-400 border-gray-400"
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length
  const pendingCount = tasks.filter((task) => !task.completed).length

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Tasks</h1>
        <Button onClick={() => setShowAddTask(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus size={20} className="mr-2" />
          Add Task
        </Button>
      </div>

      {/* Date Notice Card */}
      {showDateNotice && (
        <div className="mb-6 bg-yellow-500/20 backdrop-blur-lg rounded-xl border border-yellow-500/30 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-400 mb-1">Task Schedule Restriction</h4>
              <p className="text-white/80 text-sm">{dateNoticeMessage}</p>
            </div>
            <button
              onClick={() => setShowDateNotice(false)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
          <h3 className="text-white/60 text-sm">Total Tasks</h3>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
        <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
          <h3 className="text-white/60 text-sm">Pending</h3>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
        </div>
        <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
          <h3 className="text-white/60 text-sm">Completed</h3>
          <p className="text-2xl font-bold text-green-400">{completedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'completed'] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
              filter === filterType
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "bg-black/20 text-white/60 hover:bg-white/10"
            }`}
          >
            {filterType}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 h-full">
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredTasks.map((task) => {
            const isTaskOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date()
            const isTaskFuture = task.dueDate && !task.completed && new Date(task.dueDate) > new Date()
            
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  task.completed 
                    ? "bg-green-500/10 border-green-500/20" 
                    : isTaskOverdue
                    ? "bg-red-500/10 border-red-500/20"
                    : isTaskFuture
                    ? "bg-blue-500/10 border-blue-500/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      task.completed 
                        ? "bg-green-500 border-green-500" 
                        : isTaskFuture
                        ? "border-blue-400/50 cursor-not-allowed opacity-60"
                        : "border-white/30 hover:border-white/50"
                    }`}
                    title={isTaskFuture ? "Cannot complete before due date" : ""}
                  >
                    {task.completed && <Check size={12} className="text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-medium ${task.completed ? "line-through text-white/60" : ""}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs border ${getPriorityColor(task.priority)}`}>
                        <Flag size={10} className="inline mr-1" />
                        {task.priority}
                      </span>
                      {isTaskFuture && (
                        <span className="px-2 py-1 rounded text-xs border border-blue-400/50 text-blue-400">
                          Scheduled
                        </span>
                      )}
                      {isTaskOverdue && (
                        <span className="px-2 py-1 rounded text-xs border border-red-400/50 text-red-400">
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className={`text-sm mb-2 ${task.completed ? "text-white/40" : "text-white/60"}`}>
                        {task.description}
                      </p>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-white/50">
                        <Calendar size={12} />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-white/40 hover:text-red-400 transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/60">No tasks found</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-2xl border border-white/20 w-96">
            <h3 className="text-xl font-bold mb-4">Add New Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50"
              />
              <textarea
                placeholder="Task description (optional)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 h-20 resize-none"
              />
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={newTask.dueDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white"
              />
              <p className="text-xs text-white/50">Note: Tasks with past due dates cannot be added</p>
              <div className="flex gap-2">
                <Button onClick={addTask} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
                  Add Task
                </Button>
                <Button onClick={() => setShowAddTask(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
