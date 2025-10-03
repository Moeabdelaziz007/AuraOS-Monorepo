/**
 * Tests for NotesAIMCP Server
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotesAIMCPServer } from '../notes-ai';
import { notesMCPServer } from '../notes';
import {
  setupGeminiMocks,
  setupLoggerMock,
  resetAllMocks,
  mockGeminiService,
  createMockNote,
} from './test-utils';

// Setup mocks
setupGeminiMocks();
setupLoggerMock();

// Mock notesMCPServer
vi.mock('../notes', () => ({
  notesMCPServer: {
    executeTool: vi.fn(),
  },
}));

describe('NotesAIMCP Server', () => {
  let server: NotesAIMCPServer;

  beforeEach(() => {
    resetAllMocks();
    vi.clearAllMocks();
    server = new NotesAIMCPServer();
  });

  describe('summarizeNote', () => {
    it('should generate a summary with key points', async () => {
      const mockNote = createMockNote({
        title: 'Meeting Notes',
        content: 'Discussed project timeline, budget allocation, and team assignments. Key decisions made regarding Q4 deliverables.',
      });

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockResolvedValue({
        content: JSON.stringify({
          summary: 'Meeting covered project timeline, budget, and team assignments for Q4.',
          keyPoints: [
            'Project timeline discussed',
            'Budget allocation reviewed',
            'Team assignments finalized',
          ],
        }),
        model: 'gemini-pro',
      });

      const result = await server.executeTool('summarizeNote', {
        noteId: 'note-123',
        userId: 'user-123',
        maxLength: 50,
      });

      expect(result.success).toBe(true);
      expect(result.data?.summary).toBeDefined();
      expect(result.data?.keyPoints).toHaveLength(3);
      expect(mockGeminiService.chat).toHaveBeenCalled();
    });

    it('should handle AI service errors with fallback', async () => {
      const mockNote = createMockNote({
        content: 'This is a long note with many words that should be truncated in the fallback summary.',
      });

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockRejectedValue(new Error('AI service unavailable'));

      const result = await server.executeTool('summarizeNote', {
        noteId: 'note-123',
        userId: 'user-123',
        maxLength: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data?.summary).toBeDefined();
      expect(result.data?.keyPoints).toEqual([]);
    });

    it('should handle non-existent note', async () => {
      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: false,
        error: 'Note not found',
      });

      const result = await server.executeTool('summarizeNote', {
        noteId: 'non-existent',
        userId: 'user-123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should respect maxLength parameter', async () => {
      const mockNote = createMockNote();

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockResolvedValue({
        content: JSON.stringify({
          summary: 'Short summary',
          keyPoints: ['Point 1'],
        }),
        model: 'gemini-pro',
      });

      await server.executeTool('summarizeNote', {
        noteId: 'note-123',
        userId: 'user-123',
        maxLength: 200,
      });

      const chatCall = mockGeminiService.chat.mock.calls[0][0];
      expect(chatCall[0].content).toContain('200 words');
    });
  });

  describe('findRelatedNotes', () => {
    it('should find related notes using embeddings', async () => {
      const sourceNote = createMockNote({
        id: 'note-1',
        title: 'Machine Learning Basics',
        content: 'Introduction to neural networks and deep learning',
      });

      const relatedNotes = [
        createMockNote({
          id: 'note-2',
          title: 'Deep Learning Advanced',
          content: 'Advanced neural network architectures',
        }),
        createMockNote({
          id: 'note-3',
          title: 'Cooking Recipes',
          content: 'How to make pasta',
        }),
      ];

      (notesMCPServer.executeTool as any)
        .mockResolvedValueOnce({
          success: true,
          data: { note: sourceNote },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { notes: relatedNotes },
        });

      // Mock embeddings with high similarity for note-2, low for note-3
      mockGeminiService.embed
        .mockResolvedValueOnce(new Array(768).fill(0.5)) // source
        .mockResolvedValueOnce(new Array(768).fill(0.48)) // note-2 (similar)
        .mockResolvedValueOnce(new Array(768).fill(0.1)); // note-3 (different)

      const result = await server.executeTool('findRelatedNotes', {
        noteId: 'note-1',
        userId: 'user-123',
        limitCount: 5,
      });

      expect(result.success).toBe(true);
      expect(result.data?.relatedNotes).toBeDefined();
      expect(result.data?.relatedNotes[0].similarity).toBeGreaterThan(
        result.data?.relatedNotes[1].similarity
      );
    });

    it('should fallback to tag-based similarity on AI error', async () => {
      const sourceNote = createMockNote({
        id: 'note-1',
        tags: ['ml', 'ai'],
      });

      const relatedNotes = [
        createMockNote({
          id: 'note-2',
          tags: ['ml', 'python'],
        }),
        createMockNote({
          id: 'note-3',
          tags: ['cooking'],
        }),
      ];

      (notesMCPServer.executeTool as any)
        .mockResolvedValueOnce({
          success: true,
          data: { note: sourceNote },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { notes: relatedNotes },
        });

      mockGeminiService.embed.mockRejectedValue(new Error('AI unavailable'));

      const result = await server.executeTool('findRelatedNotes', {
        noteId: 'note-1',
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.relatedNotes).toHaveLength(1);
      expect(result.data?.relatedNotes[0].noteId).toBe('note-2');
      expect(result.data?.relatedNotes[0].reason).toContain('tags');
    });

    it('should return empty array when no related notes found', async () => {
      const sourceNote = createMockNote();

      (notesMCPServer.executeTool as any)
        .mockResolvedValueOnce({
          success: true,
          data: { note: sourceNote },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { notes: [] },
        });

      const result = await server.executeTool('findRelatedNotes', {
        noteId: 'note-1',
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.relatedNotes).toHaveLength(0);
    });

    it('should exclude source note from results', async () => {
      const sourceNote = createMockNote({ id: 'note-1' });
      const allNotes = [
        sourceNote,
        createMockNote({ id: 'note-2' }),
      ];

      (notesMCPServer.executeTool as any)
        .mockResolvedValueOnce({
          success: true,
          data: { note: sourceNote },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { notes: allNotes },
        });

      mockGeminiService.embed.mockResolvedValue(new Array(768).fill(0.5));

      const result = await server.executeTool('findRelatedNotes', {
        noteId: 'note-1',
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.relatedNotes.every((n: any) => n.noteId !== 'note-1')).toBe(true);
    });
  });

  describe('generateNoteTags', () => {
    it('should generate relevant tags', async () => {
      const mockNote = createMockNote({
        title: 'Python Machine Learning Tutorial',
        content: 'Learn how to build neural networks with TensorFlow and Keras',
      });

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockResolvedValue({
        content: JSON.stringify(['python', 'machine-learning', 'tensorflow', 'neural-networks']),
        model: 'gemini-pro',
      });

      const result = await server.executeTool('generateNoteTags', {
        noteId: 'note-123',
        userId: 'user-123',
        maxTags: 5,
      });

      expect(result.success).toBe(true);
      expect(result.data?.tags).toHaveLength(4);
      expect(result.data?.tags).toContain('python');
      expect(result.data?.tags).toContain('machine-learning');
    });

    it('should fallback to keyword extraction on AI error', async () => {
      const mockNote = createMockNote({
        title: 'Important Meeting Notes',
        content: 'Discussion about project timeline and deliverables',
      });

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockRejectedValue(new Error('AI unavailable'));

      const result = await server.executeTool('generateNoteTags', {
        noteId: 'note-123',
        userId: 'user-123',
        maxTags: 3,
      });

      expect(result.success).toBe(true);
      expect(result.data?.tags).toBeDefined();
      expect(result.data?.tags.length).toBeLessThanOrEqual(3);
    });

    it('should respect maxTags parameter', async () => {
      const mockNote = createMockNote();

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockResolvedValue({
        content: JSON.stringify(['tag1', 'tag2']),
        model: 'gemini-pro',
      });

      await server.executeTool('generateNoteTags', {
        noteId: 'note-123',
        userId: 'user-123',
        maxTags: 3,
      });

      const chatCall = mockGeminiService.chat.mock.calls[0][0];
      expect(chatCall[0].content).toContain('3 relevant tags');
    });
  });

  describe('enhanceNoteContent', () => {
    it('should enhance note content with suggestions', async () => {
      const mockNote = createMockNote({
        content: 'This is a note with some grammer mistakes and unclear sentances.',
      });

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockResolvedValue({
        content: JSON.stringify({
          enhancedContent: 'This is a note with some grammar mistakes and unclear sentences.',
          suggestions: [
            {
              type: 'grammar',
              original: 'grammer',
              suggestion: 'grammar',
              reason: 'Spelling correction',
            },
            {
              type: 'grammar',
              original: 'sentances',
              suggestion: 'sentences',
              reason: 'Spelling correction',
            },
          ],
        }),
        model: 'gemini-pro',
      });

      const result = await server.executeTool('enhanceNoteContent', {
        noteId: 'note-123',
        userId: 'user-123',
        enhancementType: 'grammar',
      });

      expect(result.success).toBe(true);
      expect(result.data?.enhancedContent).toBeDefined();
      expect(result.data?.suggestions).toHaveLength(2);
      expect(result.data?.suggestions[0].type).toBe('grammar');
    });

    it('should handle different enhancement types', async () => {
      const mockNote = createMockNote();

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockResolvedValue({
        content: JSON.stringify({
          enhancedContent: 'Enhanced content',
          suggestions: [],
        }),
        model: 'gemini-pro',
      });

      await server.executeTool('enhanceNoteContent', {
        noteId: 'note-123',
        userId: 'user-123',
        enhancementType: 'clarity',
      });

      const chatCall = mockGeminiService.chat.mock.calls[0][0];
      expect(chatCall[0].content).toContain('clarity');
    });

    it('should return original content on AI error', async () => {
      const mockNote = createMockNote({
        content: 'Original content',
      });

      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { note: mockNote },
      });

      mockGeminiService.chat.mockRejectedValue(new Error('AI unavailable'));

      const result = await server.executeTool('enhanceNoteContent', {
        noteId: 'note-123',
        userId: 'user-123',
      });

      expect(result.success).toBe(true);
      expect(result.data?.enhancedContent).toBe('Original content');
      expect(result.data?.suggestions).toHaveLength(0);
    });
  });

  describe('transcribeAudioToNote', () => {
    it('should create placeholder note for audio transcription', async () => {
      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { id: 'new-note-123' },
      });

      const result = await server.executeTool('transcribeAudioToNote', {
        userId: 'user-123',
        audioUrl: 'https://example.com/audio.mp3',
        title: 'Voice Note',
      });

      expect(result.success).toBe(true);
      expect(result.data?.noteId).toBe('new-note-123');
      expect(result.data?.transcription).toContain('placeholder');
      expect(notesMCPServer.executeTool).toHaveBeenCalledWith(
        'createNote',
        expect.objectContaining({
          title: 'Voice Note',
          tags: expect.arrayContaining(['voice', 'transcription']),
        })
      );
    });

    it('should use default title if not provided', async () => {
      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: true,
        data: { id: 'new-note-123' },
      });

      await server.executeTool('transcribeAudioToNote', {
        userId: 'user-123',
        audioUrl: 'https://example.com/audio.mp3',
      });

      expect(notesMCPServer.executeTool).toHaveBeenCalledWith(
        'createNote',
        expect.objectContaining({
          title: 'Voice Note',
        })
      );
    });

    it('should handle note creation failure', async () => {
      (notesMCPServer.executeTool as any).mockResolvedValue({
        success: false,
        error: 'Failed to create note',
      });

      const result = await server.executeTool('transcribeAudioToNote', {
        userId: 'user-123',
        audioUrl: 'https://example.com/audio.mp3',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create note');
    });
  });

  describe('Tool validation', () => {
    it('should have all required AI tools defined', () => {
      const tools = server.getTools();
      const toolNames = tools.map(t => t.name);

      expect(toolNames).toContain('summarizeNote');
      expect(toolNames).toContain('findRelatedNotes');
      expect(toolNames).toContain('generateNoteTags');
      expect(toolNames).toContain('enhanceNoteContent');
      expect(toolNames).toContain('transcribeAudioToNote');
    });

    it('should have proper tool schemas', () => {
      const tools = server.getTools();
      const summarizeTool = tools.find(t => t.name === 'summarizeNote');

      expect(summarizeTool).toBeDefined();
      expect(summarizeTool?.inputSchema).toBeDefined();
      expect(summarizeTool?.outputSchema).toBeDefined();
      expect(summarizeTool?.inputSchema.required).toContain('noteId');
      expect(summarizeTool?.inputSchema.required).toContain('userId');
    });
  });

  describe('Server lifecycle', () => {
    it('should initialize successfully', async () => {
      await server.initialize();
      expect(true).toBe(true);
    });

    it('should shutdown successfully', async () => {
      await server.shutdown();
      expect(true).toBe(true);
    });
  });

  describe('Cosine similarity calculation', () => {
    it('should calculate similarity correctly', () => {
      // Access private method through type assertion for testing
      const serverAny = server as any;
      
      const vec1 = [1, 0, 0];
      const vec2 = [1, 0, 0];
      const similarity = serverAny.cosineSimilarity(vec1, vec2);
      
      expect(similarity).toBeCloseTo(1.0, 2);
    });

    it('should return 0 for orthogonal vectors', () => {
      const serverAny = server as any;
      
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      const similarity = serverAny.cosineSimilarity(vec1, vec2);
      
      expect(similarity).toBeCloseTo(0.0, 2);
    });

    it('should handle different length vectors', () => {
      const serverAny = server as any;
      
      const vec1 = [1, 0];
      const vec2 = [1, 0, 0];
      const similarity = serverAny.cosineSimilarity(vec1, vec2);
      
      expect(similarity).toBe(0);
    });
  });
});
