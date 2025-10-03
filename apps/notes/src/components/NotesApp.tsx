/**
 * NotesApp - Main application component
 * Three-pane layout: Sidebar (folders/tags) | Note List | Editor
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { NoteList } from './NoteList';
import { NoteEditor } from './NoteEditor';
import { initNotesClient } from '../lib/notes-client';
import type { Note, Folder } from '../types';
import '../styles/notes-app.css';

interface NotesAppProps {
  userId: string;
}

export const NotesApp: React.FC<NotesAppProps> = ({ userId }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize client
  useEffect(() => {
    initNotesClient(userId);
  }, [userId]);

  // Load folders and notes
  useEffect(() => {
    loadData();
  }, [selectedFolderId, selectedTags]);

  const loadData = async () => {
    try {
      setLoading(true);
      const client = initNotesClient(userId);

      // Load folders
      const foldersData = await client.listFolders();
      setFolders(foldersData);

      // Load notes with filters
      const notesData = await client.listNotes({
        folderId: selectedFolderId,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        isArchived: false,
      });
      setNotes(notesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const client = initNotesClient(userId);
      const { note } = await client.createNote({
        title: 'Untitled Note',
        content: '',
        folderId: selectedFolderId,
      });
      setNotes([note, ...notes]);
      setSelectedNote(note);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      const client = initNotesClient(userId);
      await client.updateNote(noteId, updates);
      
      // Update local state
      setNotes(notes.map(n => n.id === noteId ? { ...n, ...updates } : n));
      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, ...updates });
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const client = initNotesClient(userId);
      await client.deleteNote(noteId);
      
      // Update local state
      setNotes(notes.filter(n => n.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleCreateFolder = async (name: string, parentId?: string) => {
    try {
      const client = initNotesClient(userId);
      const { folder } = await client.createFolder({ name, parentId });
      setFolders([...folders, folder]);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="notes-app">
      <Sidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        selectedTags={selectedTags}
        onSelectFolder={setSelectedFolderId}
        onSelectTags={setSelectedTags}
        onCreateFolder={handleCreateFolder}
        allTags={Array.from(new Set(notes.flatMap(n => n.tags)))}
      />
      
      <NoteList
        notes={sortedNotes}
        selectedNote={selectedNote}
        onSelectNote={setSelectedNote}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
        onUpdateNote={handleUpdateNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        loading={loading}
      />
      
      <NoteEditor
        note={selectedNote}
        onUpdateNote={handleUpdateNote}
        userId={userId}
      />
    </div>
  );
};
