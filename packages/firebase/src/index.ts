/**
 * AuraOS Firebase Package
 * Exports Firebase services for authentication, Firestore, and AI integration
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Configuration
export { getFirebaseConfig, validateFirebaseConfig, type FirebaseConfig } from './config';

// Authentication
export { FirebaseAuthService, createAuthService } from './auth';

// Firestore
export {
  FirebaseFirestoreService,
  createFirestoreService,
  type UserData,
  type ChatMessage,
  type Project,
} from './firestore';

/**
 * Firebase App Instance
 */
let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

/**
 * Initialize Firebase
 */
export function initializeFirebase(config: any): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp(config);
    authInstance = getAuth(firebaseApp);
    firestoreInstance = getFirestore(firebaseApp);
    storageInstance = getStorage(firebaseApp);
  }
  return firebaseApp;
}

/**
 * Get Firebase instances
 */
export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return authInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return firestoreInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storageInstance) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return storageInstance;
}
