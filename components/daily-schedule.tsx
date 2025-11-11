'use client'

import { useState, useEffect, useMemo } from "react"
import { Plus, Edit, Trash2, Clock, Save, X, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Event } from "@/types"

interface ScheduleEvent extends Event {
  startTime: string // HH:MM format
  endTime: string // HH:MM format
}

const eventColors = [
  { name: "Purple", value: "bg-purple-500" },
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Pink", value: "bg-pink-500" },
]

const TIMELINE_HEIGHT = 24 * 64 // 24 hours * 64px/hour (h-16)

interface DailyScheduleProps {
  events: ScheduleEvent[]
  isLoading: boolean
  error: Error | null
  onSaveEvent: (event: Omit<ScheduleEvent, 'id'> | ScheduleEvent) => Promise<void>
  onDeleteEvent: (eventId: string) => Promise<void>
}

export function DailySchedule({ events, isLoading, error, onSaveEvent, onDeleteEvent }: DailyScheduleProps) {
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

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Event title is required.")
      return
    }
    if (formData.startTime >= formData.endTime) {
      toast.error("End time must be after start time.")
      return
    }

    const eventToSave = {
      ...(editingEvent || {}),
      id: editingEvent?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description || "",
      date: selectedDate,
      time: formData.startTime,
      type: "personal",
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      color: formData.color,
      eventType: "schedule",
    } as ScheduleEvent;

    try {
      await onSaveEvent(eventToSave);
      toast.success(editingEvent ? "Event updated" : "Event created");
      resetForm();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to save event.");
      }
    }
  }

  const handleDelete = async (eventId: string) => {
    try {
      await onDeleteEvent(eventId);
      toast.success("Event deleted");
    } catch (err) {
      toast.error("Failed to delete event.");
    }
  }

  const startEdit = (event: ScheduleEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || "",
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
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number)
    return ((hours * 60 + minutes) / (24 * 60)) * 100
  }

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const todayEvents = useMemo(() => 
    (events || [])
      .filter((event) => event.date === selectedDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)), 
    [events, selectedDate]
  );

  return (
    <div className="flex h-full gap-4 p-4 bg-gray-900 text-white">
      <div className="w-96 space-y-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">
              {isEditing ? (editingEvent ? "Edit Event" : "New Event") : "Schedule Event"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={`text-sm font-medium mb-2 block text-gray-300`}>Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full bg-gray-700 border-gray-600 text-white`}
              />
            </div>

            {isEditing ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">Event Title</label>
                  <Input
                    placeholder="Event title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">Description</label>
                  <Textarea
                    placeholder="Event description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">Start Time</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-300">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-300">Color</label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {eventColors.map((color) => (
                        <SelectItem key={color.value} value={color.value} className="hover:bg-gray-700">
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
                  <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={resetForm} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Events for {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Loader className="h-6 w-6 animate-spin text-purple-400" />
                  </div>
                ) : error ? (
                  <p className="text-sm text-red-400 text-center py-4">Error loading events.</p>
                ) : todayEvents.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No events scheduled
                  </p>
                ) : (
                  todayEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="bg-gray-700/50 hover:bg-gray-700 transition-colors border-l-4"
                        style={{ borderLeftColor: event.color.replace('bg-', '').split('-')[0] }}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-white">{event.title}</h4>
                              <p className="text-xs text-gray-300 mb-1">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(event)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(event.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
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

      <div className="flex-1 space-y-4">
        <Card className="bg-gray-800 border-gray-700 h-full">
          <CardHeader>
            <CardTitle className="text-white">24-Hour Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="relative" style={{ height: `${TIMELINE_HEIGHT}px` }}>
                <div className="absolute top-0 left-0 w-full">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="relative h-16 border-b border-gray-700"
                    >
                      <div className="absolute left-0 -top-2 w-16 text-sm text-gray-400">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute top-0 left-20 right-0 h-full">
                  {todayEvents.map((event) => {
                    const startPos = timeToPosition(event.startTime)
                    const endPos = timeToPosition(event.endTime)
                    const height = Math.max(0, endPos - startPos)

                    if (height === 0) return null;

                    return (
                      <div
                        key={event.id}
                        className={`absolute left-0 right-0 ${event.color} bg-opacity-80 rounded-lg p-2 text-white text-xs overflow-hidden`}
                        style={{
                          top: `${startPos}%`,
                          height: `${height}%`,
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
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
