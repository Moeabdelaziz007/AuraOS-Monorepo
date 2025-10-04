/**
 * Notes Client
 * Client-side wrapper for Notes REST API
 * Connects to the production-ready backend (Sprint 2)
 */

import type { Note, Folder, NoteSummary, RelatedNote, NoteEnhancement } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export class NotesClient {
  private userId: string;
  private baseUrl: string;

  constructor(userId: string, baseUrl: string = API_BASE_URL) {
    this.userId = userId;
    this.baseUrl = baseUrl;
  }

  /**
   * Make authenticated API request
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-user-id': this.userId,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> | ApiError = await response.json();

      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return (data as ApiResponse<T>).data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  /**
   * Create a new note
   * POST /api/notes
   */
  async createNote(data: {
    title: string;
    content: string;
    folderId?: string;
    tags?: string[];
    color?: string;
    is_pinned?: boolean;
  }): Promise<Note> {
    const note = await this.request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        color: data.color || 'default',
        is_pinned: data.is_pinned || false,
      }),
    });

    return this.mapNoteFromApi(note);
  }

  /**
   * Get a note by ID
   * GET /api/notes/:id
   */
  async getNote(noteId: string): Promise<Note | null> {
    try {
      const note = await this.request<Note>(`/notes/${noteId}`);
      return this.mapNoteFromApi(note);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update a note
   * PUT /api/notes/:id
   */
  async updateNote(
    noteId: string,
    updates: {
      title?: string;
      content?: string;
      folderId?: string;
      tags?: string[];
      isPinned?: boolean;
      isArchived?: boolean;
      color?: string;
    }
  ): Promise<Note> {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
    if (updates.isArchived !== undefined) updateData.is_archived = updates.isArchived;
    if (updates.color !== undefined) updateData.color = updates.color;

    const note = await this.request<Note>(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return this.mapNoteFromApi(note);
  }

  /**
   * Delete a note
   * DELETE /api/notes/:id
   */
  async deleteNote(noteId: string): Promise<void> {
    await this.request(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }

  /**
   * List notes with filters
   * GET /api/notes
   */
  async listNotes(filters?: {
    folderId?: string;
    tags?: string[];
    isPinned?: boolean;
    isArchived?: boolean;
    limitCount?: number;
    offset?: number;
  }): Promise<Note[]> {
    const params = new URLSearchParams();
    
    if (filters?.limitCount) params.append('limit', filters.limitCount.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    if (filters?.isPinned !== undefined) params.append('pinned_only', filters.isPinned.toString());
    if (filters?.isArchived !== undefined) params.append('include_archived', filters.isArchived.toString());
    if (filters?.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));

    const queryString = params.toString();
    const endpoint = queryString ? `/notes?${queryString}` : '/notes';
    
    const notes = await this.request<Note[]>(endpoint);
    return notes.map(note => this.mapNoteFromApi(note));
  }

  /**
   * Search notes using full-text search
   * GET /api/notes/search
   */
  async searchNotes(query: string, options?: {
    limit?: number;
    offset?: number;
    includeArchived?: boolean;
  }): Promise<Array<{ note: Note; rank: number; headline: string }>> {
    const params = new URLSearchParams();
    params.append('q', query);
    
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.offset) params.append('offset', options.offset.toString());
    if (options?.includeArchived) params.append('include_archived', 'true');

    const results = await this.request<Array<{ note: any; rank: number; headline: string }>>(
      `/notes/search?${params.toString()}`
    );

    return results.map(result => ({
      ...result,
      note: this.mapNoteFromApi(result.note),
    }));
  }

  /**
   * Get notes statistics
   * GET /api/notes/stats
   */
  async getNotesStats(): Promise<{ total: number; active: number; archived: number }> {
    return await this.request('/notes/stats');
  }

  /**
   * Bulk delete notes
   * POST /api/notes/bulk-delete
   */
  async bulkDeleteNotes(noteIds: string[]): Promise<number> {
    const result = await this.request<{ deleted_count: number }>('/notes/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: noteIds }),
    });
    return result.deleted_count;
  }

  // Folder operations (to be implemented in backend later)
  async createFolder(data: {
    name: string;
    parentId?: string;
    color?: string;
  }): Promise<{ id: string; folder: Folder }> {
    // TODO: Implement folders API endpoint
    throw new Error('Folders API not yet implemented');
  }

  async listFolders(parentId?: string): Promise<Folder[]> {
    // TODO: Implement folders API endpoint
    return [];
  }

  // AI Features (to be implemented in Sprint 4)
  
  async summarizeNote(noteId: string, maxLength?: number): Promise<NoteSummary> {
    // TODO: Implement AI summarization endpoint
    throw new Error('AI features not yet implemented');
  }

  async findRelatedNotes(noteId: string, limitCount?: number): Promise<RelatedNote[]> {
    // TODO: Implement AI related notes endpoint
    throw new Error('AI features not yet implemented');
  }

  async generateNoteTags(noteId: string, maxTags?: number): Promise<string[]> {
    // TODO: Implement AI tag generation endpoint
    throw new Error('AI features not yet implemented');
  }

  async enhanceNoteContent(
    noteId: string,
    enhancementType?: 'grammar' | 'clarity' | 'structure' | 'all'
  ): Promise<NoteEnhancement> {
    // TODO: Implement AI content enhancement endpoint
    throw new Error('AI features not yet implemented');
  }

  async transcribeAudioToNote(data: {
    audioUrl: string;
    title?: string;
    folderId?: string;
  }): Promise<{ noteId: string; transcription: string }> {
    // TODO: Implement AI transcription endpoint
    throw new Error('AI features not yet implemented');
  }

  /**
   * Map API note format to frontend Note type
   */
  private mapNoteFromApi(apiNote: any): Note {
    return {
      id: apiNote.id,
      title: apiNote.title,
      content: apiNote.content,
      userId: apiNote.user_id,
      folderId: undefined, // Folders not yet implemented
      tags: apiNote.tags || [],
      isPinned: apiNote.is_pinned || false,
      isArchived: apiNote.is_archived || false,
      createdAt: new Date(apiNote.created_at),
      updatedAt: new Date(apiNote.updated_at),
    };
  }
}

// Singleton instance (will be initialized with actual userId)
let notesClient: NotesClient | null = null;

export const initNotesClient = (userId: string): NotesClient => {
  notesClient = new NotesClient(userId);
  return notesClient;
};

export const getNotesClient = (): NotesClient => {
  if (!notesClient) {
    throw new Error('NotesClient not initialized. Call initNotesClient first.');
  }
  return notesClient;
};
