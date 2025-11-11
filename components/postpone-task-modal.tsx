'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Task } from "@/types"

interface PostponeTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onPostpone: (newDueDate: string) => void
  task: Task | null
}

export function PostponeTaskModal({ isOpen, onClose, onPostpone, task }: PostponeTaskModalProps) {
  const [selectedDate, setSelectedDate] = useState("")

  useEffect(() => {
    if (task?.dueDate) {
      setSelectedDate(task.dueDate)
    } else {
      setSelectedDate(new Date().toISOString().split("T")[0])
    }
  }, [task])

  const handlePostpone = () => {
    if (selectedDate) {
      onPostpone(selectedDate)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-2xl border border-white/20 w-96">
        <h3 className="text-xl font-bold mb-4">Postpone Task</h3>
        <p className="text-white/80 mb-4">
          Select a new due date for: <span className="font-bold">{task?.title}</span>
        </p>

        <input
          type="date"
          value={selectedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white mb-4"
        />

        <div className="flex gap-2">
          <Button onClick={handlePostpone} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">
            Postpone
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
