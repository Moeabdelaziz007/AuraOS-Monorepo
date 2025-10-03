/**
 * Tests for Sidebar component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import type { Folder } from '../../types';

describe('Sidebar', () => {
  const mockFolders: Folder[] = [
    {
      id: 'folder-1',
      name: 'Work',
      userId: 'user-123',
      color: '#1976d2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'folder-2',
      name: 'Personal',
      userId: 'user-123',
      color: '#4caf50',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'folder-3',
      name: 'Work Projects',
      userId: 'user-123',
      parentId: 'folder-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockTags = ['important', 'todo', 'meeting'];

  const defaultProps = {
    folders: mockFolders,
    selectedFolderId: undefined,
    selectedTags: [],
    onSelectFolder: vi.fn(),
    onSelectTags: vi.fn(),
    onCreateFolder: vi.fn(),
    allTags: mockTags,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render folders section', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByText('Folders')).toBeInTheDocument();
      expect(screen.getByText('All Notes')).toBeInTheDocument();
    });

    it('should render all root folders', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
    });

    it('should render tags section', () => {
      render(<Sidebar {...defaultProps} />);
      
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('important')).toBeInTheDocument();
      expect(screen.getByText('todo')).toBeInTheDocument();
      expect(screen.getByText('meeting')).toBeInTheDocument();
    });

    it('should show empty state when no tags', () => {
      render(<Sidebar {...defaultProps} allTags={[]} />);
      
      expect(screen.getByText('No tags yet')).toBeInTheDocument();
    });

    it('should render new folder button', () => {
      render(<Sidebar {...defaultProps} />);
      
      const newFolderButton = screen.getByTitle('New Folder');
      expect(newFolderButton).toBeInTheDocument();
    });
  });

  describe('Folder selection', () => {
    it('should call onSelectFolder when clicking "All Notes"', () => {
      render(<Sidebar {...defaultProps} />);
      
      const allNotesButton = screen.getByText('All Notes');
      fireEvent.click(allNotesButton);
      
      expect(defaultProps.onSelectFolder).toHaveBeenCalledWith(undefined);
    });

    it('should call onSelectFolder when clicking a folder', () => {
      render(<Sidebar {...defaultProps} />);
      
      const workFolder = screen.getByText('Work');
      fireEvent.click(workFolder);
      
      expect(defaultProps.onSelectFolder).toHaveBeenCalledWith('folder-1');
    });

    it('should highlight selected folder', () => {
      render(<Sidebar {...defaultProps} selectedFolderId="folder-1" />);
      
      const workFolder = screen.getByText('Work').closest('.sidebar-folder');
      expect(workFolder).toHaveClass('selected');
    });

    it('should highlight "All Notes" when no folder selected', () => {
      render(<Sidebar {...defaultProps} selectedFolderId={undefined} />);
      
      const allNotes = screen.getByText('All Notes').closest('.sidebar-folder');
      expect(allNotes).toHaveClass('selected');
    });
  });

  describe('Nested folders', () => {
    it('should show expand button for folders with children', () => {
      render(<Sidebar {...defaultProps} />);
      
      const workFolder = screen.getByText('Work').closest('.sidebar-folder');
      const expandButton = within(workFolder!).getByRole('button', { name: '' });
      
      expect(expandButton).toBeInTheDocument();
    });

    it('should not show expand button for folders without children', () => {
      render(<Sidebar {...defaultProps} />);
      
      const personalFolder = screen.getByText('Personal').closest('.sidebar-folder');
      const buttons = within(personalFolder!).queryAllByRole('button');
      
      // Should only have the folder button itself, not an expand button
      expect(buttons.length).toBe(1);
    });

    it('should expand folder when clicking expand button', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Initially, nested folder should not be visible
      expect(screen.queryByText('Work Projects')).not.toBeInTheDocument();
      
      // Click expand button
      const workFolder = screen.getByText('Work').closest('.sidebar-folder');
      const expandButton = within(workFolder!).getByRole('button', { name: '' });
      fireEvent.click(expandButton);
      
      // Now nested folder should be visible
      expect(screen.getByText('Work Projects')).toBeInTheDocument();
    });

    it('should collapse folder when clicking expand button again', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Expand
      const workFolder = screen.getByText('Work').closest('.sidebar-folder');
      const expandButton = within(workFolder!).getByRole('button', { name: '' });
      fireEvent.click(expandButton);
      expect(screen.getByText('Work Projects')).toBeInTheDocument();
      
      // Collapse
      fireEvent.click(expandButton);
      expect(screen.queryByText('Work Projects')).not.toBeInTheDocument();
    });
  });

  describe('Folder creation', () => {
    it('should show input when clicking new folder button', () => {
      render(<Sidebar {...defaultProps} />);
      
      const newFolderButton = screen.getByTitle('New Folder');
      fireEvent.click(newFolderButton);
      
      expect(screen.getByPlaceholderText('Folder name')).toBeInTheDocument();
      expect(screen.getByText('Create')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onCreateFolder when submitting', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Open input
      const newFolderButton = screen.getByTitle('New Folder');
      fireEvent.click(newFolderButton);
      
      // Type folder name
      const input = screen.getByPlaceholderText('Folder name');
      fireEvent.change(input, { target: { value: 'New Folder' } });
      
      // Submit
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(defaultProps.onCreateFolder).toHaveBeenCalledWith('New Folder');
    });

    it('should submit on Enter key', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Open input
      const newFolderButton = screen.getByTitle('New Folder');
      fireEvent.click(newFolderButton);
      
      // Type and press Enter
      const input = screen.getByPlaceholderText('Folder name');
      fireEvent.change(input, { target: { value: 'Quick Folder' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(defaultProps.onCreateFolder).toHaveBeenCalledWith('Quick Folder');
    });

    it('should cancel on Escape key', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Open input
      const newFolderButton = screen.getByTitle('New Folder');
      fireEvent.click(newFolderButton);
      
      // Press Escape
      const input = screen.getByPlaceholderText('Folder name');
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(screen.queryByPlaceholderText('Folder name')).not.toBeInTheDocument();
      expect(defaultProps.onCreateFolder).not.toHaveBeenCalled();
    });

    it('should cancel when clicking cancel button', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Open input
      const newFolderButton = screen.getByTitle('New Folder');
      fireEvent.click(newFolderButton);
      
      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByPlaceholderText('Folder name')).not.toBeInTheDocument();
      expect(defaultProps.onCreateFolder).not.toHaveBeenCalled();
    });

    it('should not create folder with empty name', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Open input
      const newFolderButton = screen.getByTitle('New Folder');
      fireEvent.click(newFolderButton);
      
      // Try to submit without typing
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(defaultProps.onCreateFolder).not.toHaveBeenCalled();
    });

    it('should trim whitespace from folder name', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Open input
      const newFolderButton = screen.getByTitle('New Folder');
      fireEvent.click(newFolderButton);
      
      // Type with whitespace
      const input = screen.getByPlaceholderText('Folder name');
      fireEvent.change(input, { target: { value: '  Trimmed  ' } });
      
      // Submit
      const createButton = screen.getByText('Create');
      fireEvent.click(createButton);
      
      expect(defaultProps.onCreateFolder).toHaveBeenCalledWith('Trimmed');
    });
  });

  describe('Tag selection', () => {
    it('should call onSelectTags when clicking a tag', () => {
      render(<Sidebar {...defaultProps} />);
      
      const importantTag = screen.getByText('important');
      fireEvent.click(importantTag);
      
      expect(defaultProps.onSelectTags).toHaveBeenCalledWith(['important']);
    });

    it('should highlight selected tags', () => {
      render(<Sidebar {...defaultProps} selectedTags={['important']} />);
      
      const importantTag = screen.getByText('important').closest('.tag-button');
      expect(importantTag).toHaveClass('selected');
    });

    it('should support multiple tag selection', () => {
      const { rerender } = render(<Sidebar {...defaultProps} />);
      
      // Select first tag
      const importantTag = screen.getByText('important');
      fireEvent.click(importantTag);
      expect(defaultProps.onSelectTags).toHaveBeenCalledWith(['important']);
      
      // Rerender with first tag selected
      rerender(<Sidebar {...defaultProps} selectedTags={['important']} />);
      
      // Select second tag
      const todoTag = screen.getByText('todo');
      fireEvent.click(todoTag);
      expect(defaultProps.onSelectTags).toHaveBeenCalledWith(['important', 'todo']);
    });

    it('should deselect tag when clicking again', () => {
      render(<Sidebar {...defaultProps} selectedTags={['important', 'todo']} />);
      
      const importantTag = screen.getByText('important');
      fireEvent.click(importantTag);
      
      expect(defaultProps.onSelectTags).toHaveBeenCalledWith(['todo']);
    });
  });

  describe('Folder colors', () => {
    it('should apply folder colors', () => {
      render(<Sidebar {...defaultProps} />);
      
      const workFolder = screen.getByText('Work').previousSibling as HTMLElement;
      expect(workFolder).toHaveStyle({ color: '#1976d2' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<Sidebar {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have accessible folder buttons', () => {
      render(<Sidebar {...defaultProps} />);
      
      const workFolder = screen.getByText('Work');
      expect(workFolder.closest('button')).toBeInTheDocument();
    });

    it('should have accessible tag buttons', () => {
      render(<Sidebar {...defaultProps} />);
      
      const importantTag = screen.getByText('important');
      expect(importantTag.closest('button')).toBeInTheDocument();
    });
  });
});
