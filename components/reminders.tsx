'use client'

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Bell,
  Clock,
  Calendar,
  Trash2,
  Edit,
  Save,
  X,
  Snooze,
  VolumeX,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useNotifications } from "@/contexts/notification-context"
import { toast } from "sonner"

import { Reminder } from "@/types"

interface RemindersProps {
  reminders: Reminder[]
  setReminders: (reminders: Reminder[]) => void
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const reminderTypes = [
  { value: "general", label: "General", icon: "📋" },
  { value: "task", label: "Task", icon: "✅" },
  { value: "habit", label: "Habit", icon: "🎯" },
  { value: "break", label: "Break", icon: "☕" },
  { value: "hydration", label: "Hydration", icon: "💧" },
  { value: "custom", label: "Custom", icon: "🔔" },
]

const initialFormState: Partial<Reminder> = {
  title: "",
  message: "",
  type: "general",
  time: "",
  scheduleType: "daily",
  days: [],
  date: "",
  enabled: true,
}

export function Reminders({ reminders, setReminders }: RemindersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Partial<Reminder> | null>(null)
  const [ringingReminder, setRingingReminder] = useState<Reminder | null>(null)
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null)

  const { showNotification, requestNotificationPermission } = useNotifications()

  useEffect(() => {
    requestNotificationPermission()
  }, [requestNotificationPermission])

  const playAlarm = useCallback((reminder: Reminder) => {
    setRingingReminder(reminder)
    const audio = new Audio('/alarm.mp3')
    audio.loop = true
    audio.play().catch(err => console.error("Error playing alarm:", err))
    setAlarmAudio(audio)

    const notificationId = toast.info(reminder.title, {
      description: reminder.message,
      duration: 60000, // 1 minute
      icon: <Bell className="animate-shake" />,
      action: {
        label: "Snooze (5m)",
        onClick: () => {
          snoozeReminder(reminder.id)
          toast.dismiss(notificationId)
        },
      },
      onDismiss: () => stopAlarm(),
    })
  }, [showNotification])

  const stopAlarm = useCallback(() => {
    if (alarmAudio) {
      alarmAudio.pause()
      setAlarmAudio(null)
    }
    setRingingReminder(null)
  }, [alarmAudio])

  const snoozeReminder = (reminderId: string) => {
    stopAlarm()
    const reminder = reminders.find(r => r.id === reminderId)
    if (!reminder) return

    const snoozeTime = new Date(Date.now() + 5 * 60000) // 5 minutes from now
    const snoozedReminder: Reminder = {
      ...reminder,
      scheduleType: "one-time",
      date: snoozeTime.toISOString().split('T')[0],
      time: `${snoozeTime.getHours().toString().padStart(2, '0')}:${snoozeTime.getMinutes().toString().padStart(2, '0')}`,
      isSnoozed: true, // Custom flag to indicate this is a snoozed instance
    }

    // Instead of modifying the original, we add a temporary reminder
    // This is a simplified approach. A more robust solution might involve a separate snooze queue.
    setReminders([...reminders, snoozedReminder])
    toast.info(`"${reminder.title}" snoozed for 5 minutes.`)
  }

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      reminders.forEach((reminder) => {
        if (!reminder.enabled || ringingReminder?.id === reminder.id) return

        const [hours, minutes] = reminder.time.split(':').map(Number)
        const reminderTime = new Date()
        reminderTime.setHours(hours, minutes, 0, 0)

        let shouldRing = false
        if (reminder.scheduleType === "one-time") {
          const reminderDate = new Date(reminder.date!)
          if (reminderDate.getFullYear() === now.getFullYear() &&
              reminderDate.getMonth() === now.getMonth() &&
              reminderDate.getDate() === now.getDate() &&
              reminderTime.getTime() <= now.getTime() &&
              now.getTime() - reminderTime.getTime() < 60000) { // Ring within a 1-minute window
            shouldRing = true
          }
        } else { // Recurring
          const today = now.getDay()
          if ((!reminder.days || reminder.days.length === 0 || reminder.days.includes(today))) {
             if (reminderTime.getHours() === now.getHours() && reminderTime.getMinutes() === now.getMinutes()) {
                shouldRing = true;
             }
          }
        }

        if (shouldRing) {
          playAlarm(reminder)
          // If it's a one-time reminder (and not a snoozed one), disable it after it rings
          if (reminder.scheduleType === 'one-time' && !reminder.isSnoozed) {
            setReminders(reminders.map(r => r.id === reminder.id ? { ...r, enabled: false } : r))
          } else if (reminder.isSnoozed) {
            // Remove the temporary snoozed reminder after it rings
            setReminders(reminders.filter(r => r.id !== reminder.id));
          }
        }
      })
    }

    const intervalId = setInterval(checkReminders, 1000 * 10) // Check every 10 seconds
    return () => clearInterval(intervalId)
  }, [reminders, ringingReminder, playAlarm, setReminders])
  

  const handleOpenModal = (reminder: Partial<Reminder> | null = null) => {
    if (reminder) {
      setEditingReminder({ ...reminder })
    } else {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
      setEditingReminder({ ...initialFormState, time: currentTime, date: new Date().toISOString().split('T')[0] })
    }
    setIsModalOpen(true)
  }

  const handleSaveReminder = () => {
    if (!editingReminder || !editingReminder.title || !editingReminder.time) {
      toast.error("Title and time are required.")
      return
    }

    if (editingReminder.scheduleType === "one-time" && !editingReminder.date) {
      toast.error("Please select a date for the one-time reminder.")
      return
    }

    let updatedReminders: Reminder[]

    if (editingReminder.id) {
      updatedReminders = reminders.map((r) =>
        r.id === editingReminder.id ? (editingReminder as Reminder) : r,
      )
      toast.success("Reminder updated successfully!")
    } else {
      const newReminder: Reminder = {
        ...initialFormState,
        ...editingReminder,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      } as Reminder
      updatedReminders = [newReminder, ...reminders]
      toast.success("Reminder added successfully!")
    }

    setReminders(updatedReminders.sort((a, b) => a.time.localeCompare(b.time)))
    setIsModalOpen(false)
    setEditingReminder(null)
  }

  const toggleReminder = (reminderId: string) => {
    setReminders(
      reminders.map((r) => (r.id === reminderId ? { ...r, enabled: !r.enabled } : r)),
    )
  }

  const deleteReminder = (reminderId: string) => {
    setReminders(reminders.filter((r) => r.id !== reminderId))
    toast.success("Reminder deleted.")
  }

  const getScheduleText = (reminder: Reminder) => {
    if (reminder.isSnoozed) return "Snoozed"
    if (reminder.scheduleType === "one-time") {
        if (!reminder.date) return "One-time";
        const date = new Date(reminder.date);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + timezoneOffset);
        return `One-time on ${adjustedDate.toLocaleDateString()}`;
    }
    if (reminder.scheduleType === "daily" || !reminder.days || reminder.days.length === 0) {
        return "Daily";
    }
    if (reminder.days.length === 7) return "Every day";
    if (reminder.days.length === 5 && reminder.days.every((d) => d >= 1 && d <= 5)) return "Weekdays";
    if (reminder.days.length === 2 && reminder.days.includes(0) && reminder.days.includes(6)) return "Weekends";
    return reminder.days
      .sort()
      .map((d) => dayNames[d])
      .join(", ");
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-4xl font-bold">Reminders</h1>
        <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus size={20} className="mr-2" />
          Add Reminder
        </Button>
      </motion.div>

      <AnimatePresence>
        {ringingReminder && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-red-500/20 border border-red-500/50 rounded-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-red-400 animate-shake" />
              <div>
                <h3 className="font-bold text-lg">{ringingReminder.title}</h3>
                <p className="text-white/80">{ringingReminder.message}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => snoozeReminder(ringingReminder.id)} variant="outline" size="sm">
                <Snooze size={16} className="mr-2" />
                Snooze
              </Button>
              <Button onClick={stopAlarm} variant="destructive" size="sm">
                <VolumeX size={16} className="mr-2" />
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {reminders.length === 0 && !ringingReminder ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Bell size={48} className="mx-auto mb-4 text-white/40" />
            <h3 className="text-xl font-bold mb-2">No reminders yet</h3>
            <p className="text-white/60 mb-4">Click "Add Reminder" to get started.</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mr-4 pr-4">
          <AnimatePresence>
            {reminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`mb-4 rounded-2xl border transition-all duration-300 ${!reminder.enabled ? "bg-black/10 border-white/5" : "bg-black/20 border-white/10"} ${reminder.isSnoozed ? 'border-blue-500/50' : ''}`}>
                <div className={`p-5 ${!reminder.enabled ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{reminderTypes.find(t => t.value === reminder.type)?.icon}</span>
                        <h3 className="text-lg font-bold">{reminder.title}</h3>
                      </div>
                      <p className="text-white/70 text-sm mb-3">{reminder.message}</p>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <div className="flex items-center gap-1.5"><Clock size={14} /><span>{reminder.time}</span></div>
                        <div className="flex items-center gap-1.5"><Calendar size={14} /><span>{getScheduleText(reminder)}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button onClick={() => toggleReminder(reminder.id)} variant="ghost" size="icon" className="w-8 h-8">
                         <Check size={20} className={`transition-colors ${reminder.enabled ? "text-green-400" : "text-gray-500"}`} />
                      </Button>
                      <Button onClick={() => handleOpenModal(reminder)} variant="ghost" size="icon" className="w-8 h-8">
                        <Edit size={16} />
                      </Button>
                      <Button onClick={() => deleteReminder(reminder.id)} variant="ghost" size="icon" className="w-8 h-8 text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-lg border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>{editingReminder?.id ? "Edit Reminder" : "Add New Reminder"}</DialogTitle>
          </DialogHeader>
          {editingReminder && (
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Reminder title"
                value={editingReminder.title}
                onChange={(e) => setEditingReminder({ ...editingReminder, title: e.target.value })}
                className="bg-white/10 border-white/20"
              />
              <Textarea
                placeholder="Message (optional)"
                value={editingReminder.message}
                onChange={(e) => setEditingReminder({ ...editingReminder, message: e.target.value })}
                className="bg-white/10 border-white/20 resize-none"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                 <Select value={editingReminder.type} onValueChange={(type) => setEditingReminder({ ...editingReminder, type: type as any })}>
                    <SelectTrigger className="bg-white/10 border-white/20"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {reminderTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
                    </SelectContent>
                 </Select>
                 <Input
                    type="time"
                    value={editingReminder.time}
                    onChange={(e) => setEditingReminder({ ...editingReminder, time: e.target.value })}
                    className="bg-white/10 border-white/20"
                  />
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">Schedule</label>
                <div className="flex gap-2 rounded-lg bg-black/20 p-1">
                    <Button variant={editingReminder.scheduleType === 'daily' ? 'secondary' : 'ghost'} onClick={() => setEditingReminder({...editingReminder, scheduleType: 'daily', days: []})} className="flex-1">Recurring</Button>
                    <Button variant={editingReminder.scheduleType === 'one-time' ? 'secondary' : 'ghost'} onClick={() => setEditingReminder({...editingReminder, scheduleType: 'one-time'})} className="flex-1">One-time</Button>
                </div>
              </div>

              {editingReminder.scheduleType === 'one-time' ? (
                <Input
                  type="date"
                  value={editingReminder.date}
                  onChange={(e) => setEditingReminder({ ...editingReminder, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/10 border-white/20"
                />
              ) : (
                <div>
                  <p className="text-sm text-white/60 mb-2">Repeat on (leave empty for daily):</p>
                  <div className="flex justify-center gap-1.5 flex-wrap">
                    {dayNames.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const currentDays = editingReminder.days || []
                          const newDays = currentDays.includes(index)
                            ? currentDays.filter((d) => d !== index)
                            : [...currentDays, index]
                          setEditingReminder({ ...editingReminder, days: newDays })
                        }}
                        className={`w-10 h-10 rounded-lg text-sm transition-all flex items-center justify-center ${
                          editingReminder.days?.includes(index)
                            ? "bg-purple-500 text-white"
                            : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveReminder} className="bg-gradient-to-r from-purple-500 to-blue-500">
                  <Save size={16} className="mr-2" />
                  {editingReminder.id ? "Save Changes" : "Add Reminder"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
