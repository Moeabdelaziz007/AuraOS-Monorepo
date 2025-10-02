/**
 * Firebase Firestore Service
 * Handles data storage and retrieval
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  type Firestore,
  type DocumentData,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  files: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirebaseFirestoreService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  /**
   * User operations
   */
  async createUser(uid: string, data: Partial<UserData>): Promise<void> {
    const userRef = doc(this.db, 'users', uid);
    await setDoc(userRef, {
      uid,
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async getUser(uid: string): Promise<UserData | null> {
    const userRef = doc(this.db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data() as UserData) : null;
  }

  async updateUser(uid: string, data: Partial<UserData>): Promise<void> {
    const userRef = doc(this.db, 'users', uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Chat message operations
   */
  async saveChatMessage(userId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    const messagesRef = collection(this.db, 'users', userId, 'messages');
    const messageDoc = doc(messagesRef);
    
    await setDoc(messageDoc, {
      ...message,
      timestamp: serverTimestamp(),
    });
    
    return messageDoc.id;
  }

  async getChatHistory(userId: string, limitCount: number = 50): Promise<ChatMessage[]> {
    const messagesRef = collection(this.db, 'users', userId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ChatMessage));
  }

  onChatMessages(userId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const messagesRef = collection(this.db, 'users', userId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ChatMessage));
      callback(messages);
    });
  }

  /**
   * Project operations
   */
  async createProject(userId: string, project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const projectsRef = collection(this.db, 'users', userId, 'projects');
    const projectDoc = doc(projectsRef);
    
    await setDoc(projectDoc, {
      ...project,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return projectDoc.id;
  }

  async getProjects(userId: string): Promise<Project[]> {
    const projectsRef = collection(this.db, 'users', userId, 'projects');
    const q = query(projectsRef, orderBy('updatedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Project));
  }

  async updateProject(userId: string, projectId: string, data: Partial<Project>): Promise<void> {
    const projectRef = doc(this.db, 'users', userId, 'projects', projectId);
    await updateDoc(projectRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const projectRef = doc(this.db, 'users', userId, 'projects', projectId);
    await deleteDoc(projectRef);
  }

  /**
   * Generic operations
   */
  async getDocument<T = DocumentData>(collectionPath: string, docId: string): Promise<T | null> {
    const docRef = doc(this.db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  }

  async setDocument(collectionPath: string, docId: string, data: DocumentData): Promise<void> {
    const docRef = doc(this.db, collectionPath, docId);
    await setDoc(docRef, data);
  }

  async updateDocument(collectionPath: string, docId: string, data: Partial<DocumentData>): Promise<void> {
    const docRef = doc(this.db, collectionPath, docId);
    await updateDoc(docRef, data);
  }

  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    const docRef = doc(this.db, collectionPath, docId);
    await deleteDoc(docRef);
  }
}

/**
 * Create Firestore Service
 */
export function createFirestoreService(db: Firestore): FirebaseFirestoreService {
  return new FirebaseFirestoreService(db);
}
