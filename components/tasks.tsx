'use client'

import { useState, useMemo, useCallback } from "react"
import { Task, TaskFilter } from "@/types"
import { AddTaskForm } from "./add-task-form"
import { TaskList } from "./task-list"
import { TaskFilters } from "./task-filters"
import { TaskStats } from "./task-stats"
import { PostponeTaskModal } from "./postpone-task-modal"

interface TasksProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
}

export function Tasks({ tasks, setTasks }: TasksProps) {
  const [filter, setFilter] = useState<TaskFilter>("all")
  const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false)
  const [taskToPostpone, setTaskToPostpone] = useState<Task | null>(null)

  const filteredTasks = useMemo(() => {
    return tasks
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
  }, [tasks, filter])

  const addTask = useCallback((newTask: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setTasks([task, ...tasks])
  }, [tasks, setTasks])

  const toggleTask = useCallback((taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }, [tasks, setTasks])

  const deleteTask = useCallback((taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }, [tasks, setTasks])

  const openPostponeModal = useCallback((task: Task) => {
    setTaskToPostpone(task)
    setIsPostponeModalOpen(true)
  }, [])

  const closePostponeModal = useCallback(() => {
    setTaskToPostpone(null)
    setIsPostponeModalOpen(false)
  }, [])

  const postponeTask = useCallback((newDueDate: string) => {
    if (taskToPostpone) {
      setTasks(tasks.map((task) => (task.id === taskToPostpone.id ? { ...task, dueDate: newDueDate } : task)))
      closePostponeModal()
    }
  }, [tasks, setTasks, taskToPostpone, closePostponeModal])

  const completedCount = useMemo(() => tasks.filter((task) => task.completed).length, [tasks])
  const pendingCount = useMemo(() => tasks.length - completedCount, [tasks, completedCount])

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Tasks</h1>
      </div>

      <TaskStats total={tasks.length} pending={pendingCount} completed={completedCount} />

      <AddTaskForm onAdd={addTask} />

      <div className="mt-6">
        <TaskFilters currentFilter={filter} onFilterChange={setFilter} />
      </div>

      <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 h-full">
        <TaskList
          tasks={filteredTasks}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onPostpone={openPostponeModal}
        />
      </div>

      <PostponeTaskModal
        isOpen={isPostponeModalOpen}
        onClose={closePostponeModal}
        onPostpone={postponeTask}
        task={taskToPostpone}
      />
    </div>
  )
}
