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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate that we have the required data structure
    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    await ensureDataDirectory()
    
    // Read existing data first
    let existingData: any = {}
    try {
      const existingFile = await fs.readFile(DATA_FILE, 'utf-8')
      existingData = JSON.parse(existingFile)
    } catch (error) {
      // File doesn't exist, use default data
      existingData = {
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
        }
      }
    }

    // Use the data as-is since the database class already handles merging
    const mergedData = {
      events: data.events || [],
      tasks: data.tasks || [],
      habits: data.habits || [],
      goals: data.goals || [],
      notes: data.notes || [],
      journals: data.journals || [],
      reminders: data.reminders || [],
      achievements: data.achievements || [],
      focusSessions: data.focusSessions || [],
      settings: data.settings || {
        name: "User",
        theme: "dark",
        notifications: true,
        autoSave: true,
        focusDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4
      }
    }

    // Ensure events have all required fields
    const completeData = {
      ...mergedData,
      events: (mergedData.events || []).map((event: any) => ({
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

    await fs.writeFile(DATA_FILE, JSON.stringify(completeData, null, 2))
    
    console.log('Data saved successfully:', {
      events: completeData.events.length,
      tasks: completeData.tasks.length,
      habits: completeData.habits.length,
      goals: completeData.goals.length,
      notes: completeData.notes.length,
      journals: completeData.journals.length,
      reminders: completeData.reminders.length,
      achievements: completeData.achievements.length,
      focusSessions: completeData.focusSessions.length
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving data:', error)
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    )
  }
}
