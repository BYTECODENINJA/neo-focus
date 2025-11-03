"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Calendar,
  Search,
  Filter,
  Edit3,
  Save,
  X,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Highlighter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

import { JournalEntry } from "@/types"

interface JournalProps {
  journals: JournalEntry[]
  setJournals: (journals: JournalEntry[]) => void
}

const moodColors = {
  excellent: "bg-green-500",
  good: "bg-blue-500",
  neutral: "bg-yellow-500",
  challenging: "bg-orange-500",
  difficult: "bg-red-500",
}

const moodEmojis = {
  excellent: "😄",
  good: "😊",
  neutral: "😐",
  challenging: "😔",
  difficult: "😢",
}

const fontFamilies = [
  { value: "system-ui, -apple-system, sans-serif", label: "Default" },
  { value: "Georgia, 'Times New Roman', serif", label: "Serif" },
  { value: "'Courier New', monospace", label: "Mono" },
  { value: "'Brush Script MT', cursive", label: "Handwriting" },
  { value: "'Helvetica Neue', sans-serif", label: "Modern" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Lora', serif", label: "Lora" },
  { value: "'Cinzel', serif", label: "Cinzel" },
  { value: "'Cormorant Garamond', serif", label: "Cormorant" },
  { value: "'Dancing Script', cursive", label: "Dancing Script" },
  { value: "'Great Vibes', cursive", label: "Great Vibes" },
  { value: "'Pacifico', cursive", label: "Pacifico" },
  { value: "'Lobster', cursive", label: "Lobster" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Comic Sans MS', cursive", label: "Casual" },
  { value: "'Roboto', sans-serif", label: "Professional" },
]

const highlightColors = [
  { value: "#fef08a", label: "Yellow" },
  { value: "#bbf7d0", label: "Green" },
  { value: "#bfdbfe", label: "Blue" },
  { value: "#fce7f3", label: "Pink" },
  { value: "#e9d5ff", label: "Purple" },
  { value: "#fed7aa", label: "Orange" },
]

export function Journal({ journals, setJournals }: JournalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMood, setSelectedMood] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    mood: "good" as JournalEntry["mood"],
    energy: 5,
    gratitude: "",
    reflection: "",
  })

  // Formatting states
  const [formatting, setFormatting] = useState({
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: 16,
    textAlign: "left" as "left" | "center" | "right",
    highlights: [] as Array<{ start: number; end: number; color: string }>,
  })

  const [selectedText, setSelectedText] = useState({ start: 0, end: 0 })

  // Filter journals based on search and mood
  const filteredJournals = useMemo(() => {
    return journals.filter((journal) => {
      const matchesSearch =
        journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.content.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesMood = selectedMood === "all" || journal.mood === selectedMood
      const matchesDate = !selectedDate || journal.date === selectedDate
      return matchesSearch && matchesMood && matchesDate
    })
  }, [journals, searchTerm, selectedMood, selectedDate])

  const handleCreateEntry = useCallback(() => {
    setFormData({
      title: `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: "",
      mood: "good",
      energy: 5,
      gratitude: "",
      reflection: "",
    })
    setFormatting({
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: 16,
      textAlign: "left",
      highlights: [],
    })
    setEditingId(null)
    setSelectedEntry(null)
    setIsCreating(true)
  }, [])

  const handleSaveEntry = useCallback(() => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Please fill in title and content")
      return
    }

    const entryData = {
      ...formData,
      date: new Date().toISOString().split("T")[0],
      formatting,
    }

    if (editingId) {
      const updatedEntry: JournalEntry = {
        ...(journals.find((j) => j.id === editingId) as JournalEntry),
        ...entryData,
        id: editingId,
        updatedAt: new Date().toISOString(),
      }
      setJournals(journals.map((j) => (j.id === editingId ? updatedEntry : j)))
      toast.success("Journal entry updated!")
      // Close editor and open full view of the updated entry
      setSelectedEntry(updatedEntry)
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        ...entryData,
        createdAt: new Date().toISOString(),
      }
      setJournals([newEntry, ...journals])
      toast.success("Journal entry created!")
      // Close editor and open full view of the new entry
      setSelectedEntry(newEntry)
    }

    setIsCreating(false)
    setEditingId(null)
  }, [formData, formatting, editingId, journals, setJournals])

  const handleTextSelection = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    setSelectedText({
      start: target.selectionStart,
      end: target.selectionEnd,
    })
  }, [])

  const applyHighlight = useCallback(
    (color: string) => {
      if (selectedText.start === selectedText.end) {
        toast.error("Please select text to highlight")
        return
      }

      const newHighlight = {
        start: selectedText.start,
        end: selectedText.end,
        color,
      }

      setFormatting((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight],
      }))

      toast.success("Text highlighted!")
    },
    [selectedText],
  )

  const applyFormatting = useCallback(
    (type: "bold" | "italic") => {
      if (selectedText.start === selectedText.end) {
        toast.error("Please select text to format")
        return
      }

      const before = formData.content.substring(0, selectedText.start)
      const selected = formData.content.substring(selectedText.start, selectedText.end)
      const after = formData.content.substring(selectedText.end)

      let formatted = ""
      if (type === "bold") {
        formatted = `${before}**${selected}**${after}`
      } else if (type === "italic") {
        formatted = `${before}*${selected}*${after}`
      }

      setFormData((prev) => ({ ...prev, content: formatted }))
      toast.success(`Text formatted as ${type}`)
    },
    [formData.content, selectedText],
  )

  const renderFormattedContent = useCallback((content: string, entryFormatting?: JournalEntry["formatting"]) => {
    if (!entryFormatting) return content

    let formattedContent = content

    // Apply markdown formatting
    formattedContent = formattedContent
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")

    const style = {
      fontFamily: entryFormatting.fontFamily,
      fontSize: `${entryFormatting.fontSize}px`,
      textAlign: entryFormatting.textAlign,
    }

    return <div style={style} dangerouslySetInnerHTML={{ __html: formattedContent }} className="whitespace-pre-wrap" />
  }, [])

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Journal</h1>
          <p className="text-white/60">Reflect on your daily experiences and growth</p>
        </div>
        <Button onClick={handleCreateEntry} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
        <Select value={selectedMood} onValueChange={setSelectedMood}>
          <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Moods</SelectItem>
            <SelectItem value="excellent">😄 Excellent</SelectItem>
            <SelectItem value="good">😊 Good</SelectItem>
            <SelectItem value="neutral">😐 Neutral</SelectItem>
            <SelectItem value="challenging">😔 Challenging</SelectItem>
            <SelectItem value="difficult">😢 Difficult</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative">
          <Input
            type="date"
            value={selectedDate || ""}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setSelectedDate(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Journal Entries */}
      <ScrollArea className="flex-1">
        <div className="grid gap-4">
          <AnimatePresence>
            {filteredJournals.map((journal) => (
              <motion.div
                key={journal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group"
              >
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${moodColors[journal.mood]}`} />
                        <CardTitle className="text-white text-lg">{journal.title}</CardTitle>
                        <span className="text-2xl">{moodEmojis[journal.mood]}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(journal.date).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-white/80 line-clamp-3">
                        {renderFormattedContent(journal.content, journal.formatting)}
                      </div>

                      {journal.gratitude && (
                        <div className="text-sm">
                          <span className="text-green-400 font-medium">Gratitude: </span>
                          <span className="text-white/70">{journal.gratitude}</span>
                        </div>
                      )}
                      
                      {journal.reflection && (
                        <div className="text-sm">
                          <span className="text-blue-400 font-medium">Reflection: </span>
                          <span className="text-white/70">{journal.reflection}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-white/10 text-white/80">
                            Energy: {journal.energy}/10
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEntry(journal)}
                          className="text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Create/Edit Entry Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900/95 backdrop-blur-lg border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {editingId ? "Edit Journal Entry" : "Create New Journal Entry"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
                placeholder="Enter journal title..."
              />
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              {/* Font Family */}
              <Select
                value={formatting.fontFamily}
                onValueChange={(value) => setFormatting((prev) => ({ ...prev, fontFamily: value }))}
              >
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white text-xs">
                  <Type className="w-3 h-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Font Size */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Size:</span>
                <Input
                  type="number"
                  min="12"
                  max="24"
                  value={formatting.fontSize}
                  onChange={(e) =>
                    setFormatting((prev) => ({ ...prev, fontSize: Number.parseInt(e.target.value) || 16 }))
                  }
                  className="w-16 bg-white/10 border-white/20 text-white text-xs"
                />
              </div>

              {/* Text Alignment */}
              <div className="flex gap-1">
                <Button
                  variant={formatting.textAlign === "left" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFormatting((prev) => ({ ...prev, textAlign: "left" }))}
                  className="p-2"
                >
                  <AlignLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant={formatting.textAlign === "center" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFormatting((prev) => ({ ...prev, textAlign: "center" }))}
                  className="p-2"
                >
                  <AlignCenter className="w-3 h-3" />
                </Button>
                <Button
                  variant={formatting.textAlign === "right" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFormatting((prev) => ({ ...prev, textAlign: "right" }))}
                  className="p-2"
                >
                  <AlignRight className="w-3 h-3" />
                </Button>
              </div>

              {/* Text Formatting */}
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("bold")} className="p-2">
                  <Bold className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyFormatting("italic")} className="p-2">
                  <Italic className="w-3 h-3" />
                </Button>
              </div>

              {/* Highlighter */}
              <Select onValueChange={applyHighlight}>
                <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white text-xs">
                  <Highlighter className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Highlight" />
                </SelectTrigger>
                <SelectContent>
                  {highlightColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: color.value }} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                onSelect={handleTextSelection}
                className="min-h-[200px] bg-white/10 border-white/20 text-white resize-none"
                placeholder="Write your thoughts, experiences, and reflections..."
                style={{
                  fontFamily: formatting.fontFamily,
                  fontSize: `${formatting.fontSize}px`,
                  textAlign: formatting.textAlign,
                }}
              />
            </div>

            {/* Mood and Energy */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">Mood</label>
                <Select
                  value={formData.mood}
                  onValueChange={(value: JournalEntry["mood"]) => setFormData((prev) => ({ ...prev, mood: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">😄 Excellent</SelectItem>
                    <SelectItem value="good">😊 Good</SelectItem>
                    <SelectItem value="neutral">😐 Neutral</SelectItem>
                    <SelectItem value="challenging">😔 Challenging</SelectItem>
                    <SelectItem value="difficult">😢 Difficult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">
                  Energy Level: {formData.energy}/10
                </label>
                <Slider
                  value={[formData.energy]}
                  onValueChange={([value]) => setFormData((prev) => ({ ...prev, energy: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Gratitude */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Gratitude</label>
              <Textarea
                value={formData.gratitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, gratitude: e.target.value }))}
                className="bg-white/10 border-white/20 text-white resize-none"
                placeholder="What are you grateful for today?"
                rows={2}
              />
            </div>

            {/* Reflection */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Reflection</label>
              <Textarea
                value={formData.reflection}
                onChange={(e) => setFormData((prev) => ({ ...prev, reflection: e.target.value }))}
                className="bg-white/10 border-white/20 text-white resize-none"
                placeholder="What did you learn today? How can you improve tomorrow?"
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-white/60 hover:text-white">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEntry} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update Entry" : "Save Entry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] bg-gray-900/95 backdrop-blur-lg border-white/20 text-white">
          {selectedEntry && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedEntry.title}</DialogTitle>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedEntry.date).toLocaleDateString()}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 overflow-y-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${moodColors[selectedEntry.mood]}`} />
                    <span className="text-white/80">
                      Mood: {moodEmojis[selectedEntry.mood]} {selectedEntry.mood}
                    </span>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white/80">
                    Energy: {selectedEntry.energy}/10
                  </Badge>
                </div>

                <div className="prose prose-invert max-w-none">
                  {renderFormattedContent(selectedEntry.content, selectedEntry.formatting)}
                </div>

                {selectedEntry.gratitude && (
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="text-green-400 font-medium mb-2">Gratitude</h4>
                    <p className="text-white/80">{selectedEntry.gratitude}</p>
                  </div>
                )}

                {selectedEntry.reflection && (
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="text-blue-400 font-medium mb-2">Reflection</h4>
                    <p className="text-white/80">{selectedEntry.reflection}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <Button
                    onClick={() => {
                      setSelectedEntry(null)
                      setFormData({
                        title: selectedEntry.title,
                        content: selectedEntry.content,
                        mood: selectedEntry.mood,
                        energy: selectedEntry.energy,
                        gratitude: selectedEntry.gratitude,
                        reflection: selectedEntry.reflection,
                      })
                      setFormatting(selectedEntry.formatting || formatting)
                      setEditingId(selectedEntry.id)
                      setIsCreating(true)
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Entry
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
