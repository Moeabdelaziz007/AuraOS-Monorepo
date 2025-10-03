/**
 * Tests for NoteList component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { NoteList } from '../NoteList';
import type { Note } from '../../types';

describe('NoteList', () => {
  const mockNotes: Note[] = [
    {
      id: 'note-1',
      title: 'First Note',
      content: '<p>This is the first note content</p>',
      userId: 'user-123',
      tags: ['important', 'work'],
      isPinned: true,
      isArchived: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: 'note-2',
      title: 'Second Note',
      content: '<p>This is the second note with more content</p>',
      userId: 'user-123',
      tags: ['personal'],
      isPinned: false,
      isArchived: false,
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-04'),
    },
    {
      id: 'note-3',
      title: '',
      content: '<p>Untitled note</p>',
      userId: 'user-123',
      tags: [],
      isPinned: false,
      isArchived: false,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
    },
  ];

  const defaultProps = {
    notes: mockNotes,
    selectedNote: null,
    onSelectNote: vi.fn(),
    onCreateNote: vi.fn(),
    onDeleteNote: vi.fn(),
    onUpdateNote: vi.fn(),
    searchQuery: '',
    onSearchChange: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    global.confirm = vi.fn(() => true);
  });

  describe('Rendering', () => {
    it('should render search box', () => {
      render(<NoteList {...defaultProps} />);
      
      expect(screen.getByPlaceholderText('Search notes...')).toBeInTheDocument();
    });

    it('should render create note button', () => {
      render(<NoteList {...defaultProps} />);
      
      expect(screen.getByText('New Note')).toBeInTheDocument();
    });

    it('should render all notes', () => {
      render(<NoteList {...defaultProps} />);
      
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<NoteList {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Loading notes...')).toBeInTheDocument();
    });

    it('should show empty state when no notes', () => {
      render(<NoteList {...defaultProps} notes={[]} />);
      
      expect(screen.getByText('No notes found')).toBeInTheDocument();
      expect(screen.getByText('Create your first note')).toBeInTheDocument();
    });

    it('should render note previews', () => {
      render(<NoteList {...defaultProps} />);
      
      expect(screen.getByText(/This is the first note content/)).toBeInTheDocument();
      expect(screen.getByText(/This is the second note/)).toBeInTheDocument();
    });

    it('should strip HTML from preview', () => {
      render(<NoteList {...defaultProps} />);
      
      // Should not contain HTML tags
      const preview = screen.getByText(/This is the first note content/);
      expect(preview.textContent).not.toContain('<p>');
      expect(preview.textContent).not.toContain('</p>');
    });

    it('should truncate long previews', () => {
      const longNote: Note = {
        ...mockNotes[0],
        content: '<p>' + 'a'.repeat(200) + '</p>',
      };
      
      render(<NoteList {...defaultProps} notes={[longNote]} />);
      
      const preview = screen.getByText(/aaa/);
      expect(preview.textContent?.length).toBeLessThan(200);
      expect(preview.textContent).toContain('...');
    });
  });

  describe('Note selection', () => {
    it('should call onSelectNote when clicking a note', () => {
      render(<NoteList {...defaultProps} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      fireEvent.click(firstNote!);
      
      expect(defaultProps.onSelectNote).toHaveBeenCalledWith(mockNotes[0]);
    });

    it('should highlight selected note', () => {
      render(<NoteList {...defaultProps} selectedNote={mockNotes[0]} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      expect(firstNote).toHaveClass('selected');
    });

    it('should not highlight unselected notes', () => {
      render(<NoteList {...defaultProps} selectedNote={mockNotes[0]} />);
      
      const secondNote = screen.getByText('Second Note').closest('.note-item');
      expect(secondNote).not.toHaveClass('selected');
    });
  });

  describe('Search functionality', () => {
    it('should call onSearchChange when typing in search box', () => {
      render(<NoteList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search notes...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      expect(defaultProps.onSearchChange).toHaveBeenCalledWith('test query');
    });

    it('should display search query value', () => {
      render(<NoteList {...defaultProps} searchQuery="my search" />);
      
      const searchInput = screen.getByPlaceholderText('Search notes...') as HTMLInputElement;
      expect(searchInput.value).toBe('my search');
    });
  });

  describe('Note creation', () => {
    it('should call onCreateNote when clicking new note button', () => {
      render(<NoteList {...defaultProps} />);
      
      const createButton = screen.getByText('New Note');
      fireEvent.click(createButton);
      
      expect(defaultProps.onCreateNote).toHaveBeenCalled();
    });

    it('should call onCreateNote from empty state', () => {
      render(<NoteList {...defaultProps} notes={[]} />);
      
      const createButton = screen.getByText('Create your first note');
      fireEvent.click(createButton);
      
      expect(defaultProps.onCreateNote).toHaveBeenCalled();
    });
  });

  describe('Note actions', () => {
    it('should show pin icon for pinned notes', () => {
      render(<NoteList {...defaultProps} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      const pinIcon = within(firstNote!).getByTitle('Unpin');
      
      expect(pinIcon).toBeInTheDocument();
    });

    it('should call onUpdateNote when toggling pin', () => {
      render(<NoteList {...defaultProps} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      const pinButton = within(firstNote!).getByTitle('Unpin');
      fireEvent.click(pinButton);
      
      expect(defaultProps.onUpdateNote).toHaveBeenCalledWith('note-1', {
        isPinned: false,
      });
    });

    it('should call onUpdateNote when pinning unpinned note', () => {
      render(<NoteList {...defaultProps} />);
      
      const secondNote = screen.getByText('Second Note').closest('.note-item');
      const pinButton = within(secondNote!).getByTitle('Pin');
      fireEvent.click(pinButton);
      
      expect(defaultProps.onUpdateNote).toHaveBeenCalledWith('note-2', {
        isPinned: true,
      });
    });

    it('should call onUpdateNote when archiving', () => {
      render(<NoteList {...defaultProps} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      const archiveButton = within(firstNote!).getByTitle('Archive');
      fireEvent.click(archiveButton);
      
      expect(defaultProps.onUpdateNote).toHaveBeenCalledWith('note-1', {
        isArchived: true,
      });
    });

    it('should call onDeleteNote when deleting with confirmation', () => {
      render(<NoteList {...defaultProps} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      const deleteButton = within(firstNote!).getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      expect(global.confirm).toHaveBeenCalled();
      expect(defaultProps.onDeleteNote).toHaveBeenCalledWith('note-1');
    });

    it('should not delete when confirmation is cancelled', () => {
      global.confirm = vi.fn(() => false);
      render(<NoteList {...defaultProps} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      const deleteButton = within(firstNote!).getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      expect(global.confirm).toHaveBeenCalled();
      expect(defaultProps.onDeleteNote).not.toHaveBeenCalled();
    });

    it('should stop propagation on action buttons', () => {
      render(<NoteList {...defaultProps} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      const pinButton = within(firstNote!).getByTitle('Unpin');
      fireEvent.click(pinButton);
      
      // onSelectNote should not be called when clicking action buttons
      expect(defaultProps.onSelectNote).not.toHaveBeenCalled();
    });
  });

  describe('Tags display', () => {
    it('should display note tags', () => {
      render(<NoteList {...defaultProps} />);
      
      expect(screen.getByText('important')).toBeInTheDocument();
      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('personal')).toBeInTheDocument();
    });

    it('should limit displayed tags to 3', () => {
      const manyTagsNote: Note = {
        ...mockNotes[0],
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
      };
      
      render(<NoteList {...defaultProps} notes={[manyTagsNote]} />);
      
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
      expect(screen.getByText('tag3')).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.queryByText('tag4')).not.toBeInTheDocument();
    });

    it('should not show tag section when note has no tags', () => {
      render(<NoteList {...defaultProps} />);
      
      const untitledNote = screen.getByText('Untitled').closest('.note-item');
      const tagBadges = within(untitledNote!).queryAllByClassName('tag-badge');
      
      expect(tagBadges.length).toBe(0);
    });
  });

  describe('Date formatting', () => {
    it('should format dates correctly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 5);
      
      const notes: Note[] = [
        { ...mockNotes[0], updatedAt: today },
        { ...mockNotes[1], updatedAt: yesterday },
        { ...mockNotes[2], updatedAt: weekAgo },
      ];
      
      render(<NoteList {...defaultProps} notes={notes} />);
      
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('Yesterday')).toBeInTheDocument();
      expect(screen.getByText('5 days ago')).toBeInTheDocument();
    });

    it('should format old dates as date string', () => {
      const oldDate = new Date('2023-01-15');
      const notes: Note[] = [
        { ...mockNotes[0], updatedAt: oldDate },
      ];
      
      render(<NoteList {...defaultProps} notes={notes} />);
      
      // Should show formatted date
      expect(screen.getByText(/1\/15\/2023|15\/1\/2023/)).toBeInTheDocument();
    });
  });

  describe('Note ordering', () => {
    it('should display notes in provided order', () => {
      render(<NoteList {...defaultProps} />);
      
      const noteItems = screen.getAllByClassName('note-item');
      const titles = noteItems.map(item => 
        within(item).getByRole('heading').textContent
      );
      
      expect(titles).toEqual(['First Note', 'Second Note', 'Untitled']);
    });
  });

  describe('Untitled notes', () => {
    it('should display "Untitled" for notes without title', () => {
      render(<NoteList {...defaultProps} />);
      
      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });
  });

  describe('Action buttons visibility', () => {
    it('should show action buttons on hover', () => {
      render(<NoteList {...defaultProps} />);
      
      const firstNote = screen.getByText('First Note').closest('.note-item');
      const actions = within(firstNote!).getByClassName('note-item-actions');
      
      // Actions should exist in DOM (visibility controlled by CSS)
      expect(actions).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<NoteList {...defaultProps} />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible buttons', () => {
      render(<NoteList {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible search input', () => {
      render(<NoteList {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search notes...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });
});
