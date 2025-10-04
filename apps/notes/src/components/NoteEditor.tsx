/**
 * NoteEditor - Rich text editor with AI features
 */

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Quote,
  Heading1,
  Heading2,
  Sparkles,
  Link as LinkIcon,
  Image as ImageIcon,
  Tag,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { initNotesClient } from '../lib/notes-client';
import type { Note } from '../types';

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void;
  userId: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onUpdateNote,
  userId,
}) => {
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiLoading, setAILoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: note?.content || '',
    onUpdate: ({ editor }) => {
      if (note) {
        debouncedSave(note.id, editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      editor?.commands.setContent(note.content);
    } else {
      setTitle('');
      editor?.commands.setContent('');
    }
  }, [note?.id]);

  const debouncedSave = React.useCallback(
    debounce((noteId: string, content: string) => {
      setIsSaving(true);
      onUpdateNote(noteId, { content });
      setTimeout(() => setIsSaving(false), 500);
    }, 1000),
    [onUpdateNote]
  );

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (note) {
      debouncedSave(note.id, newTitle);
      onUpdateNote(note.id, { title: newTitle });
    }
  };

  const handleSummarize = async () => {
    if (!note) return;
    
    setAILoading(true);
    try {
      const client = initNotesClient(userId);
      const summary = await client.summarizeNote(note.id);
      
      alert(`Summary:\n${summary.summary}\n\nKey Points:\n${summary.keyPoints.join('\n')}`);
    } catch (error) {
      console.error('Failed to summarize:', error);
      alert('Failed to generate summary');
    } finally {
      setAILoading(false);
    }
  };

  const handleFindRelated = async () => {
    if (!note) return;
    
    setAILoading(true);
    try {
      const client = initNotesClient(userId);
      const related = await client.findRelatedNotes(note.id, 5);
      
      if (related.length === 0) {
        alert('No related notes found');
      } else {
        const message = related
          .map(r => `• ${r.title} (${Math.round(r.similarity * 100)}% similar)\n  ${r.reason}`)
          .join('\n\n');
        alert(`Related Notes:\n\n${message}`);
      }
    } catch (error) {
      console.error('Failed to find related notes:', error);
      alert('Failed to find related notes');
    } finally {
      setAILoading(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!note) return;
    
    setAILoading(true);
    try {
      const client = initNotesClient(userId);
      const tags = await client.generateNoteTags(note.id);
      
      onUpdateNote(note.id, { tags });
      alert(`Generated tags: ${tags.join(', ')}`);
    } catch (error) {
      console.error('Failed to generate tags:', error);
      alert('Failed to generate tags');
    } finally {
      setAILoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!note) return;
    
    setAILoading(true);
    try {
      const client = initNotesClient(userId);
      const enhancement = await client.enhanceNoteContent(note.id);
      
      if (confirm('Apply AI enhancements to this note?')) {
        editor?.commands.setContent(enhancement.enhancedContent);
        onUpdateNote(note.id, { content: enhancement.enhancedContent });
      }
    } catch (error) {
      console.error('Failed to enhance content:', error);
      alert('Failed to enhance content');
    } finally {
      setAILoading(false);
    }
  };

  if (!note) {
    return (
      <div className="note-editor empty">
        <div className="empty-state">
          <FileText size={48} />
          <h3>No note selected</h3>
          <p>Select a note from the list or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          className="note-title-input"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title"
        />
        <div className="editor-actions">
          {isSaving && <span className="saving-indicator">Saving...</span>}
          <button
            className="ai-button"
            onClick={() => setShowAIMenu(!showAIMenu)}
            disabled={aiLoading}
          >
            <Sparkles size={18} />
            <span>AI</span>
          </button>
        </div>
      </div>

      {showAIMenu && (
        <div className="ai-menu">
          <button onClick={handleSummarize} disabled={aiLoading}>
            <FileText size={16} />
            <span>Summarize</span>
          </button>
          <button onClick={handleFindRelated} disabled={aiLoading}>
            <Lightbulb size={16} />
            <span>Find Related</span>
          </button>
          <button onClick={handleGenerateTags} disabled={aiLoading}>
            <Tag size={16} />
            <span>Generate Tags</span>
          </button>
          <button onClick={handleEnhance} disabled={aiLoading}>
            <Sparkles size={16} />
            <span>Enhance Content</span>
          </button>
        </div>
      )}

      <div className="editor-toolbar">
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive('bold') ? 'active' : ''}
          title="Bold"
        >
          <Bold size={18} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive('italic') ? 'active' : ''}
          title="Italic"
        >
          <Italic size={18} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={editor?.isActive('bulletList') ? 'active' : ''}
          title="Bullet List"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={editor?.isActive('orderedList') ? 'active' : ''}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={editor?.isActive('codeBlock') ? 'active' : ''}
          title="Code Block"
        >
          <Code size={18} />
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={editor?.isActive('blockquote') ? 'active' : ''}
          title="Quote"
        >
          <Quote size={18} />
        </button>
      </div>

      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
};

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
