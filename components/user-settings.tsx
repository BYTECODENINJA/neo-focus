'use client'

import type React from "react"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Palette, Volume2, Shield, Download, Upload, RotateCcw, Moon, Monitor, Save, Sun } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { db } from "@/lib/database"
import { AutoSave } from "@/lib/database"

interface UserSettings {
  name: string
  email: string
  avatar: string | undefined
  notifications: boolean
  soundEnabled: boolean
  volume: number
  autoSave: boolean
  focusMode: boolean
  theme: "dark" | "system" | "ultra-light"
  language: string
  timezone: string
  focusDuration: number
  breakDuration: number
  longBreakDuration: number
  sessionsBeforeLongBreak: number
}

export function UserSettings() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    name: "Focus User",
    email: "user@example.com",
    avatar: undefined,
    notifications: true,
    soundEnabled: true,
    volume: 50,
    autoSave: true,
    focusMode: false,
    theme: "system",
    language: "en",
    timezone: "UTC",
    focusDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  })

  // Initialize auto-save
  const autoSave = AutoSave.getInstance()

  useEffect(() => {
    setMounted(true)
    // Load settings from database and sync with theme
    const loadSettings = async () => {
      try {
        const data = await db.getAllData()
        if (data && data.settings) {
          const newSettings = { ...settings, ...data.settings }
          setSettings(newSettings)
          // Sync theme with useTheme
          if (newSettings.theme) setTheme(newSettings.theme)
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }
    loadSettings()
  }, [])

  // Auto-save settings when they change and sync theme
  useEffect(() => {
    if (mounted) {
      const saveAllData = async () => {
        try {
          const allData = await db.getAllData();
          const updatedData = { ...allData, settings: settings };
          await db.saveAllData(updatedData);
        } catch (error) {
          console.error("Failed to save all data:", error);
        }
      };

      saveAllData();
      
      // Dispatch event to update sidebar username
      if (settings.name) {
        window.dispatchEvent(new CustomEvent("userDataUpdated", {
          detail: { username: settings.name, avatar: settings.avatar }
        }))
      }
      // Sync theme with useTheme
      setTheme(settings.theme)
    }
  }, [settings, mounted])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("Avatar file selected:", file.name, file.type, file.size)
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file")
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size must be less than 5MB")
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        console.log("Avatar loaded successfully")
        setSettings(prev => ({ ...prev, avatar: result }))
        toast.success("Avatar uploaded successfully!")
      }
      reader.onerror = () => {
        console.error("Error reading avatar file")
        toast.error("Failed to upload avatar")
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setSettings(prev => ({ ...prev, avatar: undefined }))
  }

  const saveSettings = async () => {
    try {
      const allData = await db.getAllData();
      const updatedData = { ...allData, settings: settings };
      await db.saveAllData(updatedData);
      toast.success("Settings saved successfully!")
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast.error("Failed to save settings")
    }
  }

  const resetSettings = async () => {
    const defaultSettings: UserSettings = {
      name: "Focus User",
      email: "user@example.com",
      avatar: undefined,
      notifications: true,
      soundEnabled: true,
      volume: 50,
      autoSave: true,
      focusMode: false,
      theme: "system",
      language: "en",
      timezone: "UTC",
      focusDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
    }
    setSettings(defaultSettings)
    try {
      const allData = await db.getAllData();
      const updatedData = { ...allData, settings: defaultSettings };
      await db.saveAllData(updatedData);
      toast.success("Settings reset to defaults")
    } catch (error) {
      console.error("Failed to reset settings:", error)
      toast.error("Failed to reset settings")
    }
  }

  const exportSettings = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = "aura-focus-settings.json"
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Settings exported successfully!")
    } catch (error) {
      console.error("Failed to export settings:", error)
      toast.error("Failed to export settings")
    }
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        setSettings((prev) => ({ ...prev, ...imported }))
        toast.success("Settings imported successfully!")
      } catch (error) {
        console.error("Failed to import settings:", error)
        toast.error("Invalid settings file")
      }
    }
    reader.readAsText(file)
  }

  if (!mounted) {
    return <div className="animate-pulse">Loading settings...</div>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-3xl font-bold">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Customize your AURA Focus experience</p>
        </div>
        <Badge variant="secondary">
          v2.0.0
        </Badge>
      </div>
      
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Profile Settings */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
                    className="focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings((prev) => ({ ...prev, email: e.target.value }))}
                    className="focus-ring"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {settings.avatar ? (
                    <img src={settings.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input 
                    id="avatar" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                  <Button 
                    variant="outline" 
                    className="w-full text-sm"
                    onClick={() => document.getElementById('avatar')?.click()}
                  >
                    {settings.avatar ? "Change Avatar" : "Upload Avatar"}
                  </Button>
                  {settings.avatar && (
                    <Button 
                      variant="outline" 
                      className="w-full text-sm text-destructive hover:text-destructive" 
                      onClick={removeAvatar}
                    >
                      Remove Avatar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Timer Settings */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Focus Timer
              </CardTitle>
              <CardDescription>Configure your Pomodoro timer settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="focusDuration">Focus Duration (min)</Label>
                  <Input
                    id="focusDuration"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.focusDuration}
                    onChange={(e) => setSettings((prev) => ({ ...prev, focusDuration: parseInt(e.target.value) || 25 }))}
                    className="focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">Break Duration (min)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    min="1"
                    max="30"
                    value={settings.breakDuration}
                    onChange={(e) => setSettings((prev) => ({ ...prev, breakDuration: parseInt(e.target.value) || 5 }))}
                    className="focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longBreakDuration">Long Break (min)</Label>
                  <Input
                    id="longBreakDuration"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) => setSettings((prev) => ({ ...prev, longBreakDuration: parseInt(e.target.value) || 15 }))}
                    className="focus-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionsBeforeLongBreak">Sessions Before Long Break</Label>
                  <Input
                    id="sessionsBeforeLongBreak"
                    type="number"
                    min="1"
                    max="10"
                    value={settings.sessionsBeforeLongBreak}
                    onChange={(e) => setSettings((prev) => ({ ...prev, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 }))}
                    className="focus-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => setSettings((prev) => ({ ...prev, theme: value as "dark" | "system" | "ultra-light" }))}>
                  <SelectTrigger className="focus-ring">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Dark Mode
                      </div>
                    </SelectItem>
                    <SelectItem value="ultra-light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Light Mode
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

             
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger className="focus-ring">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </CardContent>
          </Card>

          {/* Notifications & Sound */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications & Sound
              </CardTitle>
              <CardDescription>Configure alerts and audio settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for timers and reminders</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play sounds for timer alerts</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                />
              </div>

              {settings.soundEnabled && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Volume: {settings.volume}%
                  </Label>
                  <Slider
                    value={[settings.volume]}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, volume: value[0] }))}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save Data</Label>
                  <p className="text-sm text-muted-foreground">Automatically save your progress</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoSave: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Focus Mode</Label>
                  <p className="text-sm text-muted-foreground">Hide distracting elements during focus sessions</p>
                </div>
                <Switch
                  checked={settings.focusMode}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, focusMode: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export, import, or reset your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button onClick={exportSettings} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Settings
                </Button>

                <Button variant="outline" className="flex items-center gap-2" asChild>
                  <label htmlFor="import-settings" className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import Settings
                    <input id="import-settings" type="file" accept=".json" onChange={importSettings} className="hidden" />
                  </label>
                </Button>

                <Button
                  onClick={resetSettings}
                  variant="outline"
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button onClick={saveSettings} className="flex items-center gap-2 font-semibold">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
