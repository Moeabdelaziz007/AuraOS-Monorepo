/**
 * Firebase Configuration for AuraOS
 * Project: selfos-62f70
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBmrG7iMS7hn46IRdRBrYVOd0ZJFTSBvX8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'auraos-ac2e0.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'auraos-ac2e0',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'auraos-ac2e0.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '53322697327',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:53322697327:web:224560128eb0605c281b9a',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PDPF0MH7L8'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
export default firebaseConfig;
