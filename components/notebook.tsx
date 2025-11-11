'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit, Trash2, Tag, Save, X, FileText, FolderOpen, History, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sonner } from "sonner"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false, loading: () => <p>Loading editor...</p> })
import "react-quill/dist/quill.snow.css"

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  category?: string
  createdAt: string
  updatedAt: string
}

const NOTEBOOK_NOTES_KEY = "notebook-notes";
const NOTEBOOK_SEARCH_HISTORY_KEY = "notebook-search-history";

export function Notebook() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [editingNote, setEditingNote] = useState<{ title: string; content: string; tags: string[]; category?: string } | null>(null)
  const [newTag, setNewTag] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string>("All")
  const [newFolderName, setNewFolderName] = useState<string>("")
  const [isNoteListCollapsed, setIsNoteListCollapsed] = useState(false)
  const quillRef = useRef<any>(null)

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(NOTEBOOK_NOTES_KEY)
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes))
      }
      const savedHistory = localStorage.getItem(NOTEBOOK_SEARCH_HISTORY_KEY)
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory))
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error)
      sonner.error("Failed to load your notes. Please check your browser settings.")
    }
  }, [])

  const saveNotesToLocalStorage = useCallback((updatedNotes: Note[]) => {
    try {
      localStorage.setItem(NOTEBOOK_NOTES_KEY, JSON.stringify(updatedNotes))
    } catch (error) {
      console.error("Failed to save notes to localStorage", error)
      sonner.error("Failed to save your notes. Changes may not persist.")
    }
  }, [])

  const saveNote = useCallback(() => {
    if (selectedNote && editingNote) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              ...editingNote,
              title: editingNote.title || "Untitled Note",
              category: editingNote.category?.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
      setNotes(updatedNotes)
      saveNotesToLocalStorage(updatedNotes)
      setSelectedNote(updatedNotes.find(n => n.id === selectedNote.id) || null)
      setIsEditing(false)
      sonner.success("Note saved successfully!")
    }
  }, [selectedNote, editingNote, notes, saveNotesToLocalStorage])

  const createNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      tags: [],
      category: selectedFolder !== "All" ? selectedFolder : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updatedNotes = [newNote, ...notes]
    setNotes(updatedNotes)
    saveNotesToLocalStorage(updatedNotes)
    setSelectedNote(newNote)
    setEditingNote({ ...newNote })
    setIsEditing(true)
    setIsNoteListCollapsed(false)
    sonner.success("New note created!")
  }, [notes, selectedFolder, saveNotesToLocalStorage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        createNewNote()
      }
      if (isEditing && (e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        saveNote()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isEditing, saveNote, createNewNote])

  const uniqueFolders = useMemo(() => 
    Array.from(new Set(notes.map((n) => n.category || "").filter(Boolean))).sort((a, b) => a.localeCompare(b))
  , [notes])

  const filteredNotes = useMemo(() => 
    notes.filter((note) => {
      const rawQuery = searchTerm.trim().toLowerCase()
      if (!rawQuery && selectedFolder === "All") return true

      const inFolder = selectedFolder === "All" || note.category === selectedFolder
      if (!rawQuery) return inFolder

      const isTagQuery = rawQuery.startsWith("#") || rawQuery.startsWith("tag:")
      const query = isTagQuery ? rawQuery.replace(/^#|^tag:\s*/, "") : rawQuery

      const matchesTitle = note.title.toLowerCase().includes(query)
      const matchesContent = (note.content || "").toLowerCase().includes(query)
      const matchesTags = note.tags.some((tag) => tag.toLowerCase().includes(query))

      return inFolder && (matchesTitle || matchesContent || matchesTags)
    })
  , [notes, searchTerm, selectedFolder])

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    setNotes(updatedNotes)
    saveNotesToLocalStorage(updatedNotes)
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setIsEditing(false)
      setIsNoteListCollapsed(false)
    }
    sonner.info("Note deleted.")
  }

  const startEditing = (note: Note) => {
    setEditingNote({ ...note })
    setIsEditing(true)
  }

  const handleNoteSelection = (note: Note) => {
    if (isEditing) saveNote()
    setSelectedNote(note)
    setIsNoteListCollapsed(true)
    setIsEditing(false)
  }

  const handleBackToList = () => {
    if (isEditing) saveNote()
    setIsNoteListCollapsed(false)
    setSelectedNote(null)
  }

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return ""
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (query.trim()) {
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem(NOTEBOOK_SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["blockquote", "code-block"],
      ["clean"],
    ],
    history: { delay: 1000, maxStack: 500, userOnly: true },
  }

  return (
    <div className="flex-1 flex gap-6 h-full overflow-hidden">
      <AnimatePresence>
        {!isNoteListCollapsed && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-purple-400" />
                <h2 className="text-xl font-bold">Notes</h2>
              </div>
              <Button onClick={createNewNote} size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" title="Create new note (Ctrl+N)">
                <Plus size={16} />
              </Button>
            </div>

            <div className="mb-4">
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-full bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50">
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Folders</SelectItem>
                  {uniqueFolders.map((folder) => (
                    <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes or #tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setShowSearchHistory(true)}
                onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchTerm)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-10">
                  {searchHistory.map((term, index) => (
                    <div key={index} className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-sm flex items-center" onClick={() => handleSearch(term)}>
                      <History size={14} className="mr-2 text-gray-400" />
                      {term}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
              <AnimatePresence>
                {filteredNotes.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-gray-400">
                    {searchTerm ? "No notes found" : "No notes yet. Create one!"}
                  </motion.div>
                ) : (
                  filteredNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                      onClick={() => handleNoteSelection(note)}
                      className={`p-3 rounded-xl cursor-pointer transition-colors ${selectedNote?.id === note.id ? "bg-purple-500/30" : "hover:bg-gray-700/30"}`}
                    >
                      <h3 className="font-medium truncate text-white">{note.title}</h3>
                      <p className="text-sm text-gray-400 truncate mt-1">{stripHtml(note.content).substring(0, 50) || "No content..."}</p>
                      <div className="text-xs text-gray-500 mt-1">{new Date(note.updatedAt).toLocaleDateString()}</div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className="flex-1 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6 flex flex-col overflow-hidden">
        {selectedNote ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {isNoteListCollapsed && (
                  <Button onClick={handleBackToList} size="sm" variant="ghost" className="mr-2">
                    <ArrowLeft size={16} />
                  </Button>
                )}
                <h1 className="text-2xl font-bold text-white">{isEditing ? "Edit Note" : selectedNote.title}</h1>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={saveNote} size="sm" className="bg-green-600 hover:bg-green-700" title="Save note (Ctrl+S)"><Save size={16} className="mr-1" /> Save</Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" title="Cancel editing"><X size={16} className="mr-1" /> Cancel</Button>
                  </>
                ) : (
                  <Button onClick={() => startEditing(selectedNote)} size="sm" variant="outline" title="Edit note"><Edit size={16} /></Button>
                )}
              </div>
            </div>

            {isEditing && editingNote ? (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border-gray-600/50 text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Note title..."
                />
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editingNote.content}
                  onChange={(content) => setEditingNote({ ...editingNote, content })}
                  modules={quillModules}
                  className="h-full overflow-y-auto"
                />
              </div>
            ) : (
              <div
                className="flex-1 overflow-y-auto prose prose-lg dark:prose-invert max-w-none leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: selectedNote.content || "<p class='text-gray-400'>This note is empty. Click edit to add content.</p>" }}
              />
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-bold mb-2 text-white">Select a note to view</h2>
              <p className="text-gray-400">Choose a note from the sidebar or create a new one.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
