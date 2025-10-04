/**
 * Notes Repository Tests
 * Comprehensive unit tests for all CRUD operations
 */

import { NotesRepository } from '../src/notes-repository';
import { db } from '../src/db';
import {
  CreateNoteInput,
  UpdateNoteInput,
  Note,
  NotFoundError,
  ValidationError,
  DatabaseError,
} from '../src/types';

jest.mock('../src/db');

describe('NotesRepository', () => {
  let repository: NotesRepository;
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockNoteId = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    repository = new NotesRepository();
    jest.clearAllMocks();
  });

  describe('createNote', () => {
    const validInput: CreateNoteInput = {
      user_id: mockUserId,
      title: 'Test Note',
      content: 'Test content',
      tags: ['test', 'example'],
      is_pinned: false,
      color: 'blue',
    };

    it('should create a note successfully', async () => {
      const mockNote: Note = {
        id: mockNoteId,
        ...validInput,
        tags: validInput.tags!,
        is_pinned: false,
        is_archived: false,
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      };

      (db.query as jest.Mock).mockResolvedValue({ rows: [mockNote] });

      const result = await repository.createNote(validInput);

      expect(result).toEqual(mockNote);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO notes'),
        expect.arrayContaining([
          validInput.user_id,
          validInput.title,
          validInput.content,
          validInput.tags,
          validInput.is_pinned,
          validInput.color,
          expect.any(String),
        ])
      );
    });

    it('should throw ValidationError when user_id is missing', async () => {
      const invalidInput = { ...validInput, user_id: '' };

      await expect(repository.createNote(invalidInput)).rejects.toThrow(ValidationError);
      await expect(repository.createNote(invalidInput)).rejects.toThrow('user_id is required');
    });

    it('should throw ValidationError when title is empty', async () => {
      const invalidInput = { ...validInput, title: '' };

      await expect(repository.createNote(invalidInput)).rejects.toThrow(ValidationError);
      await expect(repository.createNote(invalidInput)).rejects.toThrow('title is required');
    });

    it('should throw ValidationError when title exceeds 500 characters', async () => {
      const invalidInput = { ...validInput, title: 'a'.repeat(501) };

      await expect(repository.createNote(invalidInput)).rejects.toThrow(ValidationError);
      await expect(repository.createNote(invalidInput)).rejects.toThrow('cannot exceed 500 characters');
    });

    it('should throw ValidationError when content is empty', async () => {
      const invalidInput = { ...validInput, content: '' };

      await expect(repository.createNote(invalidInput)).rejects.toThrow(ValidationError);
      await expect(repository.createNote(invalidInput)).rejects.toThrow('content is required');
    });

    it('should handle database errors', async () => {
      (db.query as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await expect(repository.createNote(validInput)).rejects.toThrow(DatabaseError);
    });

    it('should handle foreign key constraint violation', async () => {
      const error = { code: '23503', message: 'Foreign key violation' };
      (db.query as jest.Mock).mockRejectedValue(error);

      await expect(repository.createNote(validInput)).rejects.toThrow(ValidationError);
      await expect(repository.createNote(validInput)).rejects.toThrow('Invalid user_id');
    });

    it('should use default values when optional fields are not provided', async () => {
      const minimalInput: CreateNoteInput = {
        user_id: mockUserId,
        title: 'Test',
        content: 'Content',
      };

      const mockNote: Note = {
        id: mockNoteId,
        user_id: minimalInput.user_id,
        title: minimalInput.title,
        content: minimalInput.content,
        tags: [],
        is_pinned: false,
        is_archived: false,
        color: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      };

      (db.query as jest.Mock).mockResolvedValue({ rows: [mockNote] });

      const result = await repository.createNote(minimalInput);

      expect(result.tags).toEqual([]);
      expect(result.is_pinned).toBe(false);
      expect(result.color).toBe('default');
    });
  });

  describe('getNoteById', () => {
    it('should retrieve a note by id', async () => {
      const mockNote: Note = {
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

      (db.query as jest.Mock).mockResolvedValue({ rows: [mockNote] });

      const result = await repository.getNoteById(mockNoteId, mockUserId);

      expect(result).toEqual(mockNote);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM notes'),
        [mockNoteId, mockUserId]
      );
    });

    it('should throw NotFoundError when note does not exist', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      await expect(repository.getNoteById(mockNoteId, mockUserId)).rejects.toThrow(NotFoundError);
      await expect(repository.getNoteById(mockNoteId, mockUserId)).rejects.toThrow(`Note with id ${mockNoteId} not found`);
    });

    it('should throw ValidationError for invalid UUID', async () => {
      await expect(repository.getNoteById('invalid-uuid', mockUserId)).rejects.toThrow(ValidationError);
      await expect(repository.getNoteById('invalid-uuid', mockUserId)).rejects.toThrow('Invalid note id');
    });

    it('should handle database errors', async () => {
      (db.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(repository.getNoteById(mockNoteId, mockUserId)).rejects.toThrow(DatabaseError);
    });
  });

  describe('getAllNotes', () => {
    const mockNotes: Note[] = [
      {
        id: mockNoteId,
        user_id: mockUserId,
        title: 'Note 1',
        content: 'Content 1',
        tags: ['tag1'],
        is_pinned: true,
        is_archived: false,
        color: 'blue',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        user_id: mockUserId,
        title: 'Note 2',
        content: 'Content 2',
        tags: ['tag2'],
        is_pinned: false,
        is_archived: false,
        color: 'red',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      },
    ];

    it('should retrieve all notes for a user', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: mockNotes });

      const result = await repository.getAllNotes({ user_id: mockUserId });

      expect(result).toEqual(mockNotes);
      expect(result).toHaveLength(2);
    });

    it('should exclude archived notes by default', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: mockNotes });

      await repository.getAllNotes({ user_id: mockUserId });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('is_archived = false'),
        expect.any(Array)
      );
    });

    it('should include archived notes when specified', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: mockNotes });

      await repository.getAllNotes({ user_id: mockUserId, include_archived: true });

      expect(db.query).toHaveBeenCalledWith(
        expect.not.stringContaining('is_archived = false'),
        expect.any(Array)
      );
    });

    it('should filter by pinned_only', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockNotes[0]] });

      await repository.getAllNotes({ user_id: mockUserId, pinned_only: true });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('is_pinned = true'),
        expect.any(Array)
      );
    });

    it('should filter by tags', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockNotes[0]] });

      await repository.getAllNotes({ user_id: mockUserId, tags: ['tag1'] });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('tags &&'),
        expect.arrayContaining([mockUserId, ['tag1'], expect.any(Number), expect.any(Number)])
      );
    });

    it('should apply pagination', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: mockNotes });

      await repository.getAllNotes({ user_id: mockUserId, limit: 10, offset: 20 });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.arrayContaining([mockUserId, 10, 20])
      );
    });

    it('should use default pagination values', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: mockNotes });

      await repository.getAllNotes({ user_id: mockUserId });

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([mockUserId, 50, 0])
      );
    });

    it('should throw ValidationError for invalid user_id', async () => {
      await expect(repository.getAllNotes({ user_id: 'invalid' })).rejects.toThrow(ValidationError);
    });
  });

  describe('updateNote', () => {
    const updateInput: UpdateNoteInput = {
      title: 'Updated Title',
      content: 'Updated content',
      is_pinned: true,
    };

    it('should update a note successfully', async () => {
      const updatedNote: Note = {
        id: mockNoteId,
        user_id: mockUserId,
        title: updateInput.title!,
        content: updateInput.content!,
        tags: [],
        is_pinned: updateInput.is_pinned!,
        is_archived: false,
        color: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      };

      (db.query as jest.Mock).mockResolvedValue({ rows: [updatedNote] });

      const result = await repository.updateNote(mockNoteId, mockUserId, updateInput);

      expect(result).toEqual(updatedNote);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE notes'),
        expect.arrayContaining([
          updateInput.title,
          updateInput.content,
          updateInput.is_pinned,
          mockNoteId,
          mockUserId,
        ])
      );
    });

    it('should throw NotFoundError when note does not exist', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      await expect(repository.updateNote(mockNoteId, mockUserId, updateInput)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError when no fields to update', async () => {
      await expect(repository.updateNote(mockNoteId, mockUserId, {})).rejects.toThrow(ValidationError);
      await expect(repository.updateNote(mockNoteId, mockUserId, {})).rejects.toThrow('No fields to update');
    });

    it('should throw ValidationError for empty title', async () => {
      await expect(
        repository.updateNote(mockNoteId, mockUserId, { title: '' })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for title exceeding 500 characters', async () => {
      await expect(
        repository.updateNote(mockNoteId, mockUserId, { title: 'a'.repeat(501) })
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for empty content', async () => {
      await expect(
        repository.updateNote(mockNoteId, mockUserId, { content: '' })
      ).rejects.toThrow(ValidationError);
    });

    it('should update only specified fields', async () => {
      const partialUpdate = { is_pinned: true };
      const updatedNote: Note = {
        id: mockNoteId,
        user_id: mockUserId,
        title: 'Original Title',
        content: 'Original content',
        tags: [],
        is_pinned: true,
        is_archived: false,
        color: 'default',
        created_at: new Date(),
        updated_at: new Date(),
        metadata: {},
      };

      (db.query as jest.Mock).mockResolvedValue({ rows: [updatedNote] });

      await repository.updateNote(mockNoteId, mockUserId, partialUpdate);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('is_pinned = $1'),
        expect.arrayContaining([true, mockNoteId, mockUserId])
      );
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ id: mockNoteId }] });

      await expect(repository.deleteNote(mockNoteId, mockUserId)).resolves.not.toThrow();

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM notes'),
        [mockNoteId, mockUserId]
      );
    });

    it('should throw NotFoundError when note does not exist', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      await expect(repository.deleteNote(mockNoteId, mockUserId)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid UUID', async () => {
      await expect(repository.deleteNote('invalid', mockUserId)).rejects.toThrow(ValidationError);
    });
  });

  describe('searchNotes', () => {
    it('should search notes successfully', async () => {
      const mockResults = [
        {
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
          rank: 0.5,
          headline: 'Test content with <b>search term</b>',
        },
      ];

      (db.query as jest.Mock).mockResolvedValue({ rows: mockResults });

      const result = await repository.searchNotes({
        user_id: mockUserId,
        query: 'search term',
      });

      expect(result).toHaveLength(1);
      expect(result[0].note.id).toBe(mockNoteId);
      expect(result[0].rank).toBe(0.5);
      expect(result[0].headline).toContain('search term');
    });

    it('should throw ValidationError for empty query', async () => {
      await expect(
        repository.searchNotes({ user_id: mockUserId, query: '' })
      ).rejects.toThrow(ValidationError);
      await expect(
        repository.searchNotes({ user_id: mockUserId, query: '   ' })
      ).rejects.toThrow(ValidationError);
    });

    it('should format search query correctly', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      await repository.searchNotes({
        user_id: mockUserId,
        query: 'hello world test',
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([mockUserId, 'hello & world & test', 20, 0])
      );
    });

    it('should apply pagination to search results', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      await repository.searchNotes({
        user_id: mockUserId,
        query: 'test',
        limit: 10,
        offset: 5,
      });

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([mockUserId, 'test', 10, 5])
      );
    });
  });

  describe('getNotesCount', () => {
    it('should return notes count', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ count: '42' }] });

      const result = await repository.getNotesCount(mockUserId);

      expect(result).toBe(42);
    });

    it('should exclude archived notes by default', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ count: '10' }] });

      await repository.getNotesCount(mockUserId);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('is_archived = false'),
        [mockUserId]
      );
    });

    it('should include archived notes when specified', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ count: '15' }] });

      await repository.getNotesCount(mockUserId, true);

      expect(db.query).toHaveBeenCalledWith(
        expect.not.stringContaining('is_archived = false'),
        [mockUserId]
      );
    });
  });

  describe('bulkDeleteNotes', () => {
    const noteIds = [mockNoteId, '123e4567-e89b-12d3-a456-426614174002'];

    it('should delete multiple notes', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rowCount: 2 });

      const result = await repository.bulkDeleteNotes(noteIds, mockUserId);

      expect(result).toBe(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM notes'),
        [noteIds, mockUserId]
      );
    });

    it('should return 0 for empty array', async () => {
      const result = await repository.bulkDeleteNotes([], mockUserId);

      expect(result).toBe(0);
      expect(db.query).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid UUIDs', async () => {
      await expect(
        repository.bulkDeleteNotes(['invalid-uuid'], mockUserId)
      ).rejects.toThrow(ValidationError);
    });
  });
});
