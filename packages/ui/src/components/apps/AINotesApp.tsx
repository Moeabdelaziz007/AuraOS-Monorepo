"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { ScrollArea } from "../ui/scroll-area"
import { FileText, Plus, Trash2, Sparkles, Save, Clock } from "lucide-react"
import { cn } from "../../lib/utils"

interface Note {
  id: string
  title: string
  content: string
  timestamp: Date
  aiGenerated?: boolean
}

export function AINotesApp() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome to AI Notes",
      content: "This is your AI-powered note-taking app. Create notes, and let AI help you organize and enhance them!",
      timestamp: new Date(),
      aiGenerated: true,
    },
  ])
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0])
  const [, setIsEditing] = useState(false)

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      timestamp: new Date(),
    }
    setNotes([newNote, ...notes])
    setSelectedNote(newNote)
    setIsEditing(true)
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
    if (selectedNote?.id === id) {
      setSelectedNote(notes[0] || null)
    }
  }

  const updateNote = (updates: Partial<Note>) => {
    if (!selectedNote) return
    const updatedNote = { ...selectedNote, ...updates }
    setNotes(notes.map((n) => (n.id === selectedNote.id ? updatedNote : n)))
    setSelectedNote(updatedNote)
  }

  const enhanceWithAI = () => {
    if (!selectedNote) return
    // Simulate AI enhancement
    const enhanced = `${selectedNote.content}\n\n[AI Enhancement]\n• Key points extracted\n• Grammar improved\n• Structure optimized`
    updateNote({ content: enhanced, aiGenerated: true })
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-border/50 bg-background/30 p-4">
        <Button onClick={createNewNote} className="mb-4 w-full bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>

        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="space-y-2">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedNote(note)
                  setIsEditing(false)
                }}
                className={cn(
                  "cursor-pointer rounded-lg border p-3 transition-all",
                  selectedNote?.id === note.id
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-background/50 hover:bg-background/80",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {note.aiGenerated && <Sparkles className="h-3 w-3 text-accent" />}
                    </div>
                    <p className="mt-1 truncate text-sm font-medium">{note.title}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {note.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNote(note.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6">
        {selectedNote ? (
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between">
              <Input
                value={selectedNote.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                className="text-xl font-semibold border-none bg-transparent px-0 focus-visible:ring-0"
                placeholder="Note title..."
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={enhanceWithAI} className="border-accent/50 bg-transparent">
                  <Sparkles className="mr-2 h-4 w-4 text-accent" />
                  AI Enhance
                </Button>
                <Button variant="outline" size="sm" className="border-primary/50 bg-transparent">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </div>

            <Textarea
              value={selectedNote.content}
              onChange={(e) => updateNote({ content: e.target.value })}
              className="flex-1 resize-none border-border/50 bg-background/30 font-mono text-sm"
              placeholder="Start writing your note..."
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last edited: {selectedNote.timestamp.toLocaleString()}</span>
              <span>{selectedNote.content.length} characters</span>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
