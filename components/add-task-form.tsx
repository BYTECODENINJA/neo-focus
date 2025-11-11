'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Task } from "@/types"

interface AddTaskFormProps {
  onAdd: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    dueDate: "",
  })

  const handleAdd = () => {
    if (newTask.title) {
      onAdd(newTask)
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "" })
      setIsAdding(false)
    }
  }

  if (!isAdding) {
    return (
      <Button onClick={() => setIsAdding(true)} className="w-full bg-gradient-to-r from-purple-500 to-blue-500">
        <Plus size={20} className="mr-2" />
        Add Task
      </Button>
    )
  }

  return (
    <div className="p-4 rounded-xl border bg-white/5 border-white/10">
      <input
        type="text"
        placeholder="Task title"
        value={newTask.title}
        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 mb-2"
      />
      <textarea
        placeholder="Task description (optional)"
        value={newTask.description}
        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 h-20 resize-none mb-2"
      />
      <div className="flex gap-2 mb-2">
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
      </div>
      <div className="flex gap-2">
        <Button onClick={handleAdd} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
          Add Task
        </Button>
        <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )
}
