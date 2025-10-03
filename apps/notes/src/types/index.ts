/**
 * Type definitions for Notes app
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  folderId?: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  userId: string;
  parentId?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteSummary {
  summary: string;
  keyPoints: string[];
}

export interface RelatedNote {
  noteId: string;
  title: string;
  similarity: number;
  reason: string;
}

export interface NoteEnhancement {
  enhancedContent: string;
  suggestions: Array<{
    type: string;
    original: string;
    suggestion: string;
    reason: string;
  }>;
}

export type ViewMode = 'list' | 'grid' | 'compact';
export type SortBy = 'updated' | 'created' | 'title' | 'pinned';
