import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'neofocus-data.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Get default data structure
function getDefaultData() {
  return {
    events: [],
    tasks: [],
    habits: [],
    goals: [],
    notes: [],
    journals: [],
    reminders: [],
    achievements: [],
    focusSessions: [],
    settings: {
      name: "User",
      theme: "dark",
      notifications: true,
      autoSave: true,
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureDataDirectory()
    
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8')
      const parsedData = JSON.parse(data)
      
      // Ensure events have all required fields
      const formattedData = {
        ...parsedData,
        events: (parsedData.events || []).map((event: any) => ({
          id: event.id || Date.now().toString(),
          title: event.title || "Untitled Event",
          description: event.description || "",
          date: event.date || new Date().toISOString().split('T')[0],
          time: event.time || event.startTime || "09:00",
          type: event.type || "personal",
          color: event.color || "bg-purple-500",
          createdAt: event.createdAt || new Date().toISOString(),
          updatedAt: event.updatedAt || new Date().toISOString(),
          eventType: event.eventType || "schedule",
          startTime: event.startTime || event.time || "09:00",
          endTime: event.endTime || "10:00",
          location: event.location || "",
          comments: event.comments || []
        }))
      }
      
      return NextResponse.json(formattedData)
    } catch (error) {
      // File doesn't exist or is invalid, return default data
      const defaultData = getDefaultData()
      await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2))
      return NextResponse.json(defaultData)
    }
  } catch (error) {
    console.error('Error reading data:', error)
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    )
  }
}
