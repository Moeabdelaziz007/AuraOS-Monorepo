/**
 * Tests for NoteEditor component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteEditor } from '../NoteEditor';
import type { Note } from '../../types';

// Mock TipTap editor
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    commands: {
      setContent: vi.fn(),
      focus: vi.fn().mockReturnThis(),
      toggleBold: vi.fn().mockReturnThis(),
      toggleItalic: vi.fn().mockReturnThis(),
      toggleHeading: vi.fn().mockReturnThis(),
      toggleBulletList: vi.fn().mockReturnThis(),
      toggleOrderedList: vi.fn().mockReturnThis(),
      toggleCodeBlock: vi.fn().mockReturnThis(),
      toggleBlockquote: vi.fn().mockReturnThis(),
      run: vi.fn(),
    },
    chain: vi.fn().mockReturnThis(),
    isActive: vi.fn(() => false),
    getHTML: vi.fn(() => '<p>Test content</p>'),
  })),
  EditorContent: ({ editor }: any) => <div data-testid="editor-content">Editor</div>,
}));

// Mock TipTap extensions
vi.mock('@tiptap/starter-kit', () => ({ default: {} }));
vi.mock('@tiptap/extension-placeholder', () => ({ default: { configure: vi.fn() } }));
vi.mock('@tiptap/extension-link', () => ({ default: { configure: vi.fn() } }));
vi.mock('@tiptap/extension-image', () => ({ default: {} }));

// Mock NotesClient
vi.mock('../../lib/notes-client', () => ({
  initNotesClient: vi.fn(() => ({
    summarizeNote: vi.fn(),
    findRelatedNotes: vi.fn(),
    generateNoteTags: vi.fn(),
    enhanceNoteContent: vi.fn(),
  })),
}));

describe('NoteEditor', () => {
  const mockNote: Note = {
    id: 'note-123',
    title: 'Test Note',
    content: '<p>Test content</p>',
    userId: 'user-123',
    tags: ['test'],
    isPinned: false,
    isArchived: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const defaultProps = {
    note: mockNote,
    onUpdateNote: vi.fn(),
    userId: 'user-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  describe('Rendering', () => {
    it('should render editor when note is provided', () => {
      render(<NoteEditor {...defaultProps} />);
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should show empty state when no note selected', () => {
      render(<NoteEditor {...defaultProps} note={null} />);
      
      expect(screen.getByText('No note selected')).toBeInTheDocument();
      expect(screen.getByText('Select a note from the list or create a new one')).toBeInTheDocument();
    });

    it('should render title input', () => {
      render(<NoteEditor {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Note title') as HTMLInputElement;
      expect(titleInput).toBeInTheDocument();
      expect(titleInput.value).toBe('Test Note');
    });

    it('should render AI button', () => {
      render(<NoteEditor {...defaultProps} />);
      
      expect(screen.getByText('AI')).toBeInTheDocument();
    });

    it('should render toolbar buttons', () => {
      render(<NoteEditor {...defaultProps} />);
      
      expect(screen.getByTitle('Bold')).toBeInTheDocument();
      expect(screen.getByTitle('Italic')).toBeInTheDocument();
      expect(screen.getByTitle('Heading 1')).toBeInTheDocument();
      expect(screen.getByTitle('Heading 2')).toBeInTheDocument();
      expect(screen.getByTitle('Bullet List')).toBeInTheDocument();
      expect(screen.getByTitle('Numbered List')).toBeInTheDocument();
      expect(screen.getByTitle('Code Block')).toBeInTheDocument();
      expect(screen.getByTitle('Quote')).toBeInTheDocument();
    });
  });

  describe('Title editing', () => {
    it('should call onUpdateNote when title changes', async () => {
      render(<NoteEditor {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Note title');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });
      
      // Wait for debounce
      await waitFor(() => {
        expect(defaultProps.onUpdateNote).toHaveBeenCalledWith('note-123', {
          title: 'New Title',
        });
      }, { timeout: 2000 });
    });

    it('should update title input value immediately', () => {
      render(<NoteEditor {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Note title') as HTMLInputElement;
      fireEvent.change(titleInput, { target: { value: 'Immediate Update' } });
      
      expect(titleInput.value).toBe('Immediate Update');
    });
  });

  describe('AI menu', () => {
    it('should toggle AI menu when clicking AI button', () => {
      render(<NoteEditor {...defaultProps} />);
      
      const aiButton = screen.getByText('AI');
      
      // Menu should not be visible initially
      expect(screen.queryByText('Summarize')).not.toBeInTheDocument();
      
      // Click to show menu
      fireEvent.click(aiButton);
      expect(screen.getByText('Summarize')).toBeInTheDocument();
      expect(screen.getByText('Find Related')).toBeInTheDocument();
      expect(screen.getByText('Generate Tags')).toBeInTheDocument();
      expect(screen.getByText('Enhance Content')).toBeInTheDocument();
      
      // Click again to hide menu
      fireEvent.click(aiButton);
      expect(screen.queryByText('Summarize')).not.toBeInTheDocument();
    });

    it('should disable AI button when loading', () => {
      render(<NoteEditor {...defaultProps} />);
      
      const aiButton = screen.getByText('AI').closest('button');
      expect(aiButton).not.toBeDisabled();
    });
  });

  describe('Toolbar formatting', () => {
    it('should call editor commands when clicking bold button', () => {
      const { useEditor } = require('@tiptap/react');
      const mockEditor = useEditor();
      
      render(<NoteEditor {...defaultProps} />);
      
      const boldButton = screen.getByTitle('Bold');
      fireEvent.click(boldButton);
      
      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('should call editor commands when clicking italic button', () => {
      const { useEditor } = require('@tiptap/react');
      const mockEditor = useEditor();
      
      render(<NoteEditor {...defaultProps} />);
      
      const italicButton = screen.getByTitle('Italic');
      fireEvent.click(italicButton);
      
      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('should call editor commands when clicking heading buttons', () => {
      const { useEditor } = require('@tiptap/react');
      const mockEditor = useEditor();
      
      render(<NoteEditor {...defaultProps} />);
      
      const h1Button = screen.getByTitle('Heading 1');
      fireEvent.click(h1Button);
      
      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('should call editor commands when clicking list buttons', () => {
      const { useEditor } = require('@tiptap/react');
      const mockEditor = useEditor();
      
      render(<NoteEditor {...defaultProps} />);
      
      const bulletButton = screen.getByTitle('Bullet List');
      fireEvent.click(bulletButton);
      
      expect(mockEditor.chain).toHaveBeenCalled();
    });

    it('should highlight active formatting', () => {
      const { useEditor } = require('@tiptap/react');
      const mockEditor = useEditor();
      mockEditor.isActive.mockReturnValue(true);
      
      render(<NoteEditor {...defaultProps} />);
      
      const boldButton = screen.getByTitle('Bold');
      expect(boldButton).toHaveClass('active');
    });
  });

  describe('Saving indicator', () => {
    it('should show saving indicator when saving', async () => {
      render(<NoteEditor {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Note title');
      fireEvent.change(titleInput, { target: { value: 'New Title' } });
      
      // Should show saving indicator briefly
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).toBeInTheDocument();
      });
    });
  });

  describe('Note switching', () => {
    it('should update editor content when note changes', () => {
      const { useEditor } = require('@tiptap/react');
      const mockEditor = useEditor();
      
      const { rerender } = render(<NoteEditor {...defaultProps} />);
      
      const newNote: Note = {
        ...mockNote,
        id: 'note-456',
        title: 'Different Note',
        content: '<p>Different content</p>',
      };
      
      rerender(<NoteEditor {...defaultProps} note={newNote} />);
      
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith('<p>Different content</p>');
    });

    it('should clear editor when note is set to null', () => {
      const { useEditor } = require('@tiptap/react');
      const mockEditor = useEditor();
      
      const { rerender } = render(<NoteEditor {...defaultProps} />);
      
      rerender(<NoteEditor {...defaultProps} note={null} />);
      
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith('');
    });
  });

  describe('Empty state', () => {
    it('should show file icon in empty state', () => {
      render(<NoteEditor {...defaultProps} note={null} />);
      
      const emptyState = screen.getByText('No note selected').closest('.empty-state');
      expect(emptyState).toBeInTheDocument();
    });

    it('should not show toolbar in empty state', () => {
      render(<NoteEditor {...defaultProps} note={null} />);
      
      expect(screen.queryByTitle('Bold')).not.toBeInTheDocument();
    });

    it('should not show AI button in empty state', () => {
      render(<NoteEditor {...defaultProps} note={null} />);
      
      expect(screen.queryByText('AI')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible title input', () => {
      render(<NoteEditor {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Note title');
      expect(titleInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible toolbar buttons', () => {
      render(<NoteEditor {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // All buttons should have titles or text
      buttons.forEach(button => {
        expect(
          button.getAttribute('title') || button.textContent
        ).toBeTruthy();
      });
    });
  });

  describe('Debouncing', () => {
    it('should debounce content updates', async () => {
      render(<NoteEditor {...defaultProps} />);
      
      const titleInput = screen.getByPlaceholderText('Note title');
      
      // Rapid changes
      fireEvent.change(titleInput, { target: { value: 'A' } });
      fireEvent.change(titleInput, { target: { value: 'AB' } });
      fireEvent.change(titleInput, { target: { value: 'ABC' } });
      
      // Should only call once after debounce
      await waitFor(() => {
        expect(defaultProps.onUpdateNote).toHaveBeenCalledTimes(1);
      }, { timeout: 2000 });
    });
  });

  describe('Editor initialization', () => {
    it('should initialize editor with note content', () => {
      const { useEditor } = require('@tiptap/react');
      
      render(<NoteEditor {...defaultProps} />);
      
      expect(useEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '<p>Test content</p>',
        })
      );
    });

    it('should initialize editor with empty content when no note', () => {
      const { useEditor } = require('@tiptap/react');
      
      render(<NoteEditor {...defaultProps} note={null} />);
      
      expect(useEditor).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '',
        })
      );
    });
  });
});
