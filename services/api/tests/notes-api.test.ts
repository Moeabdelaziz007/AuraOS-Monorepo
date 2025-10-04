/**
 * Notes API Integration Tests
 * Comprehensive tests for all notes endpoints
 */

import request from 'supertest';
import app from '../src/index';
import { notesRepository } from '@auraos/database';
import { noteProcessingQueue } from '@auraos/workers';

// Mock dependencies
jest.mock('@auraos/database');
jest.mock('@auraos/workers');

describe('Notes API Integration Tests', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockNoteId = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock queue methods
    (noteProcessingQueue.addJob as jest.Mock) = jest.fn().mockResolvedValue({});
    (noteProcessingQueue.getStats as jest.Mock) = jest.fn().mockResolvedValue({
      waiting: 0,
      active: 0,
      completed: 10,
      failed: 0,
      delayed: 0,
    });
  });

  describe('POST /api/notes', () => {
    it('should create a note successfully', async () => {
      const mockNote = {
        id: mockNoteId,
        user_id: mockUserId,
        title: 'Test Note',
        content: 'Test content',
        tags: ['test'],
        is_pinned: false,
        is_archived: false,
        color: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      };

      (notesRepository.createNote as jest.Mock).mockResolvedValue(mockNote);

      const response = await request(app)
        .post('/api/notes')
        .set('x-user-id', mockUserId)
        .send({
          title: 'Test Note',
          content: 'Test content',
          tags: ['test'],
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe(201);
      expect(response.body.message).toBe('Note created successfully');
      expect(response.body.data).toEqual(mockNote);
      expect(notesRepository.createNote).toHaveBeenCalledWith({
        user_id: mockUserId,
        title: 'Test Note',
        content: 'Test content',
        tags: ['test'],
        is_pinned: false,
        color: 'default',
        metadata: {},
      });
      expect(noteProcessingQueue.addJob).toHaveBeenCalled();
    });

    it('should return 401 without user ID', async () => {
      const response = await request(app)
        .post('/api/notes')
        .send({
          title: 'Test Note',
          content: 'Test content',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('x-user-id', mockUserId)
        .send({
          title: '',
          content: 'Test content',
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('x-user-id', mockUserId)
        .send({
          content: 'Test content',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for title exceeding 500 characters', async () => {
      const response = await request(app)
        .post('/api/notes')
        .set('x-user-id', mockUserId)
        .send({
          title: 'a'.repeat(501),
          content: 'Test content',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/notes/:id', () => {
    it('should get a note by ID', async () => {
      const mockNote = {
        id: mockNoteId,
        user_id: mockUserId,
        title: 'Test Note',
        content: 'Test content',
        tags: [],
        is_pinned: false,
        is_archived: false,
        color: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      };

      (notesRepository.getNoteById as jest.Mock).mockResolvedValue(mockNote);

      const response = await request(app)
        .get(`/api/notes/${mockNoteId}`)
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockNote);
      expect(notesRepository.getNoteById).toHaveBeenCalledWith(mockNoteId, mockUserId);
    });

    it('should return 404 for non-existent note', async () => {
      const NotFoundError = require('@auraos/database').NotFoundError;
      (notesRepository.getNoteById as jest.Mock).mockRejectedValue(
        new NotFoundError('Note', mockNoteId)
      );

      const response = await request(app)
        .get(`/api/notes/${mockNoteId}`)
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const response = await request(app)
        .get('/api/notes/invalid-uuid')
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/notes', () => {
    it('should get all notes for a user', async () => {
      const mockNotes = [
        {
          id: mockNoteId,
          user_id: mockUserId,
          title: 'Note 1',
          content: 'Content 1',
          tags: [],
          is_pinned: false,
          is_archived: false,
          color: 'default',
          created_at: new Date(),
          updated_at: new Date(),
          metadata: {},
        },
      ];

      (notesRepository.getAllNotes as jest.Mock).mockResolvedValue(mockNotes);
      (notesRepository.getNotesCount as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/notes')
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockNotes);
      expect(response.body.pagination).toEqual({
        total: 1,
        limit: 50,
        offset: 0,
        has_more: false,
      });
    });

    it('should support pagination', async () => {
      (notesRepository.getAllNotes as jest.Mock).mockResolvedValue([]);
      (notesRepository.getNotesCount as jest.Mock).mockResolvedValue(100);

      const response = await request(app)
        .get('/api/notes?limit=10&offset=20')
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.offset).toBe(20);
    });

    it('should filter by pinned_only', async () => {
      (notesRepository.getAllNotes as jest.Mock).mockResolvedValue([]);
      (notesRepository.getNotesCount as jest.Mock).mockResolvedValue(0);

      await request(app)
        .get('/api/notes?pinned_only=true')
        .set('x-user-id', mockUserId);

      expect(notesRepository.getAllNotes).toHaveBeenCalledWith(
        expect.objectContaining({ pinned_only: true })
      );
    });

    it('should filter by tags', async () => {
      (notesRepository.getAllNotes as jest.Mock).mockResolvedValue([]);
      (notesRepository.getNotesCount as jest.Mock).mockResolvedValue(0);

      await request(app)
        .get('/api/notes?tags=work,important')
        .set('x-user-id', mockUserId);

      expect(notesRepository.getAllNotes).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ['work', 'important'] })
      );
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', async () => {
      const updatedNote = {
        id: mockNoteId,
        user_id: mockUserId,
        title: 'Updated Title',
        content: 'Updated content',
        tags: [],
        is_pinned: true,
        is_archived: false,
        color: 'blue',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      };

      (notesRepository.updateNote as jest.Mock).mockResolvedValue(updatedNote);

      const response = await request(app)
        .put(`/api/notes/${mockNoteId}`)
        .set('x-user-id', mockUserId)
        .send({
          title: 'Updated Title',
          is_pinned: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(updatedNote);
      expect(notesRepository.updateNote).toHaveBeenCalledWith(
        mockNoteId,
        mockUserId,
        { title: 'Updated Title', is_pinned: true }
      );
    });

    it('should return 400 for empty update', async () => {
      const response = await request(app)
        .put(`/api/notes/${mockNoteId}`)
        .set('x-user-id', mockUserId)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', async () => {
      (notesRepository.deleteNote as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/notes/${mockNoteId}`)
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Note deleted successfully');
      expect(notesRepository.deleteNote).toHaveBeenCalledWith(mockNoteId, mockUserId);
    });
  });

  describe('GET /api/notes/search', () => {
    it('should search notes', async () => {
      const mockResults = [
        {
          note: {
            id: mockNoteId,
            user_id: mockUserId,
            title: 'Test Note',
            content: 'Test content with search term',
            tags: [],
            is_pinned: false,
            is_archived: false,
            color: 'default',
            created_at: new Date(),
            updated_at: new Date(),
            metadata: {},
          },
          rank: 0.5,
          headline: 'Test content with <b>search term</b>',
        },
      ];

      (notesRepository.searchNotes as jest.Mock).mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/notes/search?q=search+term')
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockResults);
      expect(notesRepository.searchNotes).toHaveBeenCalledWith({
        user_id: mockUserId,
        query: 'search term',
        limit: 20,
        offset: 0,
        include_archived: false,
      });
    });

    it('should return 400 for empty search query', async () => {
      const response = await request(app)
        .get('/api/notes/search?q=')
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/notes/bulk-delete', () => {
    it('should bulk delete notes', async () => {
      const noteIds = [mockNoteId, '123e4567-e89b-12d3-a456-426614174002'];
      (notesRepository.bulkDeleteNotes as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .post('/api/notes/bulk-delete')
        .set('x-user-id', mockUserId)
        .send({ ids: noteIds });

      expect(response.status).toBe(200);
      expect(response.body.data.deleted_count).toBe(2);
      expect(notesRepository.bulkDeleteNotes).toHaveBeenCalledWith(noteIds, mockUserId);
    });

    it('should return 400 for empty array', async () => {
      const response = await request(app)
        .post('/api/notes/bulk-delete')
        .set('x-user-id', mockUserId)
        .send({ ids: [] });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid UUIDs', async () => {
      const response = await request(app)
        .post('/api/notes/bulk-delete')
        .set('x-user-id', mockUserId)
        .send({ ids: ['invalid-uuid'] });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/notes/stats', () => {
    it('should get notes statistics', async () => {
      (notesRepository.getNotesCount as jest.Mock)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(45);

      const response = await request(app)
        .get('/api/notes/stats')
        .set('x-user-id', mockUserId);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        total: 50,
        active: 45,
        archived: 5,
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const { db } = require('@auraos/database');
      (db.healthCheck as jest.Mock) = jest.fn().mockResolvedValue(true);

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.services.database).toBe('up');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('ROUTE_NOT_FOUND');
    });
  });
});
