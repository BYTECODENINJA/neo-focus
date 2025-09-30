"use client"

import { useTimer } from "@/contexts/timer-context"
import { Clock } from "lucide-react"
import { useEffect, useState } from "react"

export function TimerStatus() {
  const { timeLeft, isActive, mode } = useTimer()
  const [visible, setVisible] = useState(false)

  // Only show the timer status when timer is active
  useEffect(() => {
    setVisible(isActive)
  }, [isActive])

  if (!visible) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2 shadow-lg z-50">
      <Clock size={16} className={mode === "work" ? "text-red-400" : "text-green-400"} />
      <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
      <span className="text-xs text-white/70">{mode === "work" ? "Working" : "Break"}</span>
    </div>
  )
}
