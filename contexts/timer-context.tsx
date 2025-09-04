"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"

interface TimerContextType {
  timeLeft: number
  isActive: boolean
  mode: "work" | "break"
  selectedWorkTime: number
  selectedBreakTime: number
  alarmEnabled: boolean
  setTimeLeft: (time: number) => void
  setIsActive: (active: boolean) => void
  setMode: (mode: "work" | "break") => void
  setSelectedWorkTime: (time: number) => void
  setSelectedBreakTime: (time: number) => void
  setAlarmEnabled: (enabled: boolean) => void
  resetTimer: () => void
  toggleTimer: () => void
  playAlarm: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState<"work" | "break">("work")
  const [selectedWorkTime, setSelectedWorkTime] = useState(25)
  const [selectedBreakTime, setSelectedBreakTime] = useState(5)
  const [alarmEnabled, setAlarmEnabled] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastTickRef = useRef<number>(Date.now())

  // Alarm function
  const playAlarm = () => {
    if (!alarmEnabled) return

    // Create audio context for alarm sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Create multiple tones for a more noticeable alarm
      const playTone = (frequency: number, duration: number, delay = 0) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
          oscillator.type = "sine"

          gainNode.gain.setValueAtTime(0, audioContext.currentTime)
          gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1)
          gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration)

          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + duration)
        }, delay)
      }

      // Play a sequence of tones
      playTone(800, 0.3, 0)
      playTone(1000, 0.3, 400)
      playTone(800, 0.3, 800)
      playTone(1000, 0.3, 1200)
      playTone(800, 0.3, 1600)

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(mode === "work" ? "Work session completed!" : "Break time over!", {
          body: mode === "work" ? "Time for a break!" : "Ready for another work session?",
          icon: "/favicon.ico",
          requireInteraction: true,
          tag: "focus-timer",
        })
      }
    } catch (error) {
      console.error("Error playing alarm:", error)
      // Fallback: try to play a simple beep
      try {
        const audio = new Audio(
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
        )
        audio.play().catch(() => {})
      } catch (fallbackError) {
        console.error("Fallback alarm also failed:", fallbackError)
      }
    }
  }

  // Reset timer function
  const resetTimer = () => {
    setIsActive(false)
    setMode("work")
    setTimeLeft(selectedWorkTime * 60)
    // Clear saved timer state
    localStorage.removeItem("aura-focus-timer")
  }

  // Toggle timer function
  const toggleTimer = () => {
    setIsActive((prev) => !prev)
  }

  // Save timer state to localStorage
  const saveTimerState = () => {
    const timerState = {
      timeLeft,
      isActive,
      mode,
      selectedWorkTime,
      selectedBreakTime,
      alarmEnabled,
      lastUpdate: Date.now(),
    }
    localStorage.setItem("aura-focus-timer", JSON.stringify(timerState))
  }

  // Load timer state from localStorage on mount
  useEffect(() => {
    const savedTimerState = localStorage.getItem("aura-focus-timer")
    if (savedTimerState) {
      try {
        const timerState = JSON.parse(savedTimerState)
        const timeSinceLastUpdate = Math.floor((Date.now() - timerState.lastUpdate) / 1000)

        // Only restore if the saved state is recent (within 1 hour)
        if (timeSinceLastUpdate < 3600) {
          setSelectedWorkTime(timerState.selectedWorkTime || 25)
          setSelectedBreakTime(timerState.selectedBreakTime || 5)
          setAlarmEnabled(timerState.alarmEnabled !== undefined ? timerState.alarmEnabled : true)
          setMode(timerState.mode || "work")

          // Adjust time if timer was active
          if (timerState.isActive && timerState.timeLeft > timeSinceLastUpdate) {
            setTimeLeft(timerState.timeLeft - timeSinceLastUpdate)
            setIsActive(true)
          } else if (timerState.isActive && timerState.timeLeft <= timeSinceLastUpdate) {
            // Timer would have finished while away
            setTimeLeft(0)
            setIsActive(false)
            // We'll play the alarm in the next useEffect when timeLeft becomes 0
          } else {
            setTimeLeft(
              timerState.timeLeft ||
                (timerState.mode === "work" ? timerState.selectedWorkTime * 60 : timerState.selectedBreakTime * 60),
            )
            setIsActive(false)
          }
        }
      } catch (error) {
        console.error("Error restoring timer state:", error)
      }
    }
  }, [])

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  // Global timer effect that runs even when component is unmounted
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (isActive && timeLeft > 0) {
      lastTickRef.current = Date.now()

      // Use a more accurate interval approach
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const deltaSeconds = Math.floor((now - lastTickRef.current) / 1000)
        lastTickRef.current = now

        if (deltaSeconds > 0) {
          setTimeLeft((prevTime) => {
            const newTime = Math.max(0, prevTime - deltaSeconds)

            // Save state every 10 seconds to avoid too frequent writes
            if (newTime % 10 === 0 || newTime === 0) {
              saveTimerState()
            }

            return newTime
          })
        }
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer finished - play alarm
      playAlarm()
      setIsActive(false)

      if (mode === "work") {
        setMode("break")
        setTimeLeft(selectedBreakTime * 60)
      } else {
        setMode("work")
        setTimeLeft(selectedWorkTime * 60)
      }

      saveTimerState()
    } else {
      saveTimerState()
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, timeLeft, mode, selectedWorkTime, selectedBreakTime, alarmEnabled])

  // Save timer state when window is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveTimerState()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [timeLeft, isActive, mode, selectedWorkTime, selectedBreakTime, alarmEnabled])

  const value = {
    timeLeft,
    isActive,
    mode,
    selectedWorkTime,
    selectedBreakTime,
    alarmEnabled,
    setTimeLeft,
    setIsActive,
    setMode,
    setSelectedWorkTime,
    setSelectedBreakTime,
    setAlarmEnabled,
    resetTimer,
    toggleTimer,
    playAlarm,
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}
