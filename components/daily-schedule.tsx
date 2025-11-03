'use client'

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Clock, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { db } from "@/lib/database"
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

// Common timezones

export function DailySchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [isEditing, setIsEditing] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [selectedTimezone, setSelectedTimezone] = useState<string>("UTC")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "09:00",
    endTime: "10:00",
    color: "bg-purple-500",
  })

  useEffect(() => {
    loadEvents()
  }, [selectedDate, selectedTimezone])

  const loadEvents = async () => {
    try {
      // Get events from database
      const data = await db.getAllData()
      const scheduleEvents = (data.events || []).filter(
        (event: Event) => event.eventType === "schedule" && event.date === selectedDate,
      ) as ScheduleEvent[]
      
      // If no events found in database, try to load from localStorage
      if (scheduleEvents.length === 0 && typeof window !== 'undefined') {
        const localEvents = localStorage.getItem('neo-focus-events')
        if (localEvents) {
          const parsedEvents = JSON.parse(localEvents).filter(
            (event: Event) => event.eventType === "schedule" && event.date === selectedDate
          ) as ScheduleEvent[]
          
          // Convert times to selected timezone
          const convertedEvents = parsedEvents.map(event => ({
            ...event,
            startTime: convertToTimezone(event.startTime, selectedDate),
            endTime: convertToTimezone(event.endTime, selectedDate)
          }))
          
          setEvents(convertedEvents)
          return
        }
      }
      
      // Convert times to selected timezone
      const convertedEvents = scheduleEvents.map(event => ({
        ...event,
        startTime: convertToTimezone(event.startTime, selectedDate),
        endTime: convertToTimezone(event.endTime, selectedDate)
      }))
      
      setEvents(convertedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
      // Try to load from localStorage as fallback
      if (typeof window !== 'undefined') {
        const localEvents = localStorage.getItem('neo-focus-events')
        if (localEvents) {
          const parsedEvents = JSON.parse(localEvents).filter(
            (event: Event) => event.eventType === "schedule" && event.date === selectedDate
          ) as ScheduleEvent[]
          
          // Convert times to selected timezone
          const convertedEvents = parsedEvents.map(event => ({
            ...event,
            startTime: convertToTimezone(event.startTime, selectedDate),
            endTime: convertToTimezone(event.endTime, selectedDate)
          }))
          
          setEvents(convertedEvents)
        }
      }
    }
  }

  const saveEvent = async () => {
    if (!formData.title) {
      alert("Event title is required.")
      return
    }
    
    if (formData.startTime >= formData.endTime) {
      alert("End time must be after start time.")
      return
    }

    try {
      const allData = await db.getAllData() || { events: [] }
      const isNewEvent = !editingEvent

      const newEvent: ScheduleEvent = {
        id: editingEvent?.id || Date.now().toString(),
        title: formData.title,
        description: formData.description || "",
        date: selectedDate,
        time: formData.startTime,
        type: "personal",
        createdAt: new Date().toISOString(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        color: formData.color,
        eventType: "schedule",
      }

      // Get ALL events from the database
      const existingEvents = allData.events || []
      
      // Filter out events on the selected date for conflict checking
      const eventsForSelectedDate = existingEvents.filter(
        (e: ScheduleEvent) =>
          e.id !== newEvent.id && 
          e.date === newEvent.date && 
          e.eventType === "schedule"
      )

      const newStartTime = new Date(`${newEvent.date}T${newEvent.startTime}`).getTime()
      const newEndTime = new Date(`${newEvent.date}T${newEvent.endTime}`).getTime()

      for (const event of eventsForSelectedDate) {
        if (!event.startTime || !event.endTime) continue;
        
        const existingStartTime = new Date(`${event.date}T${event.startTime}`).getTime()
        const existingEndTime = new Date(`${event.date}T${event.endTime}`).getTime()

        if (newStartTime < existingEndTime && newEndTime > existingStartTime) {
          alert(`Time conflict with event: "${event.title}". Please choose a different time.`)
          return
        }
      }

      // Build the updated events array
      let updatedEvents: Event[]
      if (isNewEvent) {
        // For new events, append to all existing events
        updatedEvents = [...existingEvents, newEvent]
      } else {
        // For editing, update only the specific event
        updatedEvents = existingEvents.map((event: Event) =>
          event.id === newEvent.id ? newEvent : event
        )
      }

      // Save events to database
      await db.saveEvents(updatedEvents)
      
      // Backup to localStorage
      try {
        localStorage.setItem('neo-focus-events', JSON.stringify(updatedEvents))
      } catch (err) {
        console.error('Failed to save events to localStorage:', err)
      }
      
      await loadEvents()
      resetForm()
    } catch (error) {
      console.error("Error saving event:", error)
      alert("Failed to save event. Please try again.")
      
      // Try to save to localStorage as fallback
      try {
        const localEvents = localStorage.getItem('neo-focus-events')
        let events = localEvents ? JSON.parse(localEvents) : []
        
        const newEvent = {
          id: editingEvent?.id || Date.now().toString(),
          title: formData.title,
          description: formData.description || "",
          date: selectedDate,
          time: formData.startTime,
          startTime: formData.startTime,
          endTime: formData.endTime,
          color: formData.color,
          type: "personal",
          createdAt: new Date().toISOString(),
          eventType: "schedule",
        }
        
        if (editingEvent) {
          events = events.map((event: any) => event.id === newEvent.id ? newEvent : event)
        } else {
          events.push(newEvent)
        }
        
        localStorage.setItem('neo-focus-events', JSON.stringify(events))
        await loadEvents()
        resetForm()
      } catch (err) {
        console.error("Failed to save to localStorage:", err)
      }
    }
  }

  const deleteEvent = async (eventId: string) => {
    const allData = await db.getAllData()
    const updatedEvents = (allData.events || []).filter(
      (event: Event) => event.id !== eventId,
    )
    await db.saveAllData({ ...allData, events: updatedEvents })
    await loadEvents()
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

  // Convert time to the selected timezone
  const convertToTimezone = (time: string, date: string) => {
    if (!time || !date) return time;
    
    try {
      const dateTimeString = `${date}T${time}:00Z`;
      const utcDate = new Date(dateTimeString);
      
      // Create a date string with the timezone
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: selectedTimezone
      };
      
      const formatter = new Intl.DateTimeFormat('en-US', options);
      return formatter.format(utcDate);
    } catch (error) {
      console.error("Error converting timezone:", error);
      return time;
    }
  }

  const timeToPosition = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    return ((hours * 60 + minutes) / (24 * 60)) * 100
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const todayEvents = events.filter((event) => event.date === selectedDate)

  return (
    <div className="flex h-full gap-4">
      <div className="w-96 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isEditing ? (editingEvent ? "Edit Event" : "New Event") : "Schedule Event"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={`text-sm font-medium mb-2 block`}>Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full`}
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
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Time</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) => setFormData({ ...formData, color: value })}
                  >
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

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Events for {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {todayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No events scheduled
                  </p>
                ) : (
                  todayEvents
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((event) => (
                      <Card
                        key={event.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`w-3 h-3 rounded ${event.color}`} />
                                <h4 className="font-semibold text-sm">{event.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {event.description}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {event.startTime} - {event.endTime}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(event)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteEvent(event.id)}
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
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[700px]">
              <div className="relative" style={{ height: `${TIMELINE_HEIGHT}px` }}>
                <div className="absolute top-0 left-0 w-full">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="relative h-16 border-b border-border"
                    >
                      <div className="absolute left-0 -top-2 w-16 text-sm text-muted-foreground">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute top-0 left-20 right-0 h-full">
                  {todayEvents.map((event) => {
                    const startPos = timeToPosition(event.startTime)
                    const endPos = timeToPosition(event.endTime)
                    const height = endPos - startPos

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
