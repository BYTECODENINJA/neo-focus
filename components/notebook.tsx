"use client"

/**
 * Notebook Component - Rich Text Note-Taking Interface
 * Features: React Quill editor, tagging system, search functionality, auto-save
 * Integrates with the main database system for persistent storage
 */

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Edit, Trash2, Tag, Save, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { SpeechInput } from "./speech-input" // Removed as per user request
import dynamic from "next/dynamic"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

// Interface for Note data structure
interface Note {
  id: string
  title: string
  content: string // Rich HTML content from Quill
  tags: string[]
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
  // State management for the notebook interface
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingNote, setEditingNote] = useState({ title: "", content: "", tags: [] as string[] })
  const [newTag, setNewTag] = useState("")
  const [quillLoaded, setQuillLoaded] = useState(false)

  // Initialize Quill editor after component mount
  useEffect(() => {
    setQuillLoaded(true)
  }, [])

  /**
   * Filter notes based on search term
   * Searches through title, content, and tags
   */
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  /**
   * Creates a new note and switches to edit mode
   */
  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add to notes array and select for editing
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setEditingNote({ title: newNote.title, content: newNote.content, tags: newNote.tags })
    setIsEditing(true)

    console.log("Created new note:", newNote.id)
  }

  /**
   * Saves the currently edited note
   * Updates the notes array and exits edit mode
   */
  const saveNote = () => {
    if (selectedNote) {
      const updatedNotes = notes.map((note) =>
        note.id === selectedNote.id
          ? {
              ...note,
              title: editingNote.title || "Untitled",
              content: editingNote.content,
              tags: editingNote.tags,
              updatedAt: new Date().toISOString(),
            }
          : note,
      )

      // Update state with saved note
      setNotes(updatedNotes)
      setSelectedNote({
        ...selectedNote,
        title: editingNote.title || "Untitled",
        content: editingNote.content,
        tags: editingNote.tags,
        updatedAt: new Date().toISOString(),
      })
      setIsEditing(false)

      console.log("Saved note:", selectedNote.id)
    }
  }

  /**
   * Deletes a note from the collection
   * @param noteId ID of the note to delete
   */
  const deleteNote = (noteId: string) => {
    setNotes(notes.filter((note) => note.id !== noteId))

    // Clear selection if deleted note was selected
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
      setIsEditing(false)
    }

    console.log("Deleted note:", noteId)
  }

  /**
   * Starts editing mode for a selected note
   * @param note Note object to edit
   */
  const startEditing = (note: Note) => {
    setEditingNote({ title: note.title, content: note.content, tags: note.tags })
    setIsEditing(true)
    console.log("Started editing note:", note.id)
  }

  /**
   * Adds a new tag to the current note
   */
  const addTag = () => {
    if (newTag.trim() && !editingNote.tags.includes(newTag.trim())) {
      setEditingNote({
        ...editingNote,
        tags: [...editingNote.tags, newTag.trim()],
      })
      setNewTag("")
      console.log("Added tag:", newTag.trim())
    }
  }

  /**
   * Removes a tag from the current note
   * @param tagToRemove Tag to be removed
   */
  const removeTag = (tagToRemove: string) => {
    setEditingNote({
      ...editingNote,
      tags: editingNote.tags.filter((tag) => tag !== tagToRemove),
    })
    console.log("Removed tag:", tagToRemove)
  }

  /**
   * Configuration for React Quill toolbar
   * Includes all formatting options needed for rich text editing
   */
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
  }

  /**
   * Supported formats for React Quill
   */
  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
    "video",
    "blockquote",
    "code-block",
  ]

  /**
   * Strips HTML tags from content for preview
   * @param html HTML content string
   * @returns Plain text content
   */
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  return (
    <div className="flex-1 flex gap-6 h-full overflow-hidden">
      {/* Left Panel - Notes List */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6 flex flex-col"
      >
        {/* Header with title and new note button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-purple-400" />
            <h2 className="text-xl font-bold">Notes</h2>
          </div>
          <Button
            onClick={createNewNote}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            title="Create new note"
          >
            <Plus size={16} />
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 dark:text-gray-400"
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Notes List with Custom Scrollbar */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent hover:scrollbar-thumb-purple-400/70">
          <AnimatePresence>
            {filteredNotes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-800 dark:text-gray-400"
              >
                {searchTerm ? "No notes found" : "No notes yet. Create your first note!"}
              </motion.div>
            ) : (
              filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedNote(note)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedNote?.id === note.id
                      ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30 border border-purple-400/30"
                      : "hover:bg-white/5 dark:hover:bg-gray-700/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Note Title */}
                      <h3 className="font-medium truncate text-black dark:text-white">{note.title}</h3>

                      {/* Note Content Preview */}
                      <p className="text-sm text-gray-800 dark:text-gray-400 truncate mt-1">
                        {stripHtml(note.content).substring(0, 50) + "..." || "No content"}
                      </p>

                      {/* Tags Display */}
                      {note.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {note.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs bg-purple-500/20 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="text-xs text-gray-700 dark:text-gray-500">+{note.tags.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Last Updated Date */}
                      <p className="text-xs text-gray-700 dark:text-gray-500 mt-1">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNote(note.id)
                      }}
                      className="text-gray-700 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 ml-2 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Right Panel - Note Editor */}
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 bg-black/20 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 dark:border-gray-700/50 p-6 flex flex-col overflow-hidden"
      >
        {selectedNote ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-black dark:text-white">{isEditing ? "Edit Note" : selectedNote.title}</h1>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={saveNote} size="sm" className="bg-green-600 hover:bg-green-700" title="Save note">
                      <Save size={16} className="mr-1" />
                      Save
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" title="Cancel editing">
                      <X size={16} className="mr-1" />
                      Cancel
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
              /* Edit Mode Interface */
              <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Title Input */}
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full p-3 rounded-xl bg-black/20 dark:bg-gray-700/50 border border-white/10 dark:border-gray-600/50 text-black dark:text-white placeholder-gray-700 dark:placeholder-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Note title..."
                />

                {/* Tags Management */}
                <div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {editingNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-purple-500/20 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                      >
                        <Tag size={12} />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-purple-800 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 ml-1"
                          title={`Remove tag: ${tag}`}
                        >
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
                    <Button onClick={addTag} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                </div>

                {/* Rich Text Editor */}
                <div className="flex-1 overflow-hidden">
                  {quillLoaded && (
                    <div className="h-full flex flex-col">
                      {/* Custom Quill Styles */}
                      <style jsx global>{`
                        .ql-toolbar {
                          background: rgba(0, 0, 0, 0.2);
                          border: 1px solid rgba(255, 255, 255, 0.1);
                          border-radius: 12px 12px 0 0;
                        }
                        .ql-container {
                          background: rgba(0, 0, 0, 0.2);
                          border: 1px solid rgba(255, 255, 255, 0.1);
                          border-top: none;
                          border-radius: 0 0 12px 12px;
                          color: #000000;
                          font-size: 14px;
                          height: calc(100% - 42px);
                        }
                        .dark .ql-container {
                          color: white;
                        }
                        .ql-editor {
                          color: #000000;
                          padding: 20px;
                          min-height: 200px;
                        }
                        .dark .ql-editor {
                          color: white;
                        }
                        .ql-editor.ql-blank::before {
                          color: rgba(55, 65, 81, 0.7);
                        }
                        .dark .ql-editor.ql-blank::before {
                          color: rgba(255, 255, 255, 0.5);
                        }
                        .ql-toolbar .ql-stroke {
                          stroke: rgba(55, 65, 81, 0.9);
                        }
                        .dark .ql-toolbar .ql-stroke {
                          stroke: rgba(255, 255, 255, 0.8);
                        }
                        .ql-toolbar .ql-fill {
                          fill: rgba(55, 65, 81, 0.9);
                        }
                        .dark .ql-toolbar .ql-fill {
                          fill: rgba(255, 255, 255, 0.8);
                        }
                        .ql-toolbar .ql-picker-label {
                          color: rgba(55, 65, 81, 0.9);
                        }
                        .dark .ql-toolbar .ql-picker-label {
                          color: rgba(255, 255, 255, 0.8);
                        }
                        .ql-snow .ql-picker-options {
                          background: rgba(255, 255, 255, 0.95);
                          border: 1px solid rgba(0, 0, 0, 0.1);
                        }
                        .dark .ql-snow .ql-picker-options {
                          background: rgba(0, 0, 0, 0.9);
                          border: 1px solid rgba(255, 255, 255, 0.1);
                        }
                        .ql-snow .ql-picker-item {
                          color: #000000;
                        }
                        .dark .ql-snow .ql-picker-item {
                          color: white;
                        }
                        .ql-snow .ql-picker-item:hover {
                          background: rgba(0, 0, 0, 0.1);
                        }
                        .dark .ql-snow .ql-picker-item:hover {
                          background: rgba(255, 255, 255, 0.1);
                        }
                        .ql-toolbar button:hover {
                          color: rgba(55, 65, 81, 1);
                        }
                        .dark .ql-toolbar button:hover {
                          color: rgba(255, 255, 255, 1);
                        }
                        .ql-toolbar button.ql-active {
                          color: #a855f7;
                        }
                      `}</style>

                      {/* React Quill Editor */}
                      <ReactQuill
                        theme="snow"
                        value={editingNote.content}
                        onChange={(content) => setEditingNote({ ...editingNote, content })}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Start writing your note..."
                        style={{ height: "100%" }}
                      />
                    </div>
                  )}
                </div>

                {/* Speech Input Integration */}
                {/* SpeechInput removed as per user request */}
              </div>
            ) : (
              /* View Mode Interface */
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent hover:scrollbar-thumb-purple-400/70">
                {/* Tags Display in View Mode */}
                {selectedNote.tags.length > 0 && (
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {selectedNote.tags.map((tag) => (
                      <span key={tag} className="bg-purple-500/20 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-full text-sm">
                        <Tag size={12} className="inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Note Content Display */}
                <div
                  className="prose prose-gray dark:prose-invert max-w-none leading-relaxed"
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
          /* No Note Selected State */
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold mb-2 text-black dark:text-white">Select a note to view</h2>
              <p className="text-gray-800 dark:text-gray-400">Choose a note from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
