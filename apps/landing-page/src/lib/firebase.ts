// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBmrG7iMS7hn46IRdRBrYVOd0ZJFTSBvX8",
  authDomain: "auraos-ac2e0.firebaseapp.com",
  projectId: "auraos-ac2e0",
  storageBucket: "auraos-ac2e0.firebasestorage.app",
  messagingSenderId: "53322697327",
  appId: "1:53322697327:web:224560128eb0605c281b9a",
  measurementId: "G-PDPF0MH7L8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
