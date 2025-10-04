/**
 * Notes Repository
 * Handles all database operations for notes with proper error handling and validation
 */

import { db } from './db';
import {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  GetNotesOptions,
  SearchNotesOptions,
  SearchResult,
  NotFoundError,
  ValidationError,
  DatabaseError,
} from './types';

export class NotesRepository {
  /**
   * Create a new note
   */
  async createNote(input: CreateNoteInput): Promise<Note> {
    this.validateCreateInput(input);

    const query = `
      INSERT INTO notes (
        user_id, title, content, tags, is_pinned, color, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      input.user_id,
      input.title,
      input.content,
      input.tags || [],
      input.is_pinned || false,
      input.color || 'default',
      JSON.stringify(input.metadata || {}),
    ];

    try {
      const result = await db.query<Note>(query, values);
      
      if (result.rows.length === 0) {
        throw new DatabaseError('Failed to create note');
      }

      return this.mapNoteFromDb(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23503') {
        throw new ValidationError('Invalid user_id: user does not exist');
      }
      throw new DatabaseError(`Failed to create note: ${error.message}`, error.code);
    }
  }

  /**
   * Get a note by ID
   */
  async getNoteById(id: string, userId: string): Promise<Note> {
    this.validateUuid(id, 'note id');
    this.validateUuid(userId, 'user id');

    const query = `
      SELECT * FROM notes
      WHERE id = $1 AND user_id = $2
    `;

    try {
      const result = await db.query<Note>(query, [id, userId]);

      if (result.rows.length === 0) {
        throw new NotFoundError('Note', id);
      }

      return this.mapNoteFromDb(result.rows[0]);
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to get note: ${error.message}`, error.code);
    }
  }

  /**
   * Get all notes for a user with filtering and pagination
   */
  async getAllNotes(options: GetNotesOptions): Promise<Note[]> {
    this.validateUuid(options.user_id, 'user id');

    const conditions: string[] = ['user_id = $1'];
    const values: any[] = [options.user_id];
    let paramIndex = 2;

    if (!options.include_archived) {
      conditions.push('is_archived = false');
    }

    if (options.pinned_only) {
      conditions.push('is_pinned = true');
    }

    if (options.tags && options.tags.length > 0) {
      conditions.push(`tags && $${paramIndex}`);
      values.push(options.tags);
      paramIndex++;
    }

    const query = `
      SELECT * FROM notes
      WHERE ${conditions.join(' AND ')}
      ORDER BY is_pinned DESC, updated_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(options.limit || 50, options.offset || 0);

    try {
      const result = await db.query<Note>(query, values);
      return result.rows.map(row => this.mapNoteFromDb(row));
    } catch (error: any) {
      throw new DatabaseError(`Failed to get notes: ${error.message}`, error.code);
    }
  }

  /**
   * Update a note
   */
  async updateNote(id: string, userId: string, input: UpdateNoteInput): Promise<Note> {
    this.validateUuid(id, 'note id');
    this.validateUuid(userId, 'user id');
    this.validateUpdateInput(input);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(input.title);
    }

    if (input.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(input.content);
    }

    if (input.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(input.tags);
    }

    if (input.is_pinned !== undefined) {
      updates.push(`is_pinned = $${paramIndex++}`);
      values.push(input.is_pinned);
    }

    if (input.is_archived !== undefined) {
      updates.push(`is_archived = $${paramIndex++}`);
      values.push(input.is_archived);
    }

    if (input.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      values.push(input.color);
    }

    if (input.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(input.metadata));
    }

    if (updates.length === 0) {
      throw new ValidationError('No fields to update');
    }

    const query = `
      UPDATE notes
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    values.push(id, userId);

    try {
      const result = await db.query<Note>(query, values);

      if (result.rows.length === 0) {
        throw new NotFoundError('Note', id);
      }

      return this.mapNoteFromDb(result.rows[0]);
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update note: ${error.message}`, error.code);
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(id: string, userId: string): Promise<void> {
    this.validateUuid(id, 'note id');
    this.validateUuid(userId, 'user id');

    const query = `
      DELETE FROM notes
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    try {
      const result = await db.query(query, [id, userId]);

      if (result.rows.length === 0) {
        throw new NotFoundError('Note', id);
      }
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete note: ${error.message}`, error.code);
    }
  }

  /**
   * Search notes using full-text search
   */
  async searchNotes(options: SearchNotesOptions): Promise<SearchResult[]> {
    this.validateUuid(options.user_id, 'user id');

    if (!options.query || options.query.trim().length === 0) {
      throw new ValidationError('Search query cannot be empty');
    }

    const conditions: string[] = ['user_id = $1'];
    const values: any[] = [options.user_id];
    let paramIndex = 2;

    if (!options.include_archived) {
      conditions.push('is_archived = false');
    }

    const query = `
      SELECT 
        *,
        ts_rank(search_vector, to_tsquery('english', $${paramIndex})) as rank,
        ts_headline('english', content, to_tsquery('english', $${paramIndex}), 
          'MaxWords=50, MinWords=25, ShortWord=3, HighlightAll=false, MaxFragments=1'
        ) as headline
      FROM notes
      WHERE ${conditions.join(' AND ')}
        AND search_vector @@ to_tsquery('english', $${paramIndex})
      ORDER BY rank DESC, updated_at DESC
      LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
    `;

    const searchQuery = this.formatSearchQuery(options.query);
    values.push(searchQuery, options.limit || 20, options.offset || 0);

    try {
      const result = await db.query(query, values);
      
      return result.rows.map(row => ({
        note: this.mapNoteFromDb(row),
        rank: parseFloat(row.rank),
        headline: row.headline,
      }));
    } catch (error: any) {
      throw new DatabaseError(`Failed to search notes: ${error.message}`, error.code);
    }
  }

  /**
   * Get notes count for a user
   */
  async getNotesCount(userId: string, includeArchived: boolean = false): Promise<number> {
    this.validateUuid(userId, 'user id');

    const query = `
      SELECT COUNT(*) as count
      FROM notes
      WHERE user_id = $1 ${includeArchived ? '' : 'AND is_archived = false'}
    `;

    try {
      const result = await db.query(query, [userId]);
      return parseInt(result.rows[0].count, 10);
    } catch (error: any) {
      throw new DatabaseError(`Failed to get notes count: ${error.message}`, error.code);
    }
  }

  /**
   * Bulk delete notes
   */
  async bulkDeleteNotes(ids: string[], userId: string): Promise<number> {
    this.validateUuid(userId, 'user id');
    ids.forEach(id => this.validateUuid(id, 'note id'));

    if (ids.length === 0) {
      return 0;
    }

    const query = `
      DELETE FROM notes
      WHERE id = ANY($1) AND user_id = $2
      RETURNING id
    `;

    try {
      const result = await db.query(query, [ids, userId]);
      return result.rowCount || 0;
    } catch (error: any) {
      throw new DatabaseError(`Failed to bulk delete notes: ${error.message}`, error.code);
    }
  }

  // Private helper methods

  private validateCreateInput(input: CreateNoteInput): void {
    if (!input.user_id) {
      throw new ValidationError('user_id is required');
    }
    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError('title is required and cannot be empty');
    }
    if (input.title.length > 500) {
      throw new ValidationError('title cannot exceed 500 characters');
    }
    if (!input.content || input.content.trim().length === 0) {
      throw new ValidationError('content is required and cannot be empty');
    }
  }

  private validateUpdateInput(input: UpdateNoteInput): void {
    if (input.title !== undefined && input.title.trim().length === 0) {
      throw new ValidationError('title cannot be empty');
    }
    if (input.title !== undefined && input.title.length > 500) {
      throw new ValidationError('title cannot exceed 500 characters');
    }
    if (input.content !== undefined && input.content.trim().length === 0) {
      throw new ValidationError('content cannot be empty');
    }
  }

  private validateUuid(value: string, fieldName: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ValidationError(`Invalid ${fieldName}: must be a valid UUID`);
    }
  }

  private formatSearchQuery(query: string): string {
    return query
      .trim()
      .split(/\s+/)
      .map(term => term.replace(/[^\w]/g, ''))
      .filter(term => term.length > 0)
      .join(' & ');
  }

  private mapNoteFromDb(row: any): Note {
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      content: row.content,
      tags: row.tags || [],
      is_pinned: row.is_pinned,
      is_archived: row.is_archived,
      color: row.color,
      created_at: row.created_at,
      updated_at: row.updated_at,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata,
    };
  }
}

export const notesRepository = new NotesRepository();
