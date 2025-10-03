/**
 * Tests for NotesClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotesClient, initNotesClient, getNotesClient } from '../notes-client';

// Mock MCP servers
const mockNotesMCPServer = {
  executeTool: vi.fn(),
};

const mockNotesAIMCPServer = {
  executeTool: vi.fn(),
};

vi.mock('@auraos/core/src/mcp', () => ({
  notesMCPServer: mockNotesMCPServer,
  notesAIMCPServer: mockNotesAIMCPServer,
}));

describe('NotesClient', () => {
  let client: NotesClient;
  const userId = 'test-user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new NotesClient(userId);
  });

  describe('Initialization', () => {
    it('should initialize with userId', () => {
      expect(client).toBeDefined();
      expect((client as any).userId).toBe(userId);
    });

    it('should create singleton instance with initNotesClient', () => {
      const instance = initNotesClient(userId);
      expect(instance).toBeInstanceOf(NotesClient);
    });

    it('should return same instance with getNotesClient', () => {
      const instance1 = initNotesClient(userId);
      const instance2 = getNotesClient();
      expect(instance1).toBe(instance2);
    });

    it('should throw error when getNotesClient called before init', () => {
      // Reset module to clear singleton
      vi.resetModules();
      const { getNotesClient: freshGetClient } = require('../notes-client');
      
      expect(() => freshGetClient()).toThrow('NotesClient not initialized');
    });
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'note-123',
          note: {
            id: 'note-123',
            title: 'Test Note',
            content: 'Test content',
            userId,
            tags: ['test'],
            isPinned: false,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      mockNotesMCPServer.executeTool.mockResolvedValue(mockResponse);

      const result = await client.createNote({
        title: 'Test Note',
        content: 'Test content',
        tags: ['test'],
      });

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('createNote', {
        userId,
        title: 'Test Note',
        content: 'Test content',
        tags: ['test'],
      });
      expect(result.id).toBe('note-123');
      expect(result.note.title).toBe('Test Note');
    });

    it('should throw error on failure', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: false,
        error: 'Creation failed',
      });

      await expect(
        client.createNote({ title: 'Test', content: 'Test' })
      ).rejects.toThrow('Creation failed');
    });
  });

  describe('getNote', () => {
    it('should retrieve a note successfully', async () => {
      const mockNote = {
        id: 'note-123',
        title: 'Test Note',
        content: 'Test content',
        userId,
        tags: [],
        isPinned: false,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      const result = await client.getNote('note-123');

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('getNote', {
        noteId: 'note-123',
        userId,
      });
      expect(result).toEqual(mockNote);
    });

    it('should return null for non-existent note', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { note: null },
      });

      const result = await client.getNote('non-existent');
      expect(result).toBeNull();
    });

    it('should throw error on failure', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: false,
        error: 'Note not found',
      });

      await expect(client.getNote('note-123')).rejects.toThrow('Note not found');
    });
  });

  describe('updateNote', () => {
    it('should update note successfully', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { success: true },
      });

      await client.updateNote('note-123', {
        title: 'Updated Title',
        content: 'Updated content',
      });

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('updateNote', {
        noteId: 'note-123',
        userId,
        title: 'Updated Title',
        content: 'Updated content',
      });
    });

    it('should update pin status', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { success: true },
      });

      await client.updateNote('note-123', { isPinned: true });

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('updateNote', {
        noteId: 'note-123',
        userId,
        isPinned: true,
      });
    });

    it('should throw error on failure', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: false,
        error: 'Update failed',
      });

      await expect(
        client.updateNote('note-123', { title: 'New' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteNote', () => {
    it('should delete note successfully', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { success: true },
      });

      await client.deleteNote('note-123');

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('deleteNote', {
        noteId: 'note-123',
        userId,
      });
    });

    it('should throw error on failure', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      await expect(client.deleteNote('note-123')).rejects.toThrow('Delete failed');
    });
  });

  describe('listNotes', () => {
    it('should list all notes', async () => {
      const mockNotes = [
        { id: 'note-1', title: 'Note 1' },
        { id: 'note-2', title: 'Note 2' },
      ];

      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { notes: mockNotes },
      });

      const result = await client.listNotes();

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('listNotes', {
        userId,
      });
      expect(result).toEqual(mockNotes);
    });

    it('should list notes with filters', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { notes: [] },
      });

      await client.listNotes({
        folderId: 'folder-123',
        tags: ['important'],
        isPinned: true,
        limitCount: 10,
      });

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('listNotes', {
        userId,
        folderId: 'folder-123',
        tags: ['important'],
        isPinned: true,
        limitCount: 10,
      });
    });

    it('should return empty array on failure', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: false,
        error: 'List failed',
      });

      await expect(client.listNotes()).rejects.toThrow('List failed');
    });
  });

  describe('createFolder', () => {
    it('should create folder successfully', async () => {
      const mockFolder = {
        id: 'folder-123',
        name: 'Test Folder',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { id: 'folder-123', folder: mockFolder },
      });

      const result = await client.createFolder({ name: 'Test Folder' });

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('createFolder', {
        userId,
        name: 'Test Folder',
      });
      expect(result.id).toBe('folder-123');
      expect(result.folder.name).toBe('Test Folder');
    });

    it('should create nested folder', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { id: 'folder-456', folder: {} },
      });

      await client.createFolder({
        name: 'Nested',
        parentId: 'parent-123',
        color: '#ff0000',
      });

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('createFolder', {
        userId,
        name: 'Nested',
        parentId: 'parent-123',
        color: '#ff0000',
      });
    });
  });

  describe('listFolders', () => {
    it('should list all folders', async () => {
      const mockFolders = [
        { id: 'folder-1', name: 'Folder 1' },
        { id: 'folder-2', name: 'Folder 2' },
      ];

      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { folders: mockFolders },
      });

      const result = await client.listFolders();

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('listFolders', {
        userId,
      });
      expect(result).toEqual(mockFolders);
    });

    it('should list folders with parent filter', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: { folders: [] },
      });

      await client.listFolders('parent-123');

      expect(mockNotesMCPServer.executeTool).toHaveBeenCalledWith('listFolders', {
        userId,
        parentId: 'parent-123',
      });
    });
  });

  describe('AI Features', () => {
    describe('summarizeNote', () => {
      it('should summarize note successfully', async () => {
        const mockSummary = {
          summary: 'This is a summary',
          keyPoints: ['Point 1', 'Point 2'],
        };

        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: true,
          data: mockSummary,
        });

        const result = await client.summarizeNote('note-123', 100);

        expect(mockNotesAIMCPServer.executeTool).toHaveBeenCalledWith('summarizeNote', {
          noteId: 'note-123',
          userId,
          maxLength: 100,
        });
        expect(result).toEqual(mockSummary);
      });

      it('should throw error on failure', async () => {
        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: false,
          error: 'Summarization failed',
        });

        await expect(
          client.summarizeNote('note-123')
        ).rejects.toThrow('Summarization failed');
      });
    });

    describe('findRelatedNotes', () => {
      it('should find related notes successfully', async () => {
        const mockRelated = [
          { noteId: 'note-2', title: 'Related', similarity: 0.8, reason: 'Similar content' },
        ];

        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: true,
          data: { relatedNotes: mockRelated },
        });

        const result = await client.findRelatedNotes('note-123', 5);

        expect(mockNotesAIMCPServer.executeTool).toHaveBeenCalledWith('findRelatedNotes', {
          noteId: 'note-123',
          userId,
          limitCount: 5,
        });
        expect(result).toEqual(mockRelated);
      });

      it('should return empty array when no related notes', async () => {
        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: true,
          data: { relatedNotes: [] },
        });

        const result = await client.findRelatedNotes('note-123');
        expect(result).toEqual([]);
      });
    });

    describe('generateNoteTags', () => {
      it('should generate tags successfully', async () => {
        const mockTags = ['tag1', 'tag2', 'tag3'];

        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: true,
          data: { tags: mockTags },
        });

        const result = await client.generateNoteTags('note-123', 5);

        expect(mockNotesAIMCPServer.executeTool).toHaveBeenCalledWith('generateNoteTags', {
          noteId: 'note-123',
          userId,
          maxTags: 5,
        });
        expect(result).toEqual(mockTags);
      });

      it('should return empty array on failure', async () => {
        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: false,
          error: 'Tag generation failed',
        });

        await expect(
          client.generateNoteTags('note-123')
        ).rejects.toThrow('Tag generation failed');
      });
    });

    describe('enhanceNoteContent', () => {
      it('should enhance content successfully', async () => {
        const mockEnhancement = {
          enhancedContent: 'Enhanced content',
          suggestions: [
            { type: 'grammar', original: 'teh', suggestion: 'the', reason: 'Spelling' },
          ],
        };

        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: true,
          data: mockEnhancement,
        });

        const result = await client.enhanceNoteContent('note-123', 'grammar');

        expect(mockNotesAIMCPServer.executeTool).toHaveBeenCalledWith('enhanceNoteContent', {
          noteId: 'note-123',
          userId,
          enhancementType: 'grammar',
        });
        expect(result).toEqual(mockEnhancement);
      });

      it('should work without enhancement type', async () => {
        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: true,
          data: { enhancedContent: '', suggestions: [] },
        });

        await client.enhanceNoteContent('note-123');

        expect(mockNotesAIMCPServer.executeTool).toHaveBeenCalledWith('enhanceNoteContent', {
          noteId: 'note-123',
          userId,
          enhancementType: undefined,
        });
      });
    });

    describe('transcribeAudioToNote', () => {
      it('should transcribe audio successfully', async () => {
        const mockResult = {
          noteId: 'note-123',
          transcription: 'Transcribed text',
        };

        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: true,
          data: mockResult,
        });

        const result = await client.transcribeAudioToNote({
          audioUrl: 'https://example.com/audio.mp3',
          title: 'Voice Note',
        });

        expect(mockNotesAIMCPServer.executeTool).toHaveBeenCalledWith('transcribeAudioToNote', {
          userId,
          audioUrl: 'https://example.com/audio.mp3',
          title: 'Voice Note',
        });
        expect(result).toEqual(mockResult);
      });

      it('should work with minimal parameters', async () => {
        mockNotesAIMCPServer.executeTool.mockResolvedValue({
          success: true,
          data: { noteId: 'note-123', transcription: 'Text' },
        });

        await client.transcribeAudioToNote({
          audioUrl: 'https://example.com/audio.mp3',
        });

        expect(mockNotesAIMCPServer.executeTool).toHaveBeenCalledWith('transcribeAudioToNote', {
          userId,
          audioUrl: 'https://example.com/audio.mp3',
        });
      });
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockNotesMCPServer.executeTool.mockRejectedValue(new Error('Network error'));

      await expect(client.getNote('note-123')).rejects.toThrow('Network error');
    });

    it('should handle missing data in response', async () => {
      mockNotesMCPServer.executeTool.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const result = await client.getNote('note-123');
      expect(result).toBeNull();
    });
  });
});
