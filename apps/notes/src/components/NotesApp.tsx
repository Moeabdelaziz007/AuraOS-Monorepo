/**
 * NotesApp - Main application component
 * Three-pane layout: Sidebar (folders/tags) | Note List | Editor
 */

import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { NoteList } from './NoteList';
import { NoteEditor } from './NoteEditor';
import { useAuth } from '../contexts/AuthContext';
import { initNotesClient } from '../lib/notes-client';
import type { Note, Folder } from '../types';
import '../styles/notes-app.css';

interface NotesAppProps {
  userId: string;
}

export const NotesApp: React.FC<NotesAppProps> = ({ userId }) => {
  const { user, logout } = useAuth();
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
      const note = await client.createNote({
        title: 'Untitled Note',
        content: '',
        tags: [],
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
      const updatedNote = await client.updateNote(noteId, updates);
      
      // Update local state with server response
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNote);
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

  // Use API search when query is provided
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 0) {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query || query.trim().length === 0) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const client = initNotesClient(userId);
      const results = await client.searchNotes(query, { limit: 50 });
      setNotes(results.map(r => r.note));
    } catch (error) {
      console.error('Failed to search notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = searchQuery ? notes : notes.filter(note => {
    return !note.isArchived;
  });

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="notes-app">
      <div className="app-header">
        <div className="user-info">
          <span className="user-name">{user?.name || user?.email}</span>
          <button className="logout-button" onClick={logout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
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
