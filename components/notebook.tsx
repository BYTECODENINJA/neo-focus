'use client'

/**
 * Notebook Component - Rich Text Note-Taking Interface
 * Features: React Quill editor, tagging system, search functionality, auto-save
 * Integrates with the main database system for persistent storage
 */

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit, Trash2, Tag, Save, X, FileText, FolderOpen, History, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

// Interface for Note data structure
interface Note {
  id: string
  title: string
  content: string // Rich HTML content from Quill
  tags: string[]
  category?: string
  createdAt: string
  updatedAt: string
}

// Component props interface
interface NotebookProps {
  notes: Note[]
  setNotes: (notes: Note[]) => void
}

/**
 * Main Notebook Component
 * Provides a two-panel interface: note list and editor
 */
export function Notebook({ notes, setNotes }: NotebookProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [editingNote, setEditingNote] = useState({ title: "", content: "", tags: [] as string[], category: "" as string | undefined })
  const [newTag, setNewTag] = useState("")
  const [quillLoaded, setQuillLoaded] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState<string>("All")
  const [newFolderName, setNewFolderName] = useState<string>("")
  const [isNoteListCollapsed, setIsNoteListCollapsed] = useState(false)
  const quillRef = useRef<any>(null)

  // Handle header formatting on toolbar click
  useEffect(() => {
    const handleToolbarClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest('[data-value="1"], [data-value="2"], [data-value="3"]');
      
      if (button && quillRef.current) {
        const quill = quillRef.current.getEditor();
        const selection = quill.getSelection();
        
        // If no text is selected, prevent the formatting
        if (!selection || selection.length === 0) {
          e.preventDefault();
          e.stopPropagation();
          // Show a message to the user
          alert('Please select the text you want to format as a heading.');
          return false;
        }
      }
    };

    // Add event listener after a short delay to ensure Quill is mounted
    const timer = setTimeout(() => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.addEventListener('click', handleToolbarClick);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.removeEventListener('click', handleToolbarClick);
      }
    };
  }, [quillLoaded]);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("notebook-search-history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        createNewNote();
      }
      if (isEditing && (e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing]);

  useEffect(() => {
    setQuillLoaded(true)
  }, [])

  const uniqueFolders = Array.from(
    new Set((notes.map((n) => (n.category || "").trim()).filter(Boolean) as string[]).sort((a, b) => a.localeCompare(b)))
  )

  const filteredNotes = notes.filter((note) => {
    const rawQuery = (searchTerm || "").trim().toLowerCase()
    const isTagQuery = rawQuery.startsWith("#") || rawQuery.startsWith("tag:")
    const query = isTagQuery
      ? rawQuery.startsWith("#")
        ? rawQuery.slice(1)
        : rawQuery.replace(/^tag:\s*/, "")
      : rawQuery

    const matchesTitle = note.title.toLowerCase().includes(query)
    const matchesContent = note.content.toLowerCase().includes(query)
    const matchesTags = Array.isArray(note.tags) && note.tags.some((tag) => tag.toLowerCase().includes(query))
    const inFolder = isTagQuery ? true : selectedFolder === "All" || (note.category || "") === selectedFolder
    const inSearch = rawQuery.length === 0 ? true : matchesTitle || matchesContent || matchesTags
    return inFolder && inSearch
  })

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      tags: [],
      category: selectedFolder !== "All" ? selectedFolder : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setEditingNote({ title: newNote.title, content: newNote.content, tags: newNote.tags || [], category: newNote.category || "" })
    setIsEditing(true)
    setIsNoteListCollapsed(false) // Expand list when creating a new note
  }

  const saveNote = () => {
    if (selectedNote) {
      // Preserve the exact HTML content from the editor
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              title: editingNote.title || "Untitled",
              content: editingNote.content,
              tags: editingNote.tags || [],
              category: (editingNote.category || "").trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : note,
      )
      
      // Save to localStorage to ensure persistence
      localStorage.setItem("notebook-notes", JSON.stringify(updatedNotes))
      
      // Update state
      setNotes(updatedNotes)
      setSelectedNote({
        ...selectedNote,
        title: editingNote.title || "Untitled",
        content: editingNote.content,
        tags: editingNote.tags || [],
        category: (editingNote.category || "").trim() || undefined,
        updatedAt: new Date().toISOString(),
      })
      setIsEditing(false)
    }
  }

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId))
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setIsEditing(false)
      setIsNoteListCollapsed(false) // Expand if the active note is deleted
    }
  }

  const startEditing = (note: Note) => {
    setEditingNote({ title: note.title, content: note.content, tags: note.tags || [], category: note.category || "" })
    setIsEditing(true)
  }

  const addTag = () => {
    if (newTag.trim() && editingNote.tags && Array.isArray(editingNote.tags) && !editingNote.tags.includes(newTag.trim())) {
      setEditingNote({
        ...editingNote,
        tags: [...(editingNote.tags || []), newTag.trim()],
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditingNote({
      ...editingNote,
      tags: (editingNote.tags || []).filter((tag) => tag !== tagToRemove),
    })
  }

  const handleNoteSelection = (note: Note) => {
    setSelectedNote(note)
    setIsNoteListCollapsed(true) // Collapse list when a note is selected
    setIsEditing(false) // Always start in view mode
  }

  const handleBackToList = () => {
    setIsNoteListCollapsed(false)
    setSelectedNote(null) // Deselect note when going back to the list
  }

  // Helper function to handle HTML paste
  const handleHTMLPaste = (node: any, delta: any) => {
    // Return the delta as-is to preserve the HTML structure
    return delta
  }

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
    clipboard: {
      // Custom clipboard matcher to preserve formatting
      matchers: [
        ['p', handleHTMLPaste],
        ['h1', handleHTMLPaste],
        ['h2', handleHTMLPaste],
        ['h3', handleHTMLPaste],
        ['strong', handleHTMLPaste],
        ['em', handleHTMLPaste],
        ['u', handleHTMLPaste],
        ['s', handleHTMLPaste],
        ['ul', handleHTMLPaste],
        ['ol', handleHTMLPaste],
        ['li', handleHTMLPaste],
        ['blockquote', handleHTMLPaste],
        ['pre', handleHTMLPaste],
        ['a', handleHTMLPaste],
      ],
    },
    history: {
      delay: 1000,
      maxStack: 500,
      userOnly: true
    }
  }

  const quillFormats = [
    "header", "bold", "italic", "underline", "strike",
    "list", "bullet", "indent", "align", "link", "image", "video",
    "blockquote", "code-block",
  ]

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
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
              <Button
                onClick={createNewNote}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                title="Create new note (Ctrl+N)"
              >
                <Plus size={16} />
              </Button>
            </div>

            <div className="mb-4">
              <Select value={selectedFolder} onValueChange={(v) => setSelectedFolder(v)}>
                <SelectTrigger className="w-full bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50">
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Folders</SelectItem>
                  {uniqueFolders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      {folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative mb-4">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search notes or #tag..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowSearchHistory(e.target.value === ""); }}
                onFocus={() => setShowSearchHistory(true)}
                onBlur={() => { setTimeout(() => setShowSearchHistory(false), 200); }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") { setSearchTerm(""); setShowSearchHistory(false); }
                  else if (e.key === "Enter" && searchTerm.trim()) {
                    setSearchHistory(prev => {
                      const newHistory = [searchTerm, ...prev.filter(item => item !== searchTerm)].slice(0, 5);
                      localStorage.setItem("notebook-search-history", JSON.stringify(newHistory));
                      return newHistory;
                    });
                  }
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              {searchTerm && <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">{filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''}</div>}
              {showSearchHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-10">
                  {searchHistory.map((term, index) => (
                    <div key={index} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm flex items-center" onClick={() => { setSearchTerm(term); setShowSearchHistory(false); }}>
                      <History size={14} className="mr-2 text-gray-500 dark:text-gray-400" />
                      {term}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent hover:scrollbar-thumb-purple-400/70">
              <AnimatePresence>
                {filteredNotes.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-gray-800 dark:text-gray-400">
                    {searchTerm ? "No notes found" : "No notes yet. Create one!"}
                  </motion.div>
                ) : (
                  filteredNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNoteSelection(note)}
                      className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedNote?.id === note.id
                          ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-400/30"
                          : "hover:bg-white/5 dark:hover:bg-gray-700/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate text-black dark:text-white">{note.title}</h3>
                          <p className="text-sm text-gray-800 dark:text-gray-400 truncate mt-1">{stripHtml(note.content).substring(0, 50) + "..." || "No content"}</p>
                          {note.category && <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">{note.category}</p>}
                          {note.tags && Array.isArray(note.tags) && note.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {note.tags.slice(0, 3).map((tag) => <span key={tag} className="text-xs bg-purple-500/20 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-full">{tag}</span>)}
                              {note.tags.length > 3 && <span className="text-xs text-gray-700 dark:text-gray-500">+{note.tags.length - 3}</span>}
                            </div>
                          )}
                          <p className="text-xs text-gray-700 dark:text-gray-500 mt-1">{new Date(note.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }} className="text-gray-700 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 ml-2 transition-colors" title="Delete note">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6 flex flex-col overflow-hidden"
        layout
      >
        {selectedNote ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {isNoteListCollapsed && (
                  <Button onClick={handleBackToList} size="sm" variant="ghost" className="mr-2">
                    <ArrowLeft size={16} />
                  </Button>
                )}
                <h1 className="text-2xl font-bold text-black dark:text-white">{isEditing ? "Edit Note" : selectedNote.title}</h1>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={saveNote} size="sm" className="bg-green-600 hover:bg-green-700" title="Save note (Ctrl+S)">
                      <Save size={16} className="mr-1" /> Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" title="Cancel editing">
                      <X size={16} className="mr-1" /> Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => startEditing(selectedNote)} size="sm" variant="outline" title="Edit note">
                    <Edit size={16} />
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Note title..."
                />
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen size={16} className="text-purple-400" />
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Folder</label>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <Select
                      value={(editingNote.category || "").trim() || "None"}
                      onValueChange={(v) => {
                        if (v === "new") {
                          setTimeout(() => { const input = document.getElementById("new-folder-input"); if (input) input.focus(); }, 10);
                        } else {
                          setEditingNote({ ...editingNote, category: v === "None" ? "" : v });
                        }
                      }}
                    >
                      <SelectTrigger className="w-48 bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-sm">
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="None">No Folder</SelectItem>
                        {uniqueFolders.map((folder) => <SelectItem key={folder} value={folder}>{folder}</SelectItem>)}
                        <SelectItem value="new" className="text-purple-500">+ Create New Folder</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex-1 flex gap-2">
                      <input
                        id="new-folder-input"
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newFolderName.trim()) {
                            setEditingNote({ ...editingNote, category: newFolderName.trim() });
                            setNewFolderName("");
                          }
                        }}
                        placeholder="New folder name"
                        className="flex-1 p-2 rounded-lg bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <Button onClick={() => { if (newFolderName.trim()) { setEditingNote({ ...editingNote, category: newFolderName.trim() }); setNewFolderName(""); } }} size="sm" className="bg-purple-600 hover:bg-purple-700" disabled={!newFolderName.trim()}>
                        Create
                      </Button>
                    </div>
                  </div>
                  {editingNote.category && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-800 dark:text-purple-300">{editingNote.category}</span>
                      <button onClick={() => setEditingNote({ ...editingNote, category: "" })} className="text-xs text-gray-500 hover:text-red-500">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {(editingNote.tags || []).map((tag) => (
                      <span key={tag} className="bg-purple-500/20 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                        <Tag size={12} />
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-purple-800 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 ml-1" title={`Remove tag: ${tag}`}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      placeholder="Add tag..."
                      className="flex-1 p-2 rounded-lg bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <Button onClick={addTag} size="sm" variant="outline">Add</Button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden notebook-editor-container">
                  {quillLoaded && (
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={editingNote.content}
                      onChange={(content) => setEditingNote({ ...editingNote, content })}
                      modules={{
                        ...quillModules,
                        clipboard: {
                          // Preserve formatting from clipboard
                          matchVisual: false,
                        }
                      }}
                      formats={quillFormats}
                      placeholder="Start writing your note..."
                      className="h-full"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent hover:scrollbar-thumb-purple-400/70 prose prose-lg dark:prose-invert max-w-none leading-relaxed text-lg">
                  {selectedNote.category && (
                    <div className="mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-800 dark:text-purple-300">{selectedNote.category}</span>
                    </div>
                  )}
                {selectedNote.tags && Array.isArray(selectedNote.tags) && selectedNote.tags.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {selectedNote.tags.map((tag) => (
                      <span key={tag} className="bg-purple-500/20 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-full text-sm">
                        <Tag size={12} className="inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedNote.content ||
                      "<p class='text-gray-800 dark:text-gray-400'>This note is empty. Click edit to add content.</p>",
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold mb-2 text-black dark:text-white">Select a note to view</h2>
              <p className="text-gray-800 dark:text-gray-400">Choose a note from the sidebar or create a new one.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
