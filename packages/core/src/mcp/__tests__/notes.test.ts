/**
 * Tests for NotesMCP Server
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotesMCPServer } from '../notes';
import {
  setupFirestoreMocks,
  setupLoggerMock,
  resetAllMocks,
  mockFirestore,
  createMockDocSnapshot,
  createMockQuerySnapshot,
  createMockNote,
  createMockFolder,
} from './test-utils';

// Setup mocks
setupFirestoreMocks();
setupLoggerMock();

describe('NotesMCP Server', () => {
  let server: NotesMCPServer;

  beforeEach(() => {
    resetAllMocks();
    server = new NotesMCPServer();
  });

  describe('createNote', () => {
    it('should create a new note successfully', async () => {
      const mockNoteId = 'new-note-123';
      mockFirestore.doc.mockReturnValue({ id: mockNoteId });
      mockFirestore.setDoc.mockResolvedValue(undefined);

      const result = await server.executeTool('createNote', {
        userId: 'user-123',
        title: 'New Note',
        content: 'Note content',
        tags: ['test', 'new'],
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockNoteId);
      expect(result.data?.note.title).toBe('New Note');
      expect(result.data?.note.content).toBe('Note content');
      expect(result.data?.note.tags).toEqual(['test', 'new']);
      expect(mockFirestore.setDoc).toHaveBeenCalled();
    });

    it('should create a note with folder assignment', async () => {
      const mockNoteId = 'new-note-456';
      mockFirestore.doc.mockReturnValue({ id: mockNoteId });
      mockFirestore.setDoc.mockResolvedValue(undefined);

      const result = await server.executeTool('createNote', {
        userId: 'user-123',
        title: 'Folder Note',
        content: 'Content',
        folderId: 'folder-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.note.folderId).toBe('folder-123');
    });

    it('should handle missing required fields', async () => {
      const result = await server.executeTool('createNote', {
        userId: 'user-123',
        // Missing title and content
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getNote', () => {
    it('should retrieve a note successfully', async () => {
      const mockNote = createMockNote();
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(mockNote, true)
      );

      const result = await server.executeTool('getNote', {
        noteId: 'note-123',
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.note.id).toBe('note-123');
      expect(result.data?.note.title).toBe('Test Note');
    });

    it('should return null for non-existent note', async () => {
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(null, false)
      );

      const result = await server.executeTool('getNote', {
        noteId: 'non-existent',
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.note).toBeNull();
    });

    it('should reject unauthorized access', async () => {
      const mockNote = createMockNote({ userId: 'other-user' });
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(mockNote, true)
      );

      const result = await server.executeTool('getNote', {
        noteId: 'note-123',
        userId: 'user-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
    });
  });

  describe('updateNote', () => {
    it('should update note title and content', async () => {
      const mockNote = createMockNote();
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(mockNote, true)
      );
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      const result = await server.executeTool('updateNote', {
        noteId: 'note-123',
        userId: 'user-123',
        title: 'Updated Title',
        content: 'Updated content',
      });

      expect(result.success).toBe(true);
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          title: 'Updated Title',
          content: 'Updated content',
        })
      );
    });

    it('should update note tags', async () => {
      const mockNote = createMockNote();
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(mockNote, true)
      );
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      const result = await server.executeTool('updateNote', {
        noteId: 'note-123',
        userId: 'user-123',
        tags: ['updated', 'tags'],
      });

      expect(result.success).toBe(true);
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          tags: ['updated', 'tags'],
        })
      );
    });

    it('should update pin status', async () => {
      const mockNote = createMockNote();
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(mockNote, true)
      );
      mockFirestore.updateDoc.mockResolvedValue(undefined);

      const result = await server.executeTool('updateNote', {
        noteId: 'note-123',
        userId: 'user-123',
        isPinned: true,
      });

      expect(result.success).toBe(true);
      expect(mockFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isPinned: true,
        })
      );
    });

    it('should reject unauthorized update', async () => {
      const mockNote = createMockNote({ userId: 'other-user' });
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(mockNote, true)
      );

      const result = await server.executeTool('updateNote', {
        noteId: 'note-123',
        userId: 'user-123',
        title: 'Hacked',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
      expect(mockFirestore.updateDoc).not.toHaveBeenCalled();
    });

    it('should handle non-existent note', async () => {
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(null, false)
      );

      const result = await server.executeTool('updateNote', {
        noteId: 'non-existent',
        userId: 'user-123',
        title: 'Update',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      const mockNote = createMockNote();
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(mockNote, true)
      );
      mockFirestore.deleteDoc.mockResolvedValue(undefined);

      const result = await server.executeTool('deleteNote', {
        noteId: 'note-123',
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(mockFirestore.deleteDoc).toHaveBeenCalled();
    });

    it('should reject unauthorized deletion', async () => {
      const mockNote = createMockNote({ userId: 'other-user' });
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(mockNote, true)
      );

      const result = await server.executeTool('deleteNote', {
        noteId: 'note-123',
        userId: 'user-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unauthorized');
      expect(mockFirestore.deleteDoc).not.toHaveBeenCalled();
    });

    it('should handle non-existent note', async () => {
      mockFirestore.getDoc.mockResolvedValue(
        createMockDocSnapshot(null, false)
      );

      const result = await server.executeTool('deleteNote', {
        noteId: 'non-existent',
        userId: 'user-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('listNotes', () => {
    it('should list all notes for a user', async () => {
      const mockNotes = [
        createMockNote({ id: 'note-1', title: 'Note 1' }),
        createMockNote({ id: 'note-2', title: 'Note 2' }),
        createMockNote({ id: 'note-3', title: 'Note 3' }),
      ];
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot(mockNotes)
      );

      const result = await server.executeTool('listNotes', {
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.notes).toHaveLength(3);
      expect(result.data?.notes[0].title).toBe('Note 1');
    });

    it('should filter notes by folder', async () => {
      const mockNotes = [
        createMockNote({ id: 'note-1', folderId: 'folder-123' }),
      ];
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot(mockNotes)
      );

      const result = await server.executeTool('listNotes', {
        userId: 'user-123',
        folderId: 'folder-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.notes).toHaveLength(1);
      expect(result.data?.notes[0].folderId).toBe('folder-123');
    });

    it('should filter notes by pinned status', async () => {
      const mockNotes = [
        createMockNote({ id: 'note-1', isPinned: true }),
      ];
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot(mockNotes)
      );

      const result = await server.executeTool('listNotes', {
        userId: 'user-123',
        isPinned: true,
      });

      expect(result.success).toBe(true);
      expect(result.data?.notes).toHaveLength(1);
      expect(result.data?.notes[0].isPinned).toBe(true);
    });

    it('should filter notes by tags', async () => {
      const mockNotes = [
        createMockNote({ id: 'note-1', tags: ['important', 'work'] }),
        createMockNote({ id: 'note-2', tags: ['personal'] }),
      ];
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot(mockNotes)
      );

      const result = await server.executeTool('listNotes', {
        userId: 'user-123',
        tags: ['important'],
      });

      expect(result.success).toBe(true);
      expect(result.data?.notes).toHaveLength(1);
      expect(result.data?.notes[0].tags).toContain('important');
    });

    it('should return empty array when no notes found', async () => {
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot([])
      );

      const result = await server.executeTool('listNotes', {
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.notes).toHaveLength(0);
    });

    it('should respect limit parameter', async () => {
      const mockNotes = Array.from({ length: 10 }, (_, i) =>
        createMockNote({ id: `note-${i}` })
      );
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot(mockNotes)
      );

      const result = await server.executeTool('listNotes', {
        userId: 'user-123',
        limitCount: 5,
      });

      expect(result.success).toBe(true);
      // Note: actual limiting happens in Firestore query, we just verify the call
      expect(mockFirestore.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('createFolder', () => {
    it('should create a new folder successfully', async () => {
      const mockFolderId = 'new-folder-123';
      mockFirestore.doc.mockReturnValue({ id: mockFolderId });
      mockFirestore.setDoc.mockResolvedValue(undefined);

      const result = await server.executeTool('createFolder', {
        userId: 'user-123',
        name: 'New Folder',
        color: '#ff0000',
      });

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(mockFolderId);
      expect(result.data?.folder.name).toBe('New Folder');
      expect(result.data?.folder.color).toBe('#ff0000');
      expect(mockFirestore.setDoc).toHaveBeenCalled();
    });

    it('should create a nested folder', async () => {
      const mockFolderId = 'nested-folder-123';
      mockFirestore.doc.mockReturnValue({ id: mockFolderId });
      mockFirestore.setDoc.mockResolvedValue(undefined);

      const result = await server.executeTool('createFolder', {
        userId: 'user-123',
        name: 'Nested Folder',
        parentId: 'parent-folder-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.folder.parentId).toBe('parent-folder-123');
    });
  });

  describe('listFolders', () => {
    it('should list all folders for a user', async () => {
      const mockFolders = [
        createMockFolder({ id: 'folder-1', name: 'Folder 1' }),
        createMockFolder({ id: 'folder-2', name: 'Folder 2' }),
      ];
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot(mockFolders)
      );

      const result = await server.executeTool('listFolders', {
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.folders).toHaveLength(2);
      expect(result.data?.folders[0].name).toBe('Folder 1');
    });

    it('should filter folders by parent', async () => {
      const mockFolders = [
        createMockFolder({ id: 'folder-1', parentId: 'parent-123' }),
      ];
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot(mockFolders)
      );

      const result = await server.executeTool('listFolders', {
        userId: 'user-123',
        parentId: 'parent-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.folders).toHaveLength(1);
      expect(result.data?.folders[0].parentId).toBe('parent-123');
    });

    it('should return empty array when no folders found', async () => {
      mockFirestore.getDocs.mockResolvedValue(
        createMockQuerySnapshot([])
      );

      const result = await server.executeTool('listFolders', {
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.folders).toHaveLength(0);
    });
  });

  describe('Tool validation', () => {
    it('should have all required tools defined', () => {
      const tools = server.getTools();
      const toolNames = tools.map(t => t.name);

      expect(toolNames).toContain('createNote');
      expect(toolNames).toContain('getNote');
      expect(toolNames).toContain('updateNote');
      expect(toolNames).toContain('deleteNote');
      expect(toolNames).toContain('listNotes');
      expect(toolNames).toContain('createFolder');
      expect(toolNames).toContain('listFolders');
    });

    it('should have proper tool schemas', () => {
      const tools = server.getTools();
      const createNoteTool = tools.find(t => t.name === 'createNote');

      expect(createNoteTool).toBeDefined();
      expect(createNoteTool?.inputSchema).toBeDefined();
      expect(createNoteTool?.outputSchema).toBeDefined();
      expect(createNoteTool?.inputSchema.required).toContain('userId');
      expect(createNoteTool?.inputSchema.required).toContain('title');
      expect(createNoteTool?.inputSchema.required).toContain('content');
    });
  });

  describe('Server lifecycle', () => {
    it('should initialize successfully', async () => {
      await server.initialize();
      // Should not throw
      expect(true).toBe(true);
    });

    it('should shutdown successfully', async () => {
      await server.shutdown();
      // Should not throw
      expect(true).toBe(true);
    });
  });
});
