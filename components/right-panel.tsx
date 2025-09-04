"use client"

import { useState } from "react"
import { Plus, Cloud, Droplets, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Event, eventTypes } from "@/types"

const getEventTypeColor = (type: string) => {
  const eventType = eventTypes[type as keyof typeof eventTypes]
  if (eventType) {
    const color = eventType.color
    return `bg-[${color}]/20 border-[${color}]/50 text-[${color}]`
  }
  return "bg-gray-500/20 border-gray-500/50 text-gray-300"
}

const getEventTypeIcon = (type: string) => {
  switch (type) {
    case "meeting":
      return "👥"
    case "birthday":
      return "🎂"
    case "holiday":
      return "🎉"
    case "important":
      return "⚠️"
    case "reminder":
      return "🔔"
    case "personal":
      return "👤"
    default:
      return "📅"
  }
}

interface RightPanelProps {
  events: Event[]
  activeSection: string
}

export function RightPanel({ events, activeSection }: RightPanelProps) {
  const [weather, setWeather] = useState({
    location: "Nairobi",
    condition: "Rainy",
    temperature: "59°F",
    humidity: "53%",
    windSpeed: "12 mph",
  })

  const [showAddEvent, setShowAddEvent] = useState(false)

  // Get today's events
  const today = new Date().toISOString().split("T")[0]
  const todaysEvents = events.filter((event) => event.date === today)

  // Get this week's events
  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const thisWeekEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    return eventDate >= startOfWeek && eventDate <= endOfWeek
  })

  return (
    <div className="w-80 p-6 space-y-6">
      {/* Weather Widget */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cloud size={20} className="text-blue-400" />
            <span className="text-sm text-white/60">{weather.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets size={16} className="text-blue-400" />
            <span className="text-xs text-white/60">{weather.humidity}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">{weather.condition}</p>
            <p className="text-2xl font-bold">{weather.temperature}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Wind size={16} />
            <span>{weather.windSpeed}</span>
          </div>
        </div>
      </div>

      {/* Add Event Button */}
      {activeSection === "calendar" && (
        <Button
          onClick={() => setShowAddEvent(true)}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Event
        </Button>
      )}

      {/* Today's Events */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
        <h3 className="text-lg font-bold mb-3">{"Today's Events"}</h3>
        {todaysEvents.length === 0 ? (
          <p className="text-white/60 text-sm font-bold">No events today</p>
        ) : (
          <div className="space-y-2">
            {todaysEvents.map((event) => (
              <div key={event.id} className={`p-3 rounded-lg border ${getEventTypeColor(event.type)}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{getEventTypeIcon(event.type)}</span>
                  <p className="font-bold text-sm flex-1">{event.title}</p>
                </div>
                <p className="text-xs opacity-80 font-bold">{event.time}</p>
                {event.description && <p className="text-xs opacity-70 mt-1">{event.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* This Week Stats */}
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
        <h3 className="text-lg font-bold mb-3">This Week</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60">Total Events</span>
            <span className="font-bold">{thisWeekEvents.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">Today</span>
            <span className="font-bold">{todaysEvents.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/60">This Week</span>
            <span className="font-bold">{thisWeekEvents.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
