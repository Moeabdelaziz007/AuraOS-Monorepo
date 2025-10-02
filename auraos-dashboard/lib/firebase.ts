// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCiZQHxCQZ0Jy_PjUTBX1cdJ7YfHnsJ8zQ',
  authDomain: 'selfos-62f70.firebaseapp.com',
  projectId: 'selfos-62f70',
  storageBucket: 'selfos-62f70.appspot.com',
  messagingSenderId: '693748251235',
  appId: '1:693748251235:web:4fe7e5cefae61f127e1656',
  measurementId: 'G-GNFLCQJX48',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, analytics, auth, db, functions, storage };
