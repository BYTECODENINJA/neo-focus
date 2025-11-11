"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Edit, Trash2, X, Grid3X3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addYears, subYears, getMonth, getYear, isBefore } from "date-fns"
import { Event, eventTypes } from "@/types"
import { toast } from "sonner"

const CALENDAR_EVENTS_KEY = "calendar-events";

interface DayEventsModalProps {
  isOpen: boolean
  onClose: () => void
  events: Event[]
  onEdit: (event: Event) => void
  onDelete: (eventId: string) => void
  date: Date
}

function DayEventsModal({ isOpen, onClose, events, onEdit, onDelete, date }: DayEventsModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-gray-900/90 backdrop-blur-lg rounded-2xl border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Events for {format(date, "PPP")}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4">Event</th>
                  <th className="text-left py-2 px-4">Time</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id} className="border-b border-gray-700/50">
                    <td className="py-2 px-4">{event.title}</td>
                    <td className="py-2 px-4">{event.time}</td>
                    <td className="py-2 px-4">{eventTypes[event.type]?.label}</td>
                    <td className="py-2 px-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(event)}><Edit size={14} /></Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(event.id)}><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}


interface PastEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  onAddComment: (eventId: string, comment: string) => void
}

function PastEventModal({ isOpen, onClose, event, onAddComment }: PastEventModalProps) {
  const [newComment, setNewComment] = useState("")

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-gray-900/90 backdrop-blur-lg rounded-2xl border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Past Event (Read Only)</h3>
          <p className="text-sm text-gray-400 mb-2">This event is in the past and cannot be edited.</p>
          <div className="space-y-4">
            <p><strong>Title:</strong> {event.title}</p>
            <p><strong>Date:</strong> {format(new Date(event.date), "PPP")}</p>
            {event.comments && event.comments.length > 0 && (
              <div>
                <strong>Comments:</strong>
                <ul className="list-disc list-inside">
                  {event.comments.map((comment, index) => <li key={index}>{comment}</li>)}
                </ul>
              </div>
            )}
            <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a new comment" />
            <Button onClick={() => { onAddComment(event.id, newComment); setNewComment(""); }}>Add Comment</Button>
          </div>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<Event>) => void
  event?: Event | null
  selectedDate?: Date
}

function EventModal({ isOpen, onClose, onSave, event, selectedDate }: EventModalProps) {
  const today = format(new Date(), "yyyy-MM-dd")
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : today,
    time: "09:00",
    location: "",
    type: "personal",
    color: eventTypes.personal.color,
  })

  useEffect(() => {
    if (event) {
      setFormData(event)
    } else if (selectedDate) {
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
      setFormData({
        title: "",
        description: "",
        date: selectedDateStr >= today ? selectedDateStr : today,
        time: "09:00",
        location: "",
        type: "personal",
        color: eventTypes.personal.color,
      })
    }
  }, [event, selectedDate, today])

  const handleSave = () => {
    if (!formData.title?.trim()) {
        toast.error("Event title cannot be empty.")
        return
    }
    if (formData.date && formData.date < today) {
      toast.error("Cannot create events in the past.")
      return
    }
    onSave(formData)
    onClose()
  }

  const updateFormData = <K extends keyof Event>(key: K, value: Event[K]) => {
    setFormData(prev => {
        const newType = key === 'type' ? value as Event['type'] : prev.type;
        const newColor = key === 'type' ? eventTypes[value as Event['type']].color : prev.color;
        return { ...prev, [key]: value, type: newType, color: newColor };
    });
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-black/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/50 p-6">
          <h3 className="text-xl font-bold text-white mb-6">{event ? "Edit Event" : "Create Event"}</h3>
          <div className="space-y-4">
            <Input value={formData.title || ""} onChange={(e) => updateFormData("title", e.target.value)} placeholder="Event Title" className="bg-black/20 border-white/10 text-white"/>
            <div className="grid grid-cols-2 gap-4">
                <Input type="date" min={today} value={formData.date || ""} onChange={(e) => updateFormData("date", e.target.value)} className="bg-black/20 border-white/10 text-white"/>
                <Input type="time" value={formData.time || ""} onChange={(e) => updateFormData("time", e.target.value)} className="bg-black/20 border-white/10 text-white"/>
            </div>
            <select value={formData.type || "personal"} onChange={(e) => updateFormData("type", e.target.value as Event["type"])} className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white">
                {Object.entries(eventTypes).map(([key, config]) => (
                    <option key={key} value={key} className="bg-gray-800">{config.label}</option>
                ))}
            </select>
             <Input value={formData.location || ""} onChange={(e) => updateFormData("location", e.target.value)} placeholder="Location (optional)" className="bg-black/20 border-white/10 text-white"/>
            <textarea value={formData.description || ""} onChange={(e) => updateFormData("description", e.target.value)} placeholder="Description" rows={3} className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white resize-none"/>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">Save</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function Calendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"month" | "year">("month")
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDayEventsModal, setShowDayEventsModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [pastEvent, setPastEvent] = useState<Event | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)

  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem(CALENDAR_EVENTS_KEY)
      if (savedEvents) setEvents(JSON.parse(savedEvents))
    } catch (error) {
      console.error("Failed to load events from localStorage", error)
      toast.error("Failed to load calendar events.")
    }
  }, [])

  const handleEventAction = useCallback((action: (currentEvents: Event[]) => Event[]) => {
    setEvents(prevEvents => {
      const updatedEvents = action(prevEvents);
      try {
        localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(updatedEvents));
      } catch (error) {
        console.error("Failed to save events to localStorage", error);
        toast.error("Failed to save calendar events.");
      }
      return updatedEvents;
    });
  }, []);

  const handleDateClick = (date: Date) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.date), date));
    if (dayEvents.length > 0) {
        setSelectedDate(date)
        setShowDayEventsModal(true)
    } else {
        if (isBefore(date, new Date()) && !isSameDay(date, new Date())) {
            toast.info("Cannot create events in the past.")
            return
        }
        setSelectedDate(date)
        setEditingEvent(null)
        setShowEventModal(true)
    }
  }
  
  const handleAddEventClick = (date: Date) => {
    if (isBefore(date, new Date()) && !isSameDay(date, new Date())) {
        toast.info("Cannot create events in the past.")
        return
    }
    setSelectedDate(date)
    setEditingEvent(null)
    setShowEventModal(true)
  }

  const handleEventSave = (eventData: Partial<Event>) => {
    handleEventAction(currentEvents => {
      const type = eventData.type || 'personal';
      const color = eventTypes[type].color;
      const finalEventData = { ...eventData, type, color };

      if (editingEvent) {
        toast.success("Event updated!")
        return currentEvents.map(e => e.id === editingEvent.id ? { ...e, ...finalEventData, updatedAt: new Date().toISOString() } as Event : e)
      } else {
        toast.success("Event created!")
        return [...currentEvents, { id: Date.now().toString(), createdAt: new Date().toISOString(), comments: [], ...finalEventData } as Event]
      }
    })
  }

  const handleDeleteEvent = (eventId: string) => {
    handleEventAction(currentEvents => {
      const eventToDelete = currentEvents.find(e => e.id === eventId)
      if (eventToDelete && isBefore(new Date(eventToDelete.date), new Date()) && !isSameDay(new Date(eventToDelete.date), new Date())) {
        toast.error("Cannot delete past events.")
        return currentEvents
      }
      toast.info("Event deleted.")
      return currentEvents.filter(e => e.id !== eventId)
    })
  }

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(endOfMonth(currentDate))
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentDate])

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 bg-gray-800/50 rounded-2xl border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">{format(currentDate, "MMMM yyyy")}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft size={16} /></Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight size={16} /></Button>
          <Button onClick={() => { setSelectedDate(new Date()); setEditingEvent(null); setShowEventModal(true); }}><Plus size={16} className="mr-2" /> Add Event</Button>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-2 overflow-hidden">
        {calendarDays.map((day, index) => {
                const dayEvents = events.filter(e => isSameDay(new Date(e.date), day))
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isPastDate = isBefore(day, new Date()) && !isSameDay(day, new Date())

                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className={`relative group rounded-xl border transition-all duration-200 ${
                      isPastDate 
                        ? "bg-black/5 dark:bg-gray-800/5 border-white/5 text-white/20 cursor-not-allowed opacity-50"
                        : isCurrentMonth
                        ? "bg-black/10 dark:bg-gray-700/20 backdrop-blur-sm border-white/10 hover:border-white/30 hover:bg-black/20 cursor-pointer"
                        : "bg-black/5 dark:bg-gray-800/10 border-white/5 text-white/40"
                    } ${isToday ? "ring-2 ring-purple-400/50 bg-purple-500/10" : ""} ${
                      isSelected ? "ring-2 ring-blue-400/50 bg-blue-500/10" : ""
                    }`}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => !isPastDate && setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    <div className="p-2 flex items-start justify-between">
                      <span
                        className={`text-sm font-medium ${
                          isPastDate 
                            ? "text-white/20" 
                            : isCurrentMonth 
                            ? "text-white" 
                            : "text-white/40"
                        } ${isToday ? "text-purple-300" : ""}`}
                      >
                        {format(day, "d")}
                      </span>

                      <AnimatePresence>
                        {hoveredDate && isSameDay(hoveredDate, day) && !isPastDate && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddEventClick(day)
                            }}
                            className="w-6 h-6 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center transition-colors"
                            title="Add event"
                          >
                            <Plus size={12} className="text-white" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="px-2 pb-2 space-y-1 min-h-[60px]">
                      {dayEvents.slice(0, 3).map((event) => {
                        const eventDate = new Date(event.date)
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        const isPastEvent = eventDate < today

                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group/event relative"
                          >
                            <div
                              className={`text-xs p-1 rounded-md truncate cursor-pointer transition-all hover:scale-105 ${
                                isPastEvent ? "opacity-75" : ""
                              }`}
                              style={{ backgroundColor: `${event.color}20`, borderLeft: `3px solid ${event.color}` }}
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isPastEvent) {
                                  setPastEvent(event)
                                } else {
                                  setEditingEvent(event); setShowEventModal(true);
                                }
                              }}
                              title={`${event.title}${isPastEvent ? " (Past Event)" : ""}`}
                            >
                              <span className="text-white/90">{event.title}</span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )
              })}
      </div>
      <EventModal isOpen={showEventModal} onClose={() => setShowEventModal(false)} onSave={handleEventSave} event={editingEvent} selectedDate={selectedDate} />
       <DayEventsModal 
          isOpen={showDayEventsModal} 
          onClose={() => setShowDayEventsModal(false)} 
          events={events.filter(e => selectedDate && isSameDay(new Date(e.date), selectedDate))} 
          onEdit={(event) => { 
              setEditingEvent(event); 
              setShowDayEventsModal(false); 
              setShowEventModal(true); 
          }} 
          onDelete={handleDeleteEvent} 
          date={selectedDate || new Date()} 
      />
      {pastEvent && <PastEventModal isOpen={!!pastEvent} onClose={() => setPastEvent(null)} event={pastEvent} onAddComment={(id, cmt) => handleEventAction(evts => evts.map(e => e.id === id ? { ...e, comments: [...(e.comments || []), cmt] } : e))} />}
    </div>
  )
}
