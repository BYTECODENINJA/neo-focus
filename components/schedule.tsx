"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Clock, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ScheduleEvent {
  id: string
  title: string
  description: string
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  color: string
  date: string // YYYY-MM-DD format
}

const eventColors = [
  { name: "Purple", value: "bg-purple-500" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Pink", value: "bg-pink-500" },
]

export function Schedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isEditing, setIsEditing] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "bg-purple-500",
  })

  useEffect(() => {
    loadEvents()
  }, [selectedDate])

  const loadEvents = async () => {
    if (typeof window !== "undefined" && window.electronAPI) {
      const loadedEvents = await window.electronAPI.getScheduleEvents(selectedDate)
      setEvents(loadedEvents || [])
    }
  }

  const saveEvent = async () => {
    const newEvent: ScheduleEvent = {
      id: editingEvent?.id || Date.now().toString(),
      ...formData,
      date: selectedDate,
    }

    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.saveScheduleEvent(newEvent)
      await loadEvents()
      resetForm()
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.deleteScheduleEvent(eventId)
      await loadEvents()
    }
  }

  const startEdit = (event: ScheduleEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      color: event.color,
    })
    setIsEditing(true)
  }

  const resetForm = () => {
    setEditingEvent(null)
    setFormData({
      title: "",
      description: "",
      startTime: "09:00",
      endTime: "10:00",
      color: "bg-purple-500",
    })
    setIsEditing(false)
  }

  const timeToPosition = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    return ((hours * 60 + minutes) / (24 * 60)) * 100
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const todayEvents = events.filter((event) => event.date === selectedDate)

  return (
    <div className="flex h-full gap-4">
      {/* Left - Event Editor */}
      <div className="w-96 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isEditing ? (editingEvent ? "Edit Event" : "New Event") : "Schedule Event"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full"
              />
            </div>

            {isEditing && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">Event Title</label>
                  <Input
                    placeholder="Event title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Event description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Time</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eventColors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.value}`} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveEvent} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={resetForm} variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}

            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Event List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events for {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {todayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No events scheduled</p>
                ) : (
                  todayEvents
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((event) => (
                      <Card key={event.id} className="cursor-pointer hover:bg-accent transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-3 h-3 rounded ${event.color}`} />
                                <h4 className="font-semibold text-sm">{event.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">{event.description}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => startEdit(event)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => deleteEvent(event.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right - Timeline View */}
      <div className="flex-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[700px]">
              <div className="relative">
                {/* Hour markers */}
                <div className="space-y-0">
                  {hours.map((hour) => (
                    <div key={hour} className="relative h-16 border-b border-border">
                      <div className="absolute left-0 top-0 w-16 text-sm text-muted-foreground">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      <div className="absolute left-20 right-0 top-0 bottom-0">
                        {/* Events in this hour */}
                        {todayEvents
                          .filter((event) => {
                            const eventStartHour = Number.parseInt(event.startTime.split(":")[0])
                            const eventEndHour = Number.parseInt(event.endTime.split(":")[0])
                            return hour >= eventStartHour && hour < eventEndHour
                          })
                          .map((event) => {
                            const startPos = timeToPosition(event.startTime)
                            const endPos = timeToPosition(event.endTime)
                            const height = endPos - startPos
                            const isFirstHour = hour === Number.parseInt(event.startTime.split(":")[0])

                            if (!isFirstHour) return null

                            return (
                              <div
                                key={event.id}
                                className={`absolute left-0 right-0 ${event.color} bg-opacity-80 rounded-lg p-2 text-white text-xs overflow-hidden`}
                                style={{
                                  top: `${(startPos % (100 / 24)) * 24}%`,
                                  height: `${(height / 100) * 700}px`,
                                }}
                              >
                                <div className="font-semibold">{event.title}</div>
                                <div className="text-white/80 text-[10px]">
                                  {event.startTime} - {event.endTime}
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
