/**
 * Notes Service - Firebase CRUD Operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@auraos/firebase';
import { Note, Folder, Tag } from '../types/note.types';

const NOTES_COLLECTION = 'notes';
const FOLDERS_COLLECTION = 'folders';
const TAGS_COLLECTION = 'tags';

/**
 * Notes CRUD Operations
 */
export class NotesService {
  /**
   * Create a new note
   */
  static async createNote(userId: string, noteData: Partial<Note>): Promise<Note> {
    const now = new Date();
    
    const note: Omit<Note, 'id'> = {
      userId,
      title: noteData.title || 'Untitled',
      content: noteData.content || '',
      tags: noteData.tags || [],
      folderId: noteData.folderId || null,
      isPinned: false,
      isArchived: false,
      metadata: {
        createdAt: now,
        updatedAt: now,
        lastAccessedAt: now,
        wordCount: this.countWords(noteData.content || ''),
        readingTime: this.calculateReadingTime(noteData.content || ''),
        language: 'en',
        color: noteData.metadata?.color,
      },
      connections: {
        relatedNotes: [],
        references: [],
        backlinks: [],
        mentions: [],
      },
    };

    const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
      ...note,
      metadata: {
        ...note.metadata,
        createdAt: Timestamp.fromDate(note.metadata.createdAt),
        updatedAt: Timestamp.fromDate(note.metadata.updatedAt),
        lastAccessedAt: Timestamp.fromDate(note.metadata.lastAccessedAt),
      },
    });

    return {
      ...note,
      id: docRef.id,
    };
  }

  /**
   * Get note by ID
   */
  static async getNote(noteId: string): Promise<Note | null> {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return this.convertFirestoreNote(docSnap.id, data);
  }

  /**
   * Get all notes for a user
   */
  static async getUserNotes(userId: string): Promise<Note[]> {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId),
      orderBy('metadata.updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      this.convertFirestoreNote(doc.id, doc.data())
    );
  }

  /**
   * Update note
   */
  static async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    
    const updateData: any = {
      ...updates,
      'metadata.updatedAt': serverTimestamp(),
    };

    // Update word count and reading time if content changed
    if (updates.content !== undefined) {
      updateData['metadata.wordCount'] = this.countWords(updates.content);
      updateData['metadata.readingTime'] = this.calculateReadingTime(updates.content);
    }

    await updateDoc(docRef, updateData);
  }

  /**
   * Delete note
   */
  static async deleteNote(noteId: string): Promise<void> {
    const docRef = doc(db, NOTES_COLLECTION, noteId);
    await deleteDoc(docRef);
  }

  /**
   * Search notes
   */
  static async searchNotes(userId: string, searchQuery: string): Promise<Note[]> {
    // Basic search - will be enhanced with semantic search later
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const notes = querySnapshot.docs.map((doc) =>
      this.convertFirestoreNote(doc.id, doc.data())
    );

    // Client-side filtering
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  /**
   * Get notes in folder
   */
  static async getNotesInFolder(userId: string, folderId: string | null): Promise<Note[]> {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId),
      where('folderId', '==', folderId),
      orderBy('metadata.updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      this.convertFirestoreNote(doc.id, doc.data())
    );
  }

  /**
   * Get notes with tag
   */
  static async getNotesWithTag(userId: string, tagId: string): Promise<Note[]> {
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId),
      where('tags', 'array-contains', tagId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) =>
      this.convertFirestoreNote(doc.id, doc.data())
    );
  }

  /**
   * Helper: Convert Firestore document to Note
   */
  private static convertFirestoreNote(id: string, data: any): Note {
    return {
      ...data,
      id,
      metadata: {
        ...data.metadata,
        createdAt: data.metadata.createdAt?.toDate() || new Date(),
        updatedAt: data.metadata.updatedAt?.toDate() || new Date(),
        lastAccessedAt: data.metadata.lastAccessedAt?.toDate() || new Date(),
      },
    };
  }

  /**
   * Helper: Count words in text
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Helper: Calculate reading time (words per minute)
   */
  private static calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = this.countWords(text);
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

/**
 * Folders CRUD Operations
 */
export class FoldersService {
  /**
   * Create folder
   */
  static async createFolder(userId: string, folderData: Partial<Folder>): Promise<Folder> {
    const folder: Omit<Folder, 'id'> = {
      userId,
      name: folderData.name || 'New Folder',
      parentId: folderData.parentId || null,
      color: folderData.color || '#6366f1',
      icon: folderData.icon || '📁',
      metadata: {
        createdAt: new Date(),
        noteCount: 0,
        lastModified: new Date(),
      },
    };

    const docRef = await addDoc(collection(db, FOLDERS_COLLECTION), {
      ...folder,
      metadata: {
        ...folder.metadata,
        createdAt: Timestamp.fromDate(folder.metadata.createdAt),
        lastModified: Timestamp.fromDate(folder.metadata.lastModified),
      },
    });

    return {
      ...folder,
      id: docRef.id,
    };
  }

  /**
   * Get user folders
   */
  static async getUserFolders(userId: string): Promise<Folder[]> {
    const q = query(
      collection(db, FOLDERS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      metadata: {
        ...doc.data().metadata,
        createdAt: doc.data().metadata.createdAt?.toDate() || new Date(),
        lastModified: doc.data().metadata.lastModified?.toDate() || new Date(),
      },
    } as Folder));
  }

  /**
   * Update folder
   */
  static async updateFolder(folderId: string, updates: Partial<Folder>): Promise<void> {
    const docRef = doc(db, FOLDERS_COLLECTION, folderId);
    await updateDoc(docRef, {
      ...updates,
      'metadata.lastModified': serverTimestamp(),
    });
  }

  /**
   * Delete folder
   */
  static async deleteFolder(folderId: string): Promise<void> {
    const docRef = doc(db, FOLDERS_COLLECTION, folderId);
    await deleteDoc(docRef);
  }
}

/**
 * Tags CRUD Operations
 */
export class TagsService {
  /**
   * Create tag
   */
  static async createTag(userId: string, tagData: Partial<Tag>): Promise<Tag> {
    const tag: Omit<Tag, 'id'> = {
      userId,
      name: tagData.name || 'new-tag',
      color: tagData.color || '#10b981',
      noteCount: 0,
      relatedTags: [],
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, TAGS_COLLECTION), {
      ...tag,
      createdAt: Timestamp.fromDate(tag.createdAt),
    });

    return {
      ...tag,
      id: docRef.id,
    };
  }

  /**
   * Get user tags
   */
  static async getUserTags(userId: string): Promise<Tag[]> {
    const q = query(
      collection(db, TAGS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as Tag));
  }

  /**
   * Update tag
   */
  static async updateTag(tagId: string, updates: Partial<Tag>): Promise<void> {
    const docRef = doc(db, TAGS_COLLECTION, tagId);
    await updateDoc(docRef, updates);
  }

  /**
   * Delete tag
   */
  static async deleteTag(tagId: string): Promise<void> {
    const docRef = doc(db, TAGS_COLLECTION, tagId);
    await deleteDoc(docRef);
  }
}
