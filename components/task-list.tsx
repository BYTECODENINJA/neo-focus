'use client'

import { Task } from "@/types"
import { TaskItem } from "./task-item"

interface TaskListProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
  onDelete: (taskId: string) => void
  onPostpone: (task: Task) => void
}

export function TaskList({ tasks, onToggle, onDelete, onPostpone }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/60">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onPostpone={onPostpone} />
      ))}
    </div>
  )
}
