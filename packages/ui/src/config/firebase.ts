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
  apiKey: "AIzaSyCiZQHxCQZ0Jy_PjUTBX1cdJ7YfHnsJ8zQ",
  authDomain: "selfos-62f70.firebaseapp.com",
  projectId: "selfos-62f70",
  storageBucket: "selfos-62f70.firebasestorage.app",
  messagingSenderId: "693748251235",
  appId: "1:693748251235:web:4fe7e5cefae61f127e1656",
  measurementId: "G-GNFLCQJX48"
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
