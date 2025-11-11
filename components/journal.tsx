'use client'

import type React from "react"

import { useState, useCallback, useMemo, useEffect } from "react"
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
  Eye,
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
    { value: "'Roboto', sans-serif", label: "Professional" },
  ]

export function Journal({ journals, setJournals }: JournalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMood, setSelectedMood] = useState<string>("all")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Partial<JournalEntry> | null>(null)
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null)

  const filteredJournals = useMemo(() => {
    return journals
      .filter((journal) => {
        const matchesSearch =
          journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          journal.content.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMood = selectedMood === "all" || journal.mood === selectedMood
        const matchesDate = !selectedDate || journal.date === selectedDate
        return matchesSearch && matchesMood && matchesDate
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [journals, searchTerm, selectedMood, selectedDate])

  const handleNewEntry = () => {
    setEditingEntry({
      title: `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: "",
      mood: "good",
      energy: 5,
      gratitude: "",
      reflection: "",
      formatting: {
        fontFamily: fontFamilies[0].value,
        fontSize: 16,
        textAlign: "left",
        highlights: [],
      },
    })
    setIsEditing(true)
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(JSON.parse(JSON.stringify(entry))) // Deep copy
    setIsEditing(true)
  }

  const handleSaveEntry = () => {
    if (!editingEntry || !editingEntry.title?.trim() || !editingEntry.content?.trim()) {
      toast.error("Please fill in title and content")
      return
    }

    if (editingEntry.id) {
      // Update existing entry
      const updatedEntry = { ...editingEntry, updatedAt: new Date().toISOString() } as JournalEntry
      setJournals(journals.map((j) => (j.id === editingEntry.id ? updatedEntry : j)))
      toast.success("Journal entry updated!")
      setViewingEntry(updatedEntry) // View the entry after saving
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        ...editingEntry,
      } as JournalEntry
      setJournals([newEntry, ...journals])
      toast.success("Journal entry created!")
      setViewingEntry(newEntry) // View the entry after creating
    }

    setIsEditing(false)
    setEditingEntry(null)
  }

  const handleDeleteEntry = (id: string) => {
    setJournals(journals.filter(j => j.id !== id));
    toast.success("Journal entry deleted.");
    setViewingEntry(null); // Close view if the deleted entry was being viewed
  }

  const renderFormattedContent = useCallback((content: string, entryFormatting?: JournalEntry["formatting"]) => {
    const style = {
        fontFamily: entryFormatting?.fontFamily || fontFamilies[0].value,
        fontSize: `${entryFormatting?.fontSize || 16}px`,
        textAlign: entryFormatting?.textAlign || 'left',
      }
  
      // A more robust regex might be needed for complex cases
      const htmlContent = content
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>");
  
      return <div style={style} dangerouslySetInnerHTML={{ __html: htmlContent }} className="whitespace-pre-wrap" />
  }, [])

  return (
    <div className="h-full flex flex-col space-y-6">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-white mb-2">Journal</h1>
            <p className="text-white/60">Reflect on your daily experiences and growth</p>
            </div>
            <Button onClick={handleNewEntry} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
            </Button>
        </div>

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
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                        <SelectItem key={mood} value={mood}>{emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

      <ScrollArea className="flex-1">
        <div className="grid gap-4 pr-4">
          <AnimatePresence>
            {filteredJournals.map((journal) => (
              <motion.div
                key={journal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group"
              >
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
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
                    <div className="text-white/80 line-clamp-2 mb-4" onClick={() => setViewingEntry(journal)} style={{ cursor: 'pointer' }}>
                        {journal.content}
                    </div>
                    <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-white/10 text-white/80">Energy: {journal.energy}/10</Badge>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => setViewingEntry(journal)}><Eye className="w-4 h-4 mr-1"/>View</Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditEntry(journal)}><Edit3 className="w-4 h-4 mr-1"/>Edit</Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900/95 backdrop-blur-lg border-white/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingEntry?.id ? "Edit Journal Entry" : "Create New Journal Entry"}</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4 max-h-[calc(90vh-150px)] overflow-y-auto pr-2">
              <Input
                value={editingEntry.title || ''}
                onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                className="bg-white/10 border-white/20 text-white text-lg font-bold"
              />
              <Textarea
                value={editingEntry.content || ''}
                onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                className="min-h-[250px] bg-white/10 border-white/20 text-white resize-none"
                style={{
                    fontFamily: editingEntry.formatting?.fontFamily,
                    fontSize: `${editingEntry.formatting?.fontSize}px`,
                    textAlign: editingEntry.formatting?.textAlign,
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Mood</label>
                    <Select value={editingEntry.mood} onValueChange={(mood) => setEditingEntry({ ...editingEntry, mood: mood as JournalEntry["mood"] })}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {Object.entries(moodEmojis).map(([mood, emoji]) => (
                                <SelectItem key={mood} value={mood}>{emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Energy Level: {editingEntry.energy}/10</label>
                    <Slider value={[editingEntry.energy || 5]} onValueChange={([value]) => setEditingEntry({ ...editingEntry, energy: value })} max={10} min={1} step={1} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSaveEntry}>Save Entry</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingEntry} onOpenChange={() => setViewingEntry(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] bg-gray-900/95 backdrop-blur-lg border-white/20 text-white">
          {viewingEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{viewingEntry.title}</DialogTitle>
                <div className="flex items-center justify-between text-sm text-white/60 pt-2">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(viewingEntry.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${moodColors[viewingEntry.mood]}`} />{moodEmojis[viewingEntry.mood]} {viewingEntry.mood}</div>
                    <div>Energy: {viewingEntry.energy}/10</div>
                </div>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(80vh-150px)] pr-4">
                <div className="prose prose-invert max-w-none py-4">
                    {renderFormattedContent(viewingEntry.content, viewingEntry.formatting)}
                </div>
                {viewingEntry.gratitude && (
                  <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h4 className="text-green-400 font-medium mb-2">Gratitude</h4>
                    <p className="text-white/80 whitespace-pre-wrap">{viewingEntry.gratitude}</p>
                  </div>
                )}
                {viewingEntry.reflection && (
                  <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="text-blue-400 font-medium mb-2">Reflection</h4>
                    <p className="text-white/80 whitespace-pre-wrap">{viewingEntry.reflection}</p>
                  </div>
                )}
                </ScrollArea>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="destructive" onClick={() => handleDeleteEntry(viewingEntry.id)}>Delete</Button>
                <Button onClick={() => { setViewingEntry(null); handleEditEntry(viewingEntry); }}>Edit Entry</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
