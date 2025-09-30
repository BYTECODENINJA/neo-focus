"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { Plus, Calendar, Heart, Lightbulb, Edit, Trash2, BookOpen } from "lucide-react"

interface JournalEntry {
  id: string
  title: string
  content: string
  mood: string
  energy: number
  gratitude: string
  reflection: string
  date: string
  createdAt: string
  updatedAt: string
}

const moodOptions = [
  { value: "amazing", label: "Amazing", emoji: "🤩", color: "#10b981" },
  { value: "great", label: "Great", emoji: "😄", color: "#22c55e" },
  { value: "good", label: "Good", emoji: "😊", color: "#84cc16" },
  { value: "okay", label: "Okay", emoji: "😐", color: "#eab308" },
  { value: "meh", label: "Meh", emoji: "😑", color: "#f97316" },
  { value: "bad", label: "Bad", emoji: "😞", color: "#ef4444" },
  { value: "terrible", label: "Terrible", emoji: "😢", color: "#dc2626" },
]

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showNewEntryDialog, setShowNewEntryDialog] = useState(false)
  const [selectedFont, setSelectedFont] = useState("Inter")

  // Form state
  const [entryForm, setEntryForm] = useState({
    title: "",
    content: "",
    mood: "good",
    energy: 5,
    gratitude: "",
    reflection: "",
  })

  const fontOptions = [
    "Inter",
    "Georgia",
    "Times New Roman",
    "Arial",
    "Helvetica",
    "Courier New",
    "Verdana",
    "Comic Sans MS",
  ]

  useEffect(() => {
    loadEntries()
    const savedFont = localStorage.getItem("aura-journal-font")
    if (savedFont) {
      setSelectedFont(savedFont)
    }
  }, [])

  const loadEntries = () => {
    const saved = localStorage.getItem("aura-journal-entries")
    if (saved) {
      const parsedEntries = JSON.parse(saved)
      setEntries(
        parsedEntries.sort(
          (a: JournalEntry, b: JournalEntry) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      )
    }
  }

  const saveEntries = (updatedEntries: JournalEntry[]) => {
    const sortedEntries = updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    localStorage.setItem("aura-journal-entries", JSON.stringify(sortedEntries))
    setEntries(sortedEntries)
  }

  const createEntry = () => {
    if (!entryForm.title.trim() || !entryForm.content.trim()) return

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: entryForm.title,
      content: entryForm.content,
      mood: entryForm.mood,
      energy: entryForm.energy,
      gratitude: entryForm.gratitude,
      reflection: entryForm.reflection,
      date: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedEntries = [newEntry, ...entries]
    saveEntries(updatedEntries)
    setSelectedEntry(newEntry)
    setEntryForm({
      title: "",
      content: "",
      mood: "good",
      energy: 5,
      gratitude: "",
      reflection: "",
    })
    setShowNewEntryDialog(false)
  }

  const updateEntry = () => {
    if (!selectedEntry || !entryForm.title.trim() || !entryForm.content.trim()) return

    const updatedEntry: JournalEntry = {
      ...selectedEntry,
      title: entryForm.title,
      content: entryForm.content,
      mood: entryForm.mood,
      energy: entryForm.energy,
      gratitude: entryForm.gratitude,
      reflection: entryForm.reflection,
      updatedAt: new Date().toISOString(),
    }

    const updatedEntries = entries.map((entry) => (entry.id === selectedEntry.id ? updatedEntry : entry))
    saveEntries(updatedEntries)
    setSelectedEntry(updatedEntry)
    setIsEditing(false)
  }

  const deleteEntry = (entryId: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== entryId)
    saveEntries(updatedEntries)
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null)
    }
  }

  const selectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setEntryForm({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      energy: entry.energy,
      gratitude: entry.gratitude,
      reflection: entry.reflection,
    })
    setIsEditing(false)
  }

  const startEditing = () => {
    setIsEditing(true)
  }

  const cancelEditing = () => {
    if (selectedEntry) {
      setEntryForm({
        title: selectedEntry.title,
        content: selectedEntry.content,
        mood: selectedEntry.mood,
        energy: selectedEntry.energy,
        gratitude: selectedEntry.gratitude,
        reflection: selectedEntry.reflection,
      })
    }
    setIsEditing(false)
  }

  const getMoodData = (mood: string) => {
    return moodOptions.find((option) => option.value === mood) || moodOptions[2]
  }

  const formatEntryForReading = (entry: JournalEntry) => {
    const moodData = getMoodData(entry.mood)
    const parts = []

    // Title and basic info
    parts.push(`**${entry.title}**`)
    parts.push(
      `*${new Date(entry.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}*`,
    )

    // Mood and energy
    parts.push(
      `Today I'm feeling ${moodData.emoji} **${moodData.label}** with an energy level of **${entry.energy}/10**.`,
    )

    // Main content
    if (entry.content) {
      parts.push(entry.content)
    }

    // Gratitude
    if (entry.gratitude) {
      parts.push(`**What I'm grateful for:** ${entry.gratitude}`)
    }

    // Reflection
    if (entry.reflection) {
      parts.push(`**Reflection:** ${entry.reflection}`)
    }

    return parts.join("\n\n")
  }

  const changeFontFamily = (font: string) => {
    setSelectedFont(font)
    localStorage.setItem("aura-journal-font", font)
  }

  return (
    <div className="flex h-full" style={{ fontFamily: selectedFont }}>
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Journal</h2>
            <Dialog open={showNewEntryDialog} onOpenChange={setShowNewEntryDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Journal Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4" style={{ fontFamily: selectedFont }}>
                  <Input
                    placeholder="Entry title"
                    value={entryForm.title}
                    onChange={(e) => setEntryForm((prev) => ({ ...prev, title: e.target.value }))}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Mood</label>
                      <Select
                        value={entryForm.mood}
                        onValueChange={(value) => setEntryForm((prev) => ({ ...prev, mood: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {moodOptions.map((mood) => (
                            <SelectItem key={mood.value} value={mood.value}>
                              <div className="flex items-center gap-2">
                                <span>{mood.emoji}</span>
                                <span>{mood.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Energy Level: {entryForm.energy}/10</label>
                      <Slider
                        value={[entryForm.energy]}
                        onValueChange={(value) => setEntryForm((prev) => ({ ...prev, energy: value[0] }))}
                        max={10}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <Textarea
                    placeholder="What happened today? How are you feeling?"
                    value={entryForm.content}
                    onChange={(e) => setEntryForm((prev) => ({ ...prev, content: e.target.value }))}
                    rows={6}
                  />

                  <Textarea
                    placeholder="What are you grateful for today?"
                    value={entryForm.gratitude}
                    onChange={(e) => setEntryForm((prev) => ({ ...prev, gratitude: e.target.value }))}
                    rows={3}
                  />

                  <Textarea
                    placeholder="Any reflections or lessons learned?"
                    value={entryForm.reflection}
                    onChange={(e) => setEntryForm((prev) => ({ ...prev, reflection: e.target.value }))}
                    rows={3}
                  />

                  <div className="flex gap-2">
                    <Button onClick={createEntry}>Create Entry</Button>
                    <Button variant="outline" onClick={() => setShowNewEntryDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Font Selection */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Font Family</label>
            <Select value={selectedFont} onValueChange={changeFontFamily}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font} value={font}>
                    <span style={{ fontFamily: font }}>{font}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Entries List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {entries.map((entry) => {
              const moodData = getMoodData(entry.mood)
              return (
                <Card
                  key={entry.id}
                  className={`mb-2 cursor-pointer transition-colors group ${
                    selectedEntry?.id === entry.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => selectEntry(entry)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium truncate flex-1">{entry.title}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteEntry(entry.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{moodData.emoji}</span>
                        <span className="text-xs text-muted-foreground">{moodData.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Energy: {entry.energy}/10</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>

                    <div className="flex gap-2 mt-2">
                      {entry.gratitude && (
                        <Badge variant="secondary" className="text-xs">
                          <Heart className="h-2 w-2 mr-1" />
                          Gratitude
                        </Badge>
                      )}
                      {entry.reflection && (
                        <Badge variant="secondary" className="text-xs">
                          <Lightbulb className="h-2 w-2 mr-1" />
                          Reflection
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {entries.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No journal entries yet</p>
                <p className="text-sm">Start writing your first entry!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedEntry ? (
          <>
            {/* Entry Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedEntry.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date(selectedEntry.updatedAt).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={updateEntry}>Save</Button>
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {/* Entry Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              {isEditing ? (
                <div className="space-y-4 h-full">
                  <Input
                    value={entryForm.title}
                    onChange={(e) => setEntryForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="text-lg font-semibold"
                    placeholder="Entry title"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Mood</label>
                      <Select
                        value={entryForm.mood}
                        onValueChange={(value) => setEntryForm((prev) => ({ ...prev, mood: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {moodOptions.map((mood) => (
                            <SelectItem key={mood.value} value={mood.value}>
                              <div className="flex items-center gap-2">
                                <span>{mood.emoji}</span>
                                <span>{mood.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Energy Level: {entryForm.energy}/10</label>
                      <Slider
                        value={[entryForm.energy]}
                        onValueChange={(value) => setEntryForm((prev) => ({ ...prev, energy: value[0] }))}
                        max={10}
                        min={1}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      value={entryForm.content}
                      onChange={(e) => setEntryForm((prev) => ({ ...prev, content: e.target.value }))}
                      className="min-h-[200px] resize-none"
                      placeholder="What happened today? How are you feeling?"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Gratitude</label>
                    <Textarea
                      value={entryForm.gratitude}
                      onChange={(e) => setEntryForm((prev) => ({ ...prev, gratitude: e.target.value }))}
                      className="min-h-[100px] resize-none"
                      placeholder="What are you grateful for today?"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Reflection</label>
                    <Textarea
                      value={entryForm.reflection}
                      onChange={(e) => setEntryForm((prev) => ({ ...prev, reflection: e.target.value }))}
                      className="min-h-[100px] resize-none"
                      placeholder="Any reflections or lessons learned?"
                    />
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-base leading-relaxed">
                    {formatEntryForReading(selectedEntry)}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select an entry to read</p>
              <p className="text-sm">Choose an entry from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
