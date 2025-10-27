"use client"

/**
 * Calendar Component - Enhanced Event Management with Glassmorphism Design
 * Features: Month/Year views, event creation, glassmorphism effects, responsive design
 * Integrates with database for persistent event storage
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus, CalendarIcon, Edit, Trash2, X, Grid3X3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addYears,
  subYears,
  getMonth,
  getYear,
} from "date-fns"
import { Event, eventTypes } from "@/types"

// Component props interface
interface CalendarProps {
  events: Event[]
  setEvents: (events: Event[]) => void
}



// Month names for year view
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

/**
 * Event Creation/Edit Modal Component
 */
interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Partial<Event>) => void
  event?: Event | null
  selectedDate?: Date
}

/**
 * Past Event Read-Only Modal Component
 */
interface PastEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  onAddComment: (eventId: string, comment: string) => void
}

function PastEventModal({ isOpen, onClose, event, onAddComment }: PastEventModalProps) {
  const [newComment, setNewComment] = useState("")

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(event.id, newComment.trim())
      setNewComment("")
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-black/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">Past Event</h3>
              <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-full">Read Only</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Event Title */}
            <div>
              <Label className="text-white/80 mb-2 block">Event Title</Label>
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-white">
                {event.title}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80 mb-2 block">Date</Label>
                <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-white">
                  {format(new Date(event.date), "MMM dd, yyyy")}
                </div>
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Time</Label>
                <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-white">
                  {event.time}
                </div>
              </div>
            </div>

            {/* Event Type */}
            <div>
              <Label className="text-white/80 mb-2 block">Category</Label>
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-white flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: event.color }}
                />
                {eventTypes[event.type]?.label || event.type}
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div>
                <Label className="text-white/80 mb-2 block">Location</Label>
                <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-white">
                  {event.location}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <Label className="text-white/80 mb-2 block">Description</Label>
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 text-white min-h-[60px]">
                {event.description || "No description provided"}
              </div>
            </div>

            {/* Comments Section */}
            <div>
              <Label className="text-white/80 mb-2 block">Comments</Label>
              <div className="space-y-3">
                {/* Existing Comments */}
                {event.comments && event.comments.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {event.comments.map((comment, index) => (
                      <div key={index} className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                        <p className="text-sm text-white/90">{comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/40 italic">No comments yet</div>
                )}

                {/* Add New Comment */}
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment about this event..."
                    className="flex-1 bg-black/20 border-white/10 text-white placeholder-white/50 focus:ring-purple-500/50"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddComment()
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    size="sm"
                    className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-white/20 text-white/80 hover:bg-white/10 bg-transparent"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function EventModal({ isOpen, onClose, onSave, event, selectedDate }: EventModalProps) {
  // Get today's date in YYYY-MM-DD format for minimum date restriction
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
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        type: event.type,
        color: event.color,
      })
    } else if (selectedDate) {
      // Ensure selected date is not before today
      const selectedDateStr = format(selectedDate, "yyyy-MM-dd")
      const isValidDate = selectedDateStr >= today
      
      setFormData((prev) => ({
        ...prev,
        date: isValidDate ? selectedDateStr : today,
      }))
    }
  }, [event, selectedDate, today])

  const handleSave = () => {
    if (!formData.title?.trim()) return
    
    // Additional validation to ensure date is not before today
    if (formData.date && formData.date < today) {
      alert("Cannot create events for dates before today.")
      return
    }

    onSave({
      ...formData,
      color: eventTypes[formData.type as keyof typeof eventTypes]?.color || eventTypes.personal.color,
    })
    onClose()
  }

  const updateFormData = <K extends keyof Event>(key: K, value: Event[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-black/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">{event ? "Edit Event" : "Create Event"}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X size={16} />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Event Title */}
            <div>
              <Label className="text-white/80 mb-2 block">Event Title</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="Enter event title..."
                className="bg-black/20 border-white/10 text-white placeholder-white/50 focus:ring-purple-500/50"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white/80 mb-2 block">Date</Label>
                <Input
                  type="date"
                  value={formData.date || ""}
                  min={today}
                  onChange={(e) => {
                    const selectedDate = e.target.value
                    // Ensure the selected date is not before today
                    if (selectedDate >= today) {
                      updateFormData("date", selectedDate)
                    } else {
                      alert("Cannot select dates before today.")
                      e.target.value = today
                      updateFormData("date", today)
                    }
                  }}
                  className="bg-black/20 border-white/10 text-white focus:ring-purple-500/50"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-2 block">Time</Label>
                <Input
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) => updateFormData("time", e.target.value)}
                  className="bg-black/20 border-white/10 text-white focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <Label className="text-white/80 mb-2 block">Category</Label>
              <select
                value={formData.type || "personal"}
                onChange={(e) => updateFormData("type", e.target.value as Event["type"])}
                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {Object.entries(eventTypes).map(([key, config]) => (
                  <option key={key} value={key} className="bg-gray-800">
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <Label className="text-white/80 mb-2 block">Location (Optional)</Label>
              <Input
                value={formData.location || ""}
                onChange={(e) => updateFormData("location", e.target.value)}
                placeholder="Enter location..."
                className="bg-black/20 border-white/10 text-white placeholder-white/50 focus:ring-purple-500/50"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-white/80 mb-2 block">Description</Label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Enter event description..."
                rows={3}
                className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/20 text-white/80 hover:bg-white/10 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title?.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {event ? "Update" : "Create"} Event
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Main Calendar Component
 * Provides comprehensive calendar interface with event management
 */
export function Calendar({ events, setEvents }: CalendarProps) {
  // State management
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "year">("month")
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [showPastEventModal, setShowPastEventModal] = useState(false)
  const [pastEvent, setPastEvent] = useState<Event | null>(null)

  /**
   * Get events for a specific date
   */
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return events.filter((event) => event.date === dateStr)
  }

  /**
   * Get events for a specific month (for year view)
   */
  const getEventsForMonth = (year: number, month: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
  }

  /**
   * Create new event
   */
  const createEvent = (eventData: Partial<Event>) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: eventData.title || "",
      description: eventData.description || "",
      date: eventData.date || format(new Date(), "yyyy-MM-dd"),
      time: eventData.time || "09:00",
      location: eventData.location,
      type: eventData.type || "personal",
      color: eventData.color || eventTypes.personal.color,
      createdAt: new Date().toISOString(),
      comments: [],
    }

    setEvents([...events, newEvent])
    console.log("Created new event:", newEvent.id)
  }

  /**
   * Update existing event
   */
  const updateEvent = (eventData: Partial<Event>) => {
    if (!editingEvent) return

    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id
        ? {
            ...event,
            ...eventData,
            updatedAt: new Date().toISOString(),
          }
        : event,
    )

    setEvents(updatedEvents)
    setEditingEvent(null)
    console.log("Updated event:", editingEvent.id)
  }

  /**
   * Delete event
   */
  const deleteEvent = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId))
    console.log("Deleted event:", eventId)
  }

  /**
   * Handle date click for event creation
   */
  const handleDateClick = (date: Date) => {
    // Check if the selected date is before today
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
    
    if (date < today) {
      alert("Cannot create events for dates before today.")
      return
    }
    
    setSelectedDate(date)
    setEditingEvent(null)
    setShowEventModal(true)
  }

  /**
   * Handle event edit
   */
  const handleEventEdit = (event: Event) => {
    setEditingEvent(event)
    setSelectedDate(new Date(event.date))
    setShowEventModal(true)
  }

  /**
   * Handle past event click
   */
  const handlePastEventClick = (event: Event) => {
    setPastEvent(event)
    setShowPastEventModal(true)
  }

  /**
   * Add comment to an event
   */
  const addCommentToEvent = (eventId: string, comment: string) => {
    setEvents(
      events.map((event) =>
        event.id === eventId ? { ...event, comments: [...(event.comments || []), comment] } : event,
      ),
    )
    console.log("Added comment to event:", eventId)
  }

  /**
   * Navigate calendar
   */
  const navigateCalendar = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
    } else {
      setCurrentDate(direction === "next" ? addYears(currentDate, 1) : subYears(currentDate, 1))
    }
  }

  /**
   * Switch to month view from year view
   */
  const switchToMonth = (year: number, month: number) => {
    setCurrentDate(new Date(year, month, 1))
    setViewMode("month")
  }

  // Generate calendar days for month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Calendar Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-6 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 mb-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon size={24} className="text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              {viewMode === "month" ? format(currentDate, "MMMM yyyy") : format(currentDate, "yyyy")}
            </h2>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
              className={
                viewMode === "month"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "border-white/20 text-white/80 hover:bg-white/10"
              }
            >
              <List size={16} className="mr-1" />
              Month
            </Button>
            <Button
              variant={viewMode === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("year")}
              className={
                viewMode === "year" && document.documentElement.classList.contains('light')
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "border-white/20 text-white/80 hover:bg-white/10"
              }
            >
              <Grid3X3 size={16} className="mr-1" />
              Year
            </Button>            
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateCalendar("prev")}
            className={document.documentElement.classList.contains('light') ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-white/20 text-white/80 hover:bg-white/10'}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateCalendar("next")}className={`border-white/20 text-white/80 hover:bg-white/10 ${document.documentElement.classList.contains('light') ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
            className={document.documentElement.classList.contains('light') ? 'bg-green-500 hover:bg-green-600 text-white' : 'border-white/20 text-white/80 hover:bg-white/10'}>
            <ChevronRight size={16} />
          </Button>

          {/* Add Event Button */}
          <Button
            onClick={() => {
              setSelectedDate(new Date())
              setEditingEvent(null)
              setShowEventModal(true)
            }}
            className="ml-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Plus size={16} className="mr-2" />
            Add Event
          </Button>
        </div>
      </motion.div>

      {/* Calendar Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6 overflow-hidden"
      >
        {viewMode === "month" ? (
          /* Month View */
          <div className="h-full flex flex-col">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-white/60 font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 gap-2 overflow-hidden">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDate(day)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isToday = isSameDay(day, new Date())
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                
                // Check if date is before today
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const isPastDate = day < today

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
                    onClick={() => !isPastDate && handleDateClick(day)}
                    onMouseEnter={() => !isPastDate && setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    {/* Date Number */}
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

                      {/* Add Event Button (appears on hover for non-past dates) */}
                      <AnimatePresence>
                        {hoveredDate && isSameDay(hoveredDate, day) && !isPastDate && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDateClick(day)
                            }}
                            className="w-6 h-6 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center transition-colors"
                            title="Add event"
                          >
                            <Plus size={12} className="text-white" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Events */}
                    <div className="px-2 pb-2 space-y-1 min-h-[60px]">
                      {dayEvents.slice(0, 3).map((event) => {
                        // Check if event is in the past
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
                                  handlePastEventClick(event)
                                } else {
                                  handleEventEdit(event)
                                }
                              }}
                              title={`${event.title} - ${event.time}${isPastEvent ? " (Past Event)" : ""}`}
                            >
                              <span className="text-white/90">{event.title}</span>
                              {isPastEvent && (
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-white/60">(Past)</span>
                                  {event.comments && event.comments.length > 0 && (
                                    <span className="text-xs text-purple-300">💬 {event.comments.length}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Event Actions (appear on hover for non-past events) */}
                            {!isPastEvent && (
                              <div className="absolute right-1 top-0 opacity-0 group-hover/event:opacity-100 transition-opacity flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleEventEdit(event)
                                  }}
                                  className="w-4 h-4 rounded bg-blue-500/80 hover:bg-blue-600 flex items-center justify-center"
                                  title="Edit event"
                                >
                                  <Edit size={8} className="text-white" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteEvent(event.id)
                                  }}
                                  className="w-4 h-4 rounded bg-red-500/80 hover:bg-red-600 flex items-center justify-center"
                                  title="Delete event"
                                >
                                  <Trash2 size={8} className="text-white" />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}

                      {/* More events indicator */}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-white/60 text-center py-1">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Year View */
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
            <div className="grid grid-cols-3 gap-6">
              {monthNames.map((monthName, monthIndex) => {
                const monthEvents = getEventsForMonth(getYear(currentDate), monthIndex)
                const isCurrentMonth =
                  getMonth(new Date()) === monthIndex && getYear(new Date()) === getYear(currentDate)

                return (
                  <motion.div
                    key={monthIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: monthIndex * 0.05 }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                      isCurrentMonth
                        ? "bg-purple-500/20 border-purple-400/50 ring-2 ring-purple-400/30"
                        : "bg-black/10 dark:bg-gray-700/20 border-white/10 hover:border-white/30 hover:bg-black/20"
                    }`}
                    onClick={() => switchToMonth(getYear(currentDate), monthIndex)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{monthName}</h3>
                      <div className="text-sm text-white/60">{monthEvents.length} events</div>
                    </div>

                    {/* Month Events Preview */}
                    <div className="space-y-2">
                      {monthEvents.slice(0, 3).map((event) => (
                        <div key={event.id} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
                          <span className="text-white/80 truncate">{event.title}</span>
                        </div>
                      ))}

                      {monthEvents.length > 3 && (
                        <div className="text-xs text-white/60 text-center">+{monthEvents.length - 3} more events</div>
                      )}

                      {monthEvents.length === 0 && (
                        <div className="text-xs text-white/40 text-center py-2">No events this month</div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false)
          setEditingEvent(null)
          setSelectedDate(null)
        }}
        onSave={editingEvent ? updateEvent : createEvent}
        event={editingEvent}
        selectedDate={selectedDate || undefined}
      />

      {/* Past Event Modal */}
      {pastEvent && (
        <PastEventModal
          isOpen={showPastEventModal}
          onClose={() => {
            setShowPastEventModal(false)
            setPastEvent(null)
          }}
          event={pastEvent}
          onAddComment={addCommentToEvent}
        />
      )}
    </div>
  )
}
