"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Square, RotateCcw, Timer, Coffee, Target, Volume2, VolumeX, X } from "lucide-react"

interface FocusSession {
  id: string
  name: string
  type: "work" | "shortBreak" | "longBreak"
  duration: number
  completed: boolean
  startTime: string
  endTime?: string
}

interface FocusSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
}

export default function FocusMode() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null)
  const [sessionType, setSessionType] = useState<"work" | "shortBreak" | "longBreak">("work")
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [sessionName, setSessionName] = useState("")
  const [settings, setSettings] = useState<FocusSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const completionPopupRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    loadData()
    loadSettings()

    // Create audio element for notifications
    audioRef.current = new Audio("/notification-sound.mp3")

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const loadData = () => {
    const savedSessions = localStorage.getItem("aura-focus-sessions")
    const savedPomodoros = localStorage.getItem("aura-completed-pomodoros")

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions))
    }

    if (savedPomodoros) {
      setCompletedPomodoros(Number.parseInt(savedPomodoros))
    }
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("aura-user-settings")
    if (savedSettings) {
      const userSettings = JSON.parse(savedSettings)
      setSettings({
        workDuration: userSettings.workDuration || 25,
        shortBreakDuration: userSettings.shortBreakDuration || 5,
        longBreakDuration: userSettings.longBreakDuration || 15,
        autoStartBreaks: userSettings.autoStartBreaks || false,
        autoStartPomodoros: userSettings.autoStartPomodoros || false,
        soundEnabled: userSettings.soundEnabled !== false,
      })
    }
  }

  const saveSessions = (updatedSessions: FocusSession[]) => {
    localStorage.setItem("aura-focus-sessions", JSON.stringify(updatedSessions))
    setSessions(updatedSessions)
  }

  const startSession = () => {
    if (sessionType === "work" && !sessionName.trim()) {
      setShowNameDialog(true)
      return
    }

    const duration = getDurationForType(sessionType)
    setTimeLeft(duration * 60)

    const newSession: FocusSession = {
      id: Date.now().toString(),
      name: sessionType === "work" ? sessionName : `${sessionType === "shortBreak" ? "Short" : "Long"} Break`,
      type: sessionType,
      duration: duration,
      completed: false,
      startTime: new Date().toISOString(),
    }

    setCurrentSession(newSession)
    setIsRunning(true)
    setIsPaused(false)
    setShowNameDialog(false)
  }

  const pauseSession = () => {
    setIsPaused(true)
  }

  const resumeSession = () => {
    setIsPaused(false)
  }

  const stopSession = () => {
    setIsRunning(false)
    setIsPaused(false)

    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        completed: false,
        endTime: new Date().toISOString(),
      }

      const updatedSessions = [updatedSession, ...sessions]
      saveSessions(updatedSessions)
    }

    setCurrentSession(null)
    resetTimer()
  }

  const resetTimer = () => {
    const duration = getDurationForType(sessionType)
    setTimeLeft(duration * 60)
    setIsRunning(false)
    setIsPaused(false)
    setCurrentSession(null)
  }

  const handleSessionComplete = () => {
    setIsRunning(false)
    setIsPaused(false)

    // Play notification sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }

    // Update session as completed
    if (currentSession) {
      const completedSession = {
        ...currentSession,
        completed: true,
        endTime: new Date().toISOString(),
      }

      const updatedSessions = [completedSession, ...sessions]
      saveSessions(updatedSessions)

      // Update pomodoro count if it was a work session
      if (sessionType === "work") {
        const newCount = completedPomodoros + 1
        setCompletedPomodoros(newCount)
        localStorage.setItem("aura-completed-pomodoros", newCount.toString())
      }
    }

    // Show completion popup
    setShowCompletionPopup(true)

    // Auto-start next session if enabled
    setTimeout(() => {
      if (sessionType === "work" && settings.autoStartBreaks) {
        const nextType = (completedPomodoros + 1) % 4 === 0 ? "longBreak" : "shortBreak"
        setSessionType(nextType)
        setTimeLeft(getDurationForType(nextType) * 60)
        if (settings.autoStartPomodoros) {
          startNextSession(nextType)
        }
      } else if (sessionType !== "work" && settings.autoStartPomodoros) {
        setSessionType("work")
        setTimeLeft(getDurationForType("work") * 60)
      }
    }, 3000)
  }

  const startNextSession = (type: "work" | "shortBreak" | "longBreak") => {
    const duration = getDurationForType(type)
    const newSession: FocusSession = {
      id: Date.now().toString(),
      name: type === "work" ? "Auto Work Session" : `Auto ${type === "shortBreak" ? "Short" : "Long"} Break`,
      type: type,
      duration: duration,
      completed: false,
      startTime: new Date().toISOString(),
    }

    setCurrentSession(newSession)
    setIsRunning(true)
    setIsPaused(false)
    setShowCompletionPopup(false)
  }

  const getDurationForType = (type: "work" | "shortBreak" | "longBreak") => {
    switch (type) {
      case "work":
        return settings.workDuration
      case "shortBreak":
        return settings.shortBreakDuration
      case "longBreak":
        return settings.longBreakDuration
      default:
        return 25
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalDuration = getDurationForType(sessionType) * 60
    return ((totalDuration - timeLeft) / totalDuration) * 100
  }

  const getSessionTypeIcon = (type: "work" | "shortBreak" | "longBreak") => {
    switch (type) {
      case "work":
        return <Target className="h-4 w-4" />
      case "shortBreak":
        return <Coffee className="h-4 w-4" />
      case "longBreak":
        return <Coffee className="h-4 w-4" />
    }
  }

  const getSessionTypeLabel = (type: "work" | "shortBreak" | "longBreak") => {
    switch (type) {
      case "work":
        return "Work Session"
      case "shortBreak":
        return "Short Break"
      case "longBreak":
        return "Long Break"
    }
  }

  const closeCompletionPopup = () => {
    setShowCompletionPopup(false)
  }

  // Persistent completion popup that stays until user closes it
  const CompletionPopup = () => {
    if (!showCompletionPopup || !currentSession) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96 animate-in fade-in-0 zoom-in-95" ref={completionPopupRef}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-between">
              <div className="flex-1" />
              <CardTitle className="text-xl">🎉 Session Complete!</CardTitle>
              <Button variant="ghost" size="sm" onClick={closeCompletionPopup} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{currentSession.name}</h3>
              <p className="text-muted-foreground">
                {getSessionTypeLabel(currentSession.type)} - {currentSession.duration} minutes
              </p>
            </div>

            {currentSession.type === "work" && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-medium">Pomodoros Completed Today</p>
                <p className="text-2xl font-bold text-primary">{completedPomodoros + 1}</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {currentSession.type === "work"
                  ? "Great work! Time for a well-deserved break."
                  : "Break time is over. Ready to get back to work?"}
              </p>

              {settings.autoStartBreaks || settings.autoStartPomodoros ? (
                <p className="text-xs text-muted-foreground">
                  Next session will start automatically in a few seconds...
                </p>
              ) : (
                <Button onClick={closeCompletionPopup} className="w-full">
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Timer className="h-8 w-8" />
          Focus Mode
        </h1>
        <p className="text-muted-foreground">Stay focused with the Pomodoro Technique</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{completedPomodoros}</div>
            <div className="text-sm text-muted-foreground">Pomodoros Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{sessions.filter((s) => s.completed).length}</div>
            <div className="text-sm text-muted-foreground">Total Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                sessions.filter((s) => s.completed && s.type === "work").reduce((acc, s) => acc + s.duration, 0) / 60,
              )}
              h
            </div>
            <div className="text-sm text-muted-foreground">Focus Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Timer */}
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getSessionTypeIcon(sessionType)}
            <CardTitle>{getSessionTypeLabel(sessionType)}</CardTitle>
          </div>
          {currentSession && (
            <Badge variant="outline" className="mx-auto">
              {currentSession.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timer Display */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold mb-4">{formatTime(timeLeft)}</div>
            <Progress value={getProgress()} className="h-2" />
          </div>

          {/* Session Type Selector */}
          {!isRunning && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Type</label>
              <Select
                value={sessionType}
                onValueChange={(value: "work" | "shortBreak" | "longBreak") => {
                  setSessionType(value)
                  setTimeLeft(getDurationForType(value) * 60)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Work Session ({settings.workDuration}m)
                    </div>
                  </SelectItem>
                  <SelectItem value="shortBreak">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      Short Break ({settings.shortBreakDuration}m)
                    </div>
                  </SelectItem>
                  <SelectItem value="longBreak">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      Long Break ({settings.longBreakDuration}m)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button onClick={startSession} size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <>
                {isPaused ? (
                  <Button onClick={resumeSession} size="lg" className="gap-2">
                    <Play className="h-4 w-4" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseSession} size="lg" variant="outline" className="gap-2 bg-transparent">
                    <Pause className="h-4 w-4" />
                    Pause
                  </Button>
                )}
                <Button onClick={stopSession} size="lg" variant="outline" className="gap-2 bg-transparent">
                  <Square className="h-4 w-4" />
                  Stop
                </Button>
              </>
            )}

            <Button onClick={resetTimer} size="lg" variant="outline" className="gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettings((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className="gap-2"
            >
              {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {settings.soundEnabled ? "Sound On" : "Sound Off"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-2 rounded border">
                <div className="flex items-center gap-2">
                  {getSessionTypeIcon(session.type)}
                  <div>
                    <div className="font-medium">{session.name}</div>
                    <div className="text-sm text-muted-foreground">{new Date(session.startTime).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={session.completed ? "default" : "secondary"}>
                    {session.completed ? "Completed" : "Incomplete"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{session.duration}m</span>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No sessions yet. Start your first focus session!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Name Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your Focus Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="e.g., Writing blog post, Studying math, Code review..."
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && sessionName.trim()) {
                  startSession()
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={startSession} disabled={!sessionName.trim()}>
                Start Session
              </Button>
              <Button variant="outline" onClick={() => setShowNameDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Popup */}
      <CompletionPopup />
    </div>
  )
}
