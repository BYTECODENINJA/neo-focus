'use client'

import { Task } from "@/types"
import { Check, X, Calendar, Flag, Clock } from "lucide-react"

interface TaskItemProps {
  task: Task
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onPostpone: (task: Task) => void
}

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "high":
      return "border-red-400 text-red-400"
    case "medium":
      return "border-yellow-400 text-yellow-400"
    case "low":
      return "border-green-400 text-green-400"
    default:
      return "border-gray-400 text-gray-400"
  }
}

export function TaskItem({ task, onToggle, onDelete, onPostpone }: TaskItemProps) {
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date()
  const isFuture = task.dueDate && !task.completed && new Date(task.dueDate) > new Date()

  const cardClass = task.completed
    ? "bg-green-500/10 border-green-500/20"
    : isOverdue
    ? "bg-red-500/10 border-red-500/20"
    : isFuture
    ? "bg-blue-500/10 border-blue-500/20"
    : "bg-white/5 border-white/10 hover:bg-white/10"

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${cardClass}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? "bg-green-500 border-green-500"
              : "border-white/30 hover:border-white/50"
          }`}
          title="Mark as complete"
        >
          {task.completed && <Check size={12} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <h3 className={`font-medium ${task.completed ? "line-through text-white/60" : "text-white"}`}>
              {task.title}
            </h3>
            <span className={`px-2 py-1 rounded text-xs border ${getPriorityClass(task.priority)}`}>
              <Flag size={10} className="inline mr-1" />
              {task.priority}
            </span>
            {isFuture && (
              <span className="px-2 py-1 rounded text-xs border border-blue-400/50 text-blue-400">
                Scheduled
              </span>
            )}
            {isOverdue && (
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

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPostpone(task)}
            className={`text-white/40 transition-colors duration-200 ${
              task.completed ? "cursor-not-allowed opacity-50" : "hover:text-blue-400"
            }`}
            title={task.completed ? "Cannot postpone a completed task" : "Postpone task"}
            disabled={task.completed}
          >
            <Clock size={16} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-white/40 hover:text-red-400 transition-colors duration-200"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
