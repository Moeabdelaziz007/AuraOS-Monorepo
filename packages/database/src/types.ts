/**
 * Database Type Definitions
 * Shared types for database entities
 */

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  color: string;
  created_at: Date;
  updated_at: Date;
  metadata: Record<string, any>;
}

export interface CreateNoteInput {
  user_id: string;
  title: string;
  content: string;
  tags?: string[];
  is_pinned?: boolean;
  color?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  is_pinned?: boolean;
  is_archived?: boolean;
  color?: string;
  metadata?: Record<string, any>;
}

export interface SearchNotesOptions {
  user_id: string;
  query: string;
  limit?: number;
  offset?: number;
  include_archived?: boolean;
}

export interface SearchResult {
  note: Note;
  rank: number;
  headline: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface GetNotesOptions extends PaginationOptions {
  user_id: string;
  include_archived?: boolean;
  pinned_only?: boolean;
  tags?: string[];
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DatabaseError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}
