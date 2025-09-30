"use client"

import { Slider } from "@/components/ui/slider"

import { Badge } from "@/components/ui/badge"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { ScrollArea } from "@/components/ui/scroll-area"
import { User, Clock, Timer } from "lucide-react"

interface UserSettings {
  // Personal
  username: string
  email: string

  // Appearance
  theme: string
  fontSize: number

  // Localization
  language: string
  timezone: string
  dateFormat: string
  timeFormat: "12h" | "24h"

  // Notifications
  notifications: boolean
  soundEnabled: boolean
  reminderSound: string

  // Focus Timer
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean

  // Data
  autoSave: boolean
  autoSaveInterval: number
  autoBackup: boolean
  soundEffects: boolean
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
]

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Rome",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
]

const themes = [
  { id: "system", name: "System", description: "Follow system preference" },
  { id: "light", name: "Light Mode", description: "Clean and bright" },
  { id: "dark", name: "Dark Mode", description: "Easy on the eyes" },
]

const translations = {
  en: {
    welcome: "Welcome back",
    goodMorning: "Good morning",
    goodAfternoon: "Good afternoon",
    goodEvening: "Good evening",
    today: "Today",
    thisWeek: "This week",
    thisMonth: "This month",
    tasks: "Tasks",
    habits: "Habits",
    goals: "Goals",
    notes: "Notes",
    journal: "Journal",
    focus: "Focus",
    settings: "Settings",
  },
  es: {
    welcome: "Bienvenido de vuelta",
    goodMorning: "Buenos días",
    goodAfternoon: "Buenas tardes",
    goodEvening: "Buenas noches",
    today: "Hoy",
    thisWeek: "Esta semana",
    thisMonth: "Este mes",
    tasks: "Tareas",
    habits: "Hábitos",
    goals: "Objetivos",
    notes: "Notas",
    journal: "Diario",
    focus: "Enfoque",
    settings: "Configuración",
  },
  fr: {
    welcome: "Bon retour",
    goodMorning: "Bonjour",
    goodAfternoon: "Bon après-midi",
    goodEvening: "Bonsoir",
    today: "Aujourd'hui",
    thisWeek: "Cette semaine",
    thisMonth: "Ce mois",
    tasks: "Tâches",
    habits: "Habitudes",
    goals: "Objectifs",
    notes: "Notes",
    journal: "Journal",
    focus: "Focus",
    settings: "Paramètres",
  },
  de: {
    welcome: "Willkommen zurück",
    goodMorning: "Guten Morgen",
    goodAfternoon: "Guten Tag",
    goodEvening: "Guten Abend",
    today: "Heute",
    thisWeek: "Diese Woche",
    thisMonth: "Diesen Monat",
    tasks: "Aufgaben",
    habits: "Gewohnheiten",
    goals: "Ziele",
    notes: "Notizen",
    journal: "Tagebuch",
    focus: "Fokus",
    settings: "Einstellungen",
  },
}

export default function UserSettings() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>({
    // Personal
    username: "User",
    email: "",

    // Appearance
    theme: "system",
    fontSize: 14,

    // Localization
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",

    // Notifications
    notifications: true,
    soundEnabled: true,
    reminderSound: "default",
    soundEffects: true,

    // Focus Timer
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,

    // Data
    autoSave: true,
    autoSaveInterval: 30,
    autoBackup: true,
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    loadSettings()

    // Update time every minute for timezone display
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Apply language and timezone changes immediately
    applyLanguageAndTimezone()
  }, [settings.language, settings.timezone])

  const loadSettings = async () => {
    if (typeof window !== "undefined" && window.electronAPI) {
      const loadedSettings = await window.electronAPI.getUserSettings()
      if (loadedSettings) {
        setSettings((prev) => ({ ...prev, ...loadedSettings }))
      }
    }
  }

  const saveSettings = async () => {
    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.saveUserSettings(settings)
    }
    setHasChanges(false)

    // Apply settings immediately
    applySettings()

    // Show success message (you could use a toast here)
    console.log("Settings saved successfully!")
  }

  const applySettings = () => {
    // Apply theme
    document.documentElement.setAttribute("data-theme", settings.theme)

    // Apply font size
    document.documentElement.style.fontSize = `${settings.fontSize}px`

    // Apply language and timezone
    applyLanguageAndTimezone()
  }

  const applyLanguageAndTimezone = () => {
    // Store language and timezone for use throughout the app
    localStorage.setItem("aura-language", settings.language)
    localStorage.setItem("aura-timezone", settings.timezone)

    // Update document language
    document.documentElement.lang = settings.language

    // Dispatch custom event to notify other components
    window.dispatchEvent(
      new CustomEvent("settingsChanged", {
        detail: { language: settings.language, timezone: settings.timezone },
      }),
    )
  }

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const resetSettings = () => {
    const defaultSettings: UserSettings = {
      username: "User",
      email: "",
      theme: "system",
      fontSize: 14,
      language: "en",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      notifications: true,
      soundEnabled: true,
      reminderSound: "default",
      soundEffects: true,
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      autoSave: true,
      autoSaveInterval: 30,
      autoBackup: true,
    }

    setSettings(defaultSettings)
    setHasChanges(true)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "aura-focus-settings.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)
        setSettings((prev) => ({ ...prev, ...importedSettings }))
        setHasChanges(true)
      } catch (error) {
        console.error("Failed to import settings:", error)
      }
    }
    reader.readAsText(file)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    const t = translations[settings.language as keyof typeof translations] || translations.en

    if (hour < 12) return t.goodMorning
    if (hour < 17) return t.goodAfternoon
    return t.goodEvening
  }

  const formatTimeInTimezone = (date: Date, timezone: string) => {
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: settings.timeFormat === "12h" ? "numeric" : "2-digit",
        minute: "2-digit",
        hour12: settings.timeFormat === "12h",
      }).format(date)
    } catch {
      return date.toLocaleTimeString()
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 max-w-4xl mx-auto p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your AURA Focus experience</p>
        </div>

        {/* Current Time in Selected Timezone */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Current time in {settings.timezone}:</span>
              </div>
              <Badge variant="outline" className="text-lg font-mono">
                {formatTimeInTimezone(currentTime, settings.timezone)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Font Size: {settings.fontSize}px</Label>
              <Slider
                value={[settings.fontSize]}
                onValueChange={(value) => updateSetting("fontSize", value[0])}
                min={12}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language & Region</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSetting("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {timezones.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={(value) => updateSetting("dateFormat", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select value={settings.timeFormat} onValueChange={(value) => updateSetting("timeFormat", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for tasks and reminders</p>
              </div>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting("notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="soundEffects">Sound Effects</Label>
                <p className="text-sm text-muted-foreground">Play sounds for timer and notifications</p>
              </div>
              <Switch
                id="soundEffects"
                checked={settings.soundEffects}
                onCheckedChange={(checked) => updateSetting("soundEffects", checked)}
              />
            </div>

            {settings.soundEffects && (
              <div>
                <Label htmlFor="reminderSound">Notification Sound</Label>
                <Select value={settings.reminderSound} onValueChange={(value) => updateSetting("reminderSound", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="ding">Ding</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup">Auto Backup</Label>
                <p className="text-sm text-muted-foreground">Automatically backup your data daily</p>
              </div>
              <Switch
                id="autoBackup"
                checked={settings.autoBackup}
                onCheckedChange={(checked) => updateSetting("autoBackup", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={settings.username}
                  onChange={(e) => updateSetting("username", e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateSetting("email", e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Focus Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Focus Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Work Duration: {settings.workDuration} min</Label>
                <Slider
                  value={[settings.workDuration]}
                  onValueChange={(value) => updateSetting("workDuration", value[0])}
                  min={15}
                  max={60}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Short Break: {settings.shortBreakDuration} min</Label>
                <Slider
                  value={[settings.shortBreakDuration]}
                  onValueChange={(value) => updateSetting("shortBreakDuration", value[0])}
                  min={3}
                  max={15}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Long Break: {settings.longBreakDuration} min</Label>
                <Slider
                  value={[settings.longBreakDuration]}
                  onValueChange={(value) => updateSetting("longBreakDuration", value[0])}
                  min={15}
                  max={30}
                  step={5}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-start Breaks</Label>
                  <p className="text-sm text-muted-foreground">Automatically start break timers</p>
                </div>
                <Switch
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) => updateSetting("autoStartBreaks", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-start Pomodoros</Label>
                  <p className="text-sm text-muted-foreground">Automatically start work sessions after breaks</p>
                </div>
                <Switch
                  checked={settings.autoStartPomodoros}
                  onCheckedChange={(checked) => updateSetting("autoStartPomodoros", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">{hasChanges && <Button onClick={saveSettings}>Save Settings</Button>}</div>
      </div>
    </ScrollArea>
  )
}
