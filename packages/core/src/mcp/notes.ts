/**
 * Notes MCP Server
 * Provides note management operations with Firestore integration
 */

import '../autopilot/logger'; // Initialize global logger
import { BaseMCPServer, Tool } from '@auraos/ai/src/mcp/server';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@auraos/firebase/src/config/firebase';

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

const COLLECTIONS = {
  NOTES: 'notes',
  FOLDERS: 'folders',
} as const;

export class NotesMCPServer extends BaseMCPServer {
  name = 'notes';
  version = '1.0.0';
  description = 'Note management with Firestore integration';

  tools: Tool[] = [
    {
      name: 'createNote',
      description: 'Create a new note',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID who owns the note',
          },
          title: {
            type: 'string',
            description: 'Note title',
          },
          content: {
            type: 'string',
            description: 'Note content (rich text/markdown)',
          },
          folderId: {
            type: 'string',
            description: 'Optional folder ID',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for organization',
          },
        },
        required: ['userId', 'title', 'content'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          note: { type: 'object' },
        },
      },
    },
    {
      name: 'getNote',
      description: 'Get a note by ID',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'Note ID',
          },
          userId: {
            type: 'string',
            description: 'User ID for authorization',
          },
        },
        required: ['noteId', 'userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          note: { type: 'object' },
        },
      },
    },
    {
      name: 'updateNote',
      description: 'Update an existing note',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'Note ID',
          },
          userId: {
            type: 'string',
            description: 'User ID for authorization',
          },
          title: {
            type: 'string',
            description: 'Updated title',
          },
          content: {
            type: 'string',
            description: 'Updated content',
          },
          folderId: {
            type: 'string',
            description: 'Updated folder ID',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Updated tags',
          },
          isPinned: {
            type: 'boolean',
            description: 'Pin status',
          },
          isArchived: {
            type: 'boolean',
            description: 'Archive status',
          },
        },
        required: ['noteId', 'userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
        },
      },
    },
    {
      name: 'deleteNote',
      description: 'Delete a note',
      inputSchema: {
        type: 'object',
        properties: {
          noteId: {
            type: 'string',
            description: 'Note ID',
          },
          userId: {
            type: 'string',
            description: 'User ID for authorization',
          },
        },
        required: ['noteId', 'userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
        },
      },
    },
    {
      name: 'listNotes',
      description: 'List notes for a user',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID',
          },
          folderId: {
            type: 'string',
            description: 'Filter by folder ID',
          },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by tags',
          },
          isPinned: {
            type: 'boolean',
            description: 'Filter pinned notes',
          },
          isArchived: {
            type: 'boolean',
            description: 'Filter archived notes',
          },
          limitCount: {
            type: 'number',
            description: 'Maximum number of notes to return',
          },
        },
        required: ['userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          notes: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    },
    {
      name: 'createFolder',
      description: 'Create a new folder',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID who owns the folder',
          },
          name: {
            type: 'string',
            description: 'Folder name',
          },
          parentId: {
            type: 'string',
            description: 'Parent folder ID for nested folders',
          },
          color: {
            type: 'string',
            description: 'Folder color (hex)',
          },
        },
        required: ['userId', 'name'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          folder: { type: 'object' },
        },
      },
    },
    {
      name: 'listFolders',
      description: 'List folders for a user',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User ID',
          },
          parentId: {
            type: 'string',
            description: 'Filter by parent folder ID',
          },
        },
        required: ['userId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          folders: {
            type: 'array',
            items: { type: 'object' },
          },
        },
      },
    },
  ];

  protected async onInitialize(): Promise<void> {
    logger.info('[NotesMCP] Initializing Notes MCP Server');
  }

  protected async onShutdown(): Promise<void> {
    logger.info('[NotesMCP] Shutting down Notes MCP Server');
  }

  protected async handleToolExecution(
    toolName: string,
    input: Record<string, any>
  ): Promise<any> {
    switch (toolName) {
      case 'createNote':
        return this.createNote(input);
      case 'getNote':
        return this.getNote(input);
      case 'updateNote':
        return this.updateNote(input);
      case 'deleteNote':
        return this.deleteNote(input);
      case 'listNotes':
        return this.listNotes(input);
      case 'createFolder':
        return this.createFolder(input);
      case 'listFolders':
        return this.listFolders(input);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async createNote(input: {
    userId: string;
    title: string;
    content: string;
    folderId?: string;
    tags?: string[];
  }): Promise<{ id: string; note: Note }> {
    const notesRef = collection(db, COLLECTIONS.NOTES);
    const noteId = doc(notesRef).id;
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);

    const now = new Date();
    const note: Note = {
      id: noteId,
      title: input.title,
      content: input.content,
      userId: input.userId,
      folderId: input.folderId,
      tags: input.tags || [],
      isPinned: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(noteRef, {
      ...note,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    logger.info(`[NotesMCP] Created note: ${noteId}`);
    return { id: noteId, note };
  }

  private async getNote(input: {
    noteId: string;
    userId: string;
  }): Promise<{ note: Note | null }> {
    const noteRef = doc(db, COLLECTIONS.NOTES, input.noteId);
    const snapshot = await getDoc(noteRef);

    if (!snapshot.exists()) {
      return { note: null };
    }

    const data = snapshot.data();

    // Authorization check
    if (data.userId !== input.userId) {
      throw new Error('Unauthorized: Note does not belong to user');
    }

    const note: Note = {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Note;

    return { note };
  }

  private async updateNote(input: {
    noteId: string;
    userId: string;
    title?: string;
    content?: string;
    folderId?: string;
    tags?: string[];
    isPinned?: boolean;
    isArchived?: boolean;
  }): Promise<{ success: boolean }> {
    const noteRef = doc(db, COLLECTIONS.NOTES, input.noteId);
    const snapshot = await getDoc(noteRef);

    if (!snapshot.exists()) {
      throw new Error('Note not found');
    }

    const data = snapshot.data();

    // Authorization check
    if (data.userId !== input.userId) {
      throw new Error('Unauthorized: Note does not belong to user');
    }

    const updates: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) updates.title = input.title;
    if (input.content !== undefined) updates.content = input.content;
    if (input.folderId !== undefined) updates.folderId = input.folderId;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.isPinned !== undefined) updates.isPinned = input.isPinned;
    if (input.isArchived !== undefined) updates.isArchived = input.isArchived;

    await updateDoc(noteRef, updates);

    logger.info(`[NotesMCP] Updated note: ${input.noteId}`);
    return { success: true };
  }

  private async deleteNote(input: {
    noteId: string;
    userId: string;
  }): Promise<{ success: boolean }> {
    const noteRef = doc(db, COLLECTIONS.NOTES, input.noteId);
    const snapshot = await getDoc(noteRef);

    if (!snapshot.exists()) {
      throw new Error('Note not found');
    }

    const data = snapshot.data();

    // Authorization check
    if (data.userId !== input.userId) {
      throw new Error('Unauthorized: Note does not belong to user');
    }

    await deleteDoc(noteRef);

    logger.info(`[NotesMCP] Deleted note: ${input.noteId}`);
    return { success: true };
  }

  private async listNotes(input: {
    userId: string;
    folderId?: string;
    tags?: string[];
    isPinned?: boolean;
    isArchived?: boolean;
    limitCount?: number;
  }): Promise<{ notes: Note[] }> {
    const notesRef = collection(db, COLLECTIONS.NOTES);
    
    let q = query(
      notesRef,
      where('userId', '==', input.userId),
      orderBy('updatedAt', 'desc')
    );

    if (input.folderId !== undefined) {
      q = query(q, where('folderId', '==', input.folderId));
    }

    if (input.isPinned !== undefined) {
      q = query(q, where('isPinned', '==', input.isPinned));
    }

    if (input.isArchived !== undefined) {
      q = query(q, where('isArchived', '==', input.isArchived));
    }

    if (input.limitCount) {
      q = query(q, limit(input.limitCount));
    }

    const snapshot = await getDocs(q);
    let notes = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Note;
    });

    // Filter by tags if provided (client-side filtering)
    if (input.tags && input.tags.length > 0) {
      notes = notes.filter((note) =>
        input.tags!.some((tag) => note.tags.includes(tag))
      );
    }

    return { notes };
  }

  private async createFolder(input: {
    userId: string;
    name: string;
    parentId?: string;
    color?: string;
  }): Promise<{ id: string; folder: Folder }> {
    const foldersRef = collection(db, COLLECTIONS.FOLDERS);
    const folderId = doc(foldersRef).id;
    const folderRef = doc(db, COLLECTIONS.FOLDERS, folderId);

    const now = new Date();
    const folder: Folder = {
      id: folderId,
      name: input.name,
      userId: input.userId,
      parentId: input.parentId,
      color: input.color,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(folderRef, {
      ...folder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    logger.info(`[NotesMCP] Created folder: ${folderId}`);
    return { id: folderId, folder };
  }

  private async listFolders(input: {
    userId: string;
    parentId?: string;
  }): Promise<{ folders: Folder[] }> {
    const foldersRef = collection(db, COLLECTIONS.FOLDERS);
    
    let q = query(
      foldersRef,
      where('userId', '==', input.userId),
      orderBy('name', 'asc')
    );

    if (input.parentId !== undefined) {
      q = query(q, where('parentId', '==', input.parentId));
    }

    const snapshot = await getDocs(q);
    const folders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Folder;
    });

    return { folders };
  }
}

export const notesMCPServer = new NotesMCPServer();
