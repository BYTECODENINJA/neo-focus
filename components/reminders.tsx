"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Bell, Calendar, Clock, Repeat, Edit, Trash2, Volume2, VolumeX, AlertCircle } from "lucide-react"

interface Reminder {
  id: string
  title: string
  description: string
  date: string
  time: string
  repeat: "none" | "daily" | "weekly" | "monthly"
  active: boolean
  createdAt: string
  updatedAt: string
}

interface ActiveAlarm {
  id: string
  reminder: Reminder
  startTime: number
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [activeAlarms, setActiveAlarms] = useState<ActiveAlarm[]>([])
  const [showNewReminderDialog, setShowNewReminderDialog] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Form state
  const [reminderForm, setReminderForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    repeat: "none" as "none" | "daily" | "weekly" | "monthly",
  })

  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const alarmIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  useEffect(() => {
    loadReminders()
    loadSettings()

    // Create audio element for alarms
    audioRef.current = new Audio("/alarm-sound.mp3")
    if (audioRef.current) {
      audioRef.current.loop = true
    }

    // Start checking for reminders
    startReminderChecker()

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      stopAllAlarms()
    }
  }, [])

  const loadReminders = () => {
    const saved = localStorage.getItem("aura-reminders")
    if (saved) {
      const parsedReminders = JSON.parse(saved)
      setReminders(
        parsedReminders.sort(
          (a: Reminder, b: Reminder) =>
            new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime(),
        ),
      )
    }
  }

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("aura-user-settings")
    if (savedSettings) {
      const userSettings = JSON.parse(savedSettings)
      setSoundEnabled(userSettings.soundEnabled !== false)
    }
  }

  const saveReminders = (updatedReminders: Reminder[]) => {
    const sortedReminders = updatedReminders.sort(
      (a, b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime(),
    )
    localStorage.setItem("aura-reminders", JSON.stringify(sortedReminders))
    setReminders(sortedReminders)
  }

  const startReminderChecker = () => {
    checkIntervalRef.current = setInterval(() => {
      checkForDueReminders()
    }, 1000) // Check every second for precision
  }

  const checkForDueReminders = () => {
    const now = new Date()
    const currentDate = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

    reminders.forEach((reminder) => {
      if (reminder.active && reminder.date === currentDate && reminder.time === currentTime) {
        // Check if alarm is not already active for this reminder
        const existingAlarm = activeAlarms.find((alarm) => alarm.reminder.id === reminder.id)
        if (!existingAlarm) {
          triggerAlarm(reminder)

          // Handle repeat logic
          if (reminder.repeat !== "none") {
            scheduleNextReminder(reminder)
          }
        }
      }
    })
  }

  const triggerAlarm = (reminder: Reminder) => {
    const alarm: ActiveAlarm = {
      id: Date.now().toString(),
      reminder,
      startTime: Date.now(),
    }

    setActiveAlarms((prev) => [...prev, alarm])

    // Start repeating alarm sound
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }

    // Set up repeating sound interval
    const soundInterval = setInterval(() => {
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(console.error)
      }
    }, 3000) // Repeat every 3 seconds

    alarmIntervalsRef.current.set(alarm.id, soundInterval)
  }

  const stopAlarm = (alarmId: string) => {
    // Stop the sound
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Clear the sound interval
    const interval = alarmIntervalsRef.current.get(alarmId)
    if (interval) {
      clearInterval(interval)
      alarmIntervalsRef.current.delete(alarmId)
    }

    // Remove from active alarms
    setActiveAlarms((prev) => prev.filter((alarm) => alarm.id !== alarmId))
  }

  const stopAllAlarms = () => {
    activeAlarms.forEach((alarm) => {
      stopAlarm(alarm.id)
    })
  }

  const scheduleNextReminder = (reminder: Reminder) => {
    const currentDate = new Date(reminder.date)
    let nextDate: Date

    switch (reminder.repeat) {
      case "daily":
        nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
        break
      case "weekly":
        nextDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000)
        break
      case "monthly":
        nextDate = new Date(currentDate)
        nextDate.setMonth(nextDate.getMonth() + 1)
        break
      default:
        return
    }

    const updatedReminder = {
      ...reminder,
      date: nextDate.toISOString().split("T")[0],
      updatedAt: new Date().toISOString(),
    }

    const updatedReminders = reminders.map((r) => (r.id === reminder.id ? updatedReminder : r))
    saveReminders(updatedReminders)
  }

  const createReminder = () => {
    if (!reminderForm.title.trim() || !reminderForm.date || !reminderForm.time) return

    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: reminderForm.title,
      description: reminderForm.description,
      date: reminderForm.date,
      time: reminderForm.time,
      repeat: reminderForm.repeat,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedReminders = [...reminders, newReminder]
    saveReminders(updatedReminders)

    setReminderForm({
      title: "",
      description: "",
      date: "",
      time: "",
      repeat: "none",
    })
    setShowNewReminderDialog(false)
  }

  const updateReminder = () => {
    if (!editingReminder || !reminderForm.title.trim() || !reminderForm.date || !reminderForm.time) return

    const updatedReminder: Reminder = {
      ...editingReminder,
      title: reminderForm.title,
      description: reminderForm.description,
      date: reminderForm.date,
      time: reminderForm.time,
      repeat: reminderForm.repeat,
      updatedAt: new Date().toISOString(),
    }

    const updatedReminders = reminders.map((reminder) =>
      reminder.id === editingReminder.id ? updatedReminder : reminder,
    )
    saveReminders(updatedReminders)
    setEditingReminder(null)
    resetForm()
  }

  const deleteReminder = (reminderId: string) => {
    const updatedReminders = reminders.filter((reminder) => reminder.id !== reminderId)
    saveReminders(updatedReminders)

    // Stop any active alarms for this reminder
    const activeAlarm = activeAlarms.find((alarm) => alarm.reminder.id === reminderId)
    if (activeAlarm) {
      stopAlarm(activeAlarm.id)
    }
  }

  const toggleReminderActive = (reminderId: string) => {
    const updatedReminders = reminders.map((reminder) =>
      reminder.id === reminderId
        ? { ...reminder, active: !reminder.active, updatedAt: new Date().toISOString() }
        : reminder,
    )
    saveReminders(updatedReminders)
  }

  const startEditing = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setReminderForm({
      title: reminder.title,
      description: reminder.description,
      date: reminder.date,
      time: reminder.time,
      repeat: reminder.repeat,
    })
  }

  const resetForm = () => {
    setReminderForm({
      title: "",
      description: "",
      date: "",
      time: "",
      repeat: "none",
    })
    setEditingReminder(null)
  }

  const getRepeatLabel = (repeat: string) => {
    switch (repeat) {
      case "daily":
        return "Daily"
      case "weekly":
        return "Weekly"
      case "monthly":
        return "Monthly"
      default:
        return "Once"
    }
  }

  const isOverdue = (reminder: Reminder) => {
    const now = new Date()
    const reminderDateTime = new Date(`${reminder.date} ${reminder.time}`)
    return reminderDateTime < now && reminder.active
  }

  const getUpcomingReminders = () => {
    const now = new Date()
    return reminders
      .filter((reminder) => {
        const reminderDateTime = new Date(`${reminder.date} ${reminder.time}`)
        return reminderDateTime > now && reminder.active
      })
      .slice(0, 5)
  }

  // Active Alarm Popup Component
  const AlarmPopup = ({ alarm }: { alarm: ActiveAlarm }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 animate-in fade-in-0 zoom-in-95 border-red-500 border-2">
        <CardHeader className="text-center bg-red-50 dark:bg-red-950">
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="h-6 w-6 text-red-500 animate-pulse" />
            <CardTitle className="text-red-700 dark:text-red-300">Reminder Alert!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{alarm.reminder.title}</h3>
            {alarm.reminder.description && <p className="text-muted-foreground mb-4">{alarm.reminder.description}</p>}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(alarm.reminder.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {alarm.reminder.time}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => stopAlarm(alarm.id)} className="flex-1" variant="destructive">
              Stop Alarm
            </Button>
            <Button
              onClick={() => {
                stopAlarm(alarm.id)
                // Snooze for 5 minutes
                const snoozeTime = new Date(Date.now() + 5 * 60 * 1000)
                const snoozeReminder = {
                  ...alarm.reminder,
                  id: Date.now().toString(),
                  title: `${alarm.reminder.title} (Snoozed)`,
                  date: snoozeTime.toISOString().split("T")[0],
                  time: snoozeTime.toTimeString().slice(0, 5),
                  repeat: "none",
                }
                const updatedReminders = [...reminders, snoozeReminder]
                saveReminders(updatedReminders)
              }}
              variant="outline"
              className="flex-1"
            >
              Snooze 5m
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Reminders
          </h1>
          <p className="text-muted-foreground">Never miss important tasks and events</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="gap-2">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "Sound On" : "Sound Off"}
          </Button>

          <Dialog open={showNewReminderDialog} onOpenChange={setShowNewReminderDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Reminder title"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, title: e.target.value }))}
                />

                <Textarea
                  placeholder="Description (optional)"
                  value={reminderForm.description}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date</label>
                    <Input
                      type="date"
                      value={reminderForm.date}
                      onChange={(e) => setReminderForm((prev) => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Time</label>
                    <Input
                      type="time"
                      value={reminderForm.time}
                      onChange={(e) => setReminderForm((prev) => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Repeat</label>
                  <Select
                    value={reminderForm.repeat}
                    onValueChange={(value: "none" | "daily" | "weekly" | "monthly") =>
                      setReminderForm((prev) => ({ ...prev, repeat: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={createReminder}
                    disabled={!reminderForm.title.trim() || !reminderForm.date || !reminderForm.time}
                  >
                    Create Reminder
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewReminderDialog(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active Alarms Count */}
      {activeAlarms.length > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
                <span className="font-medium text-red-700 dark:text-red-300">
                  {activeAlarms.length} Active Alarm{activeAlarms.length > 1 ? "s" : ""}
                </span>
              </div>
              <Button onClick={stopAllAlarms} variant="destructive" size="sm">
                Stop All Alarms
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getUpcomingReminders().map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between p-3 rounded border">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{reminder.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(`${reminder.date} ${reminder.time}`).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{getRepeatLabel(reminder.repeat)}</Badge>
              </div>
            ))}

            {getUpcomingReminders().length === 0 && (
              <div className="text-center text-muted-foreground py-4">No upcoming reminders</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>All Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-3 rounded border ${
                    isOverdue(reminder) ? "border-red-200 bg-red-50 dark:bg-red-950" : ""
                  } ${!reminder.active ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.active}
                        onCheckedChange={() => toggleReminderActive(reminder.id)}
                        size="sm"
                      />
                      {isOverdue(reminder) && <AlertCircle className="h-4 w-4 text-red-500" />}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{reminder.title}</div>
                      {reminder.description && (
                        <div className="text-sm text-muted-foreground">{reminder.description}</div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(reminder.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reminder.time}
                        </div>
                        {reminder.repeat !== "none" && (
                          <div className="flex items-center gap-1">
                            <Repeat className="h-3 w-3" />
                            {getRepeatLabel(reminder.repeat)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEditing(reminder)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteReminder(reminder.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {reminders.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No reminders yet</p>
                  <p className="text-sm">Create your first reminder to get started!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Reminder Dialog */}
      <Dialog open={!!editingReminder} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Reminder title"
              value={reminderForm.title}
              onChange={(e) => setReminderForm((prev) => ({ ...prev, title: e.target.value }))}
            />

            <Textarea
              placeholder="Description (optional)"
              value={reminderForm.description}
              onChange={(e) => setReminderForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input
                  type="date"
                  value={reminderForm.date}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Time</label>
                <Input
                  type="time"
                  value={reminderForm.time}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Repeat</label>
              <Select
                value={reminderForm.repeat}
                onValueChange={(value: "none" | "daily" | "weekly" | "monthly") =>
                  setReminderForm((prev) => ({ ...prev, repeat: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Once</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={updateReminder}
                disabled={!reminderForm.title.trim() || !reminderForm.date || !reminderForm.time}
              >
                Update Reminder
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Alarm Popups */}
      {activeAlarms.map((alarm) => (
        <AlarmPopup key={alarm.id} alarm={alarm} />
      ))}
    </div>
  )
}
