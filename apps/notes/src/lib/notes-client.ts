/**
 * Notes Client
 * Client-side wrapper for NotesMCP and NotesAIMCP servers
 */

import { notesMCPServer, notesAIMCPServer } from '@auraos/core/src/mcp';
import type { Note, Folder, NoteSummary, RelatedNote, NoteEnhancement } from '../types';

export class NotesClient {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async createNote(data: {
    title: string;
    content: string;
    folderId?: string;
    tags?: string[];
  }): Promise<{ id: string; note: Note }> {
    const result = await notesMCPServer.executeTool('createNote', {
      userId: this.userId,
      ...data,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create note');
    }

    return result.data as { id: string; note: Note };
  }

  async getNote(noteId: string): Promise<Note | null> {
    const result = await notesMCPServer.executeTool('getNote', {
      noteId,
      userId: this.userId,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to get note');
    }

    return result.data?.note || null;
  }

  async updateNote(
    noteId: string,
    updates: {
      title?: string;
      content?: string;
      folderId?: string;
      tags?: string[];
      isPinned?: boolean;
      isArchived?: boolean;
    }
  ): Promise<void> {
    const result = await notesMCPServer.executeTool('updateNote', {
      noteId,
      userId: this.userId,
      ...updates,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to update note');
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    const result = await notesMCPServer.executeTool('deleteNote', {
      noteId,
      userId: this.userId,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete note');
    }
  }

  async listNotes(filters?: {
    folderId?: string;
    tags?: string[];
    isPinned?: boolean;
    isArchived?: boolean;
    limitCount?: number;
  }): Promise<Note[]> {
    const result = await notesMCPServer.executeTool('listNotes', {
      userId: this.userId,
      ...filters,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to list notes');
    }

    return result.data?.notes || [];
  }

  async createFolder(data: {
    name: string;
    parentId?: string;
    color?: string;
  }): Promise<{ id: string; folder: Folder }> {
    const result = await notesMCPServer.executeTool('createFolder', {
      userId: this.userId,
      ...data,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create folder');
    }

    return result.data as { id: string; folder: Folder };
  }

  async listFolders(parentId?: string): Promise<Folder[]> {
    const result = await notesMCPServer.executeTool('listFolders', {
      userId: this.userId,
      parentId,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to list folders');
    }

    return result.data?.folders || [];
  }

  // AI Features

  async summarizeNote(noteId: string, maxLength?: number): Promise<NoteSummary> {
    const result = await notesAIMCPServer.executeTool('summarizeNote', {
      noteId,
      userId: this.userId,
      maxLength,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to summarize note');
    }

    return result.data as NoteSummary;
  }

  async findRelatedNotes(noteId: string, limitCount?: number): Promise<RelatedNote[]> {
    const result = await notesAIMCPServer.executeTool('findRelatedNotes', {
      noteId,
      userId: this.userId,
      limitCount,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to find related notes');
    }

    return result.data?.relatedNotes || [];
  }

  async generateNoteTags(noteId: string, maxTags?: number): Promise<string[]> {
    const result = await notesAIMCPServer.executeTool('generateNoteTags', {
      noteId,
      userId: this.userId,
      maxTags,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to generate tags');
    }

    return result.data?.tags || [];
  }

  async enhanceNoteContent(
    noteId: string,
    enhancementType?: 'grammar' | 'clarity' | 'structure' | 'all'
  ): Promise<NoteEnhancement> {
    const result = await notesAIMCPServer.executeTool('enhanceNoteContent', {
      noteId,
      userId: this.userId,
      enhancementType,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to enhance content');
    }

    return result.data as NoteEnhancement;
  }

  async transcribeAudioToNote(data: {
    audioUrl: string;
    title?: string;
    folderId?: string;
  }): Promise<{ noteId: string; transcription: string }> {
    const result = await notesAIMCPServer.executeTool('transcribeAudioToNote', {
      userId: this.userId,
      ...data,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to transcribe audio');
    }

    return result.data as { noteId: string; transcription: string };
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
