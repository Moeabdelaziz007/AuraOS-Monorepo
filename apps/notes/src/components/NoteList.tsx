/**
 * NoteList - List of notes with search and actions
 */

import React from 'react';
import { Plus, Search, Pin, Archive, Trash2, MoreVertical } from 'lucide-react';
import type { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNote,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
  searchQuery,
  onSearchChange,
  loading,
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return new Date(date).toLocaleDateString();
  };

  const getPreview = (content: string, maxLength: number = 100) => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const handleTogglePin = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    onUpdateNote(note.id, { isPinned: !note.isPinned });
  };

  const handleArchive = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    onUpdateNote(note.id, { isArchived: true });
  };

  const handleDelete = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      onDeleteNote(noteId);
    }
  };

  return (
    <div className="note-list">
      <div className="note-list-header">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="create-note-button" onClick={onCreateNote}>
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      <div className="notes-container">
        {loading ? (
          <div className="loading-state">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p>No notes found</p>
            <button onClick={onCreateNote}>Create your first note</button>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
              onClick={() => onSelectNote(note)}
            >
              <div className="note-item-header">
                <h4>{note.title || 'Untitled'}</h4>
                <div className="note-item-actions">
                  {note.isPinned && <Pin size={14} className="pinned-icon" />}
                  <button
                    className="icon-button"
                    onClick={(e) => handleTogglePin(e, note)}
                    title={note.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={(e) => handleArchive(e, note)}
                    title="Archive"
                  >
                    <Archive size={14} />
                  </button>
                  <button
                    className="icon-button"
                    onClick={(e) => handleDelete(e, note.id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <p className="note-preview">{getPreview(note.content)}</p>
              
              <div className="note-item-footer">
                <span className="note-date">{formatDate(note.updatedAt)}</span>
                {note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag-badge">{tag}</span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="tag-badge">+{note.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
