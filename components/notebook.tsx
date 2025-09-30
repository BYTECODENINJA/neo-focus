"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Tag, Edit, Trash2, X, ChevronDown, ChevronRight, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import dynamic from "next/dynamic"
import "react-quill/dist/quill.snow.css"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })

interface Note {
  id: string
  title: string
  content: string
  folderId: string | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

interface NoteFolder {
  id: string
  name: string
  color: string
  isExpanded: boolean
}

const folderColors = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
]

export function Notebook() {
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<NoteFolder[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [editingContent, setEditingContent] = useState("")
  const [editingTitle, setEditingTitle] = useState("")
  const [newTag, setNewTag] = useState("")
  const [isFullWidth, setIsFullWidth] = useState(false)

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
  }

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "align",
    "blockquote",
    "code-block",
    "link",
  ]

  useEffect(() => {
    loadNotes()
    loadFolders()
  }, [])

  const loadNotes = async () => {
    if (typeof window !== "undefined" && window.electronAPI) {
      const loadedNotes = await window.electronAPI.getNotes()
      setNotes(loadedNotes)
    }
  }

  const loadFolders = async () => {
    if (typeof window !== "undefined" && window.electronAPI) {
      const loadedFolders = await window.electronAPI.getNoteFolders()
      setFolders(loadedFolders)
    }
  }

  const createNote = async () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      folderId: selectedFolder,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.saveNote(newNote)
      await loadNotes()
      setSelectedNote(newNote)
      setIsEditing(true)
      setEditingTitle(newNote.title)
      setEditingContent(newNote.content)
    }
  }

  const saveNote = async () => {
    if (!selectedNote) return

    const updatedNote = {
      ...selectedNote,
      title: editingTitle,
      content: editingContent,
      updatedAt: new Date(),
    }

    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.saveNote(updatedNote)
      await loadNotes()
      setSelectedNote(updatedNote)
      setIsEditing(false)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.deleteNote(noteId)
      await loadNotes()
      if (selectedNote?.id === noteId) {
        setSelectedNote(null)
        setIsEditing(false)
      }
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    const newFolder: NoteFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      color: folderColors[Math.floor(Math.random() * folderColors.length)],
      isExpanded: true,
    }

    if (typeof window !== "undefined" && window.electronAPI) {
      await window.electronAPI.saveNoteFolder(newFolder)
      await loadFolders()
      setNewFolderName("")
      setShowNewFolder(false)
    }
  }

  const toggleFolder = async (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId)
    if (folder && typeof window !== "undefined" && window.electronAPI) {
      const updatedFolder = { ...folder, isExpanded: !folder.isExpanded }
      await window.electronAPI.saveNoteFolder(updatedFolder)
      await loadFolders()
    }
  }

  const addTag = () => {
    if (!selectedNote || !newTag.trim()) return
    if (!selectedNote.tags.includes(newTag)) {
      const updatedNote = {
        ...selectedNote,
        tags: [...selectedNote.tags, newTag],
      }
      setSelectedNote(updatedNote)
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    if (!selectedNote) return
    const updatedNote = {
      ...selectedNote,
      tags: selectedNote.tags.filter((t) => t !== tag),
    }
    setSelectedNote(updatedNote)
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFolder = selectedFolder === null || note.folderId === selectedFolder

    return matchesSearch && matchesFolder
  })

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
    setEditingTitle(note.title)
    setEditingContent(note.content)
    setIsEditing(false)
    setIsFullWidth(true)
  }

  const closeFullWidth = () => {
    setIsFullWidth(false)
    setSelectedNote(null)
  }

  return (
    <div className="flex h-full gap-4">
      {/* Left Sidebar - Folders */}
      <div className={`${isFullWidth ? "hidden" : "w-64"} space-y-4`}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Folders
              <Button size="sm" variant="ghost" onClick={() => setShowNewFolder(!showNewFolder)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showNewFolder && (
              <div className="mb-4 space-y-2">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && createFolder()}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={createFolder}>
                    Create
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewFolder(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent ${
                    selectedFolder === null ? "bg-accent" : ""
                  }`}
                >
                  All Notes
                </button>
                {folders.map((folder) => (
                  <div key={folder.id}>
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent flex items-center gap-2"
                    >
                      {folder.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <div className={`w-3 h-3 rounded ${folder.color}`} />
                      <span>{folder.name}</span>
                    </button>
                    {folder.isExpanded && (
                      <button
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`w-full text-left px-6 py-1 rounded-lg hover:bg-accent ${
                          selectedFolder === folder.id ? "bg-accent" : ""
                        }`}
                      >
                        View Notes
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Middle - Notes List */}
      <div className={`${isFullWidth ? "hidden" : "flex-1"} space-y-4`}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Notes</CardTitle>
              <Button onClick={createNote}>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleNoteClick(note)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{note.title}</h3>
                          <div
                            className="text-sm text-muted-foreground line-clamp-2 notebook-content"
                            dangerouslySetInnerHTML={{ __html: note.content }}
                          />
                          {note.tags.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {note.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNote(note.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right - Note Editor/Viewer */}
      <div className={`${isFullWidth ? "flex-1" : "flex-1"} space-y-4`}>
        {selectedNote && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                {isEditing ? (
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="text-lg font-semibold"
                  />
                ) : (
                  <CardTitle>{selectedNote.title}</CardTitle>
                )}
                <div className="flex gap-2">
                  {isFullWidth && (
                    <Button size="sm" variant="ghost" onClick={closeFullWidth}>
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  )}
                  {isEditing ? (
                    <Button size="sm" onClick={saveNote}>
                      Save
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <ReactQuill
                    theme="snow"
                    value={editingContent}
                    onChange={setEditingContent}
                    modules={quillModules}
                    formats={quillFormats}
                    className="h-[400px] mb-12"
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                      />
                      <Button size="sm" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedNote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-sm">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="ml-2">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    className="prose prose-sm max-w-none notebook-content"
                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                  />
                  {selectedNote.tags.length > 0 && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {selectedNote.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
