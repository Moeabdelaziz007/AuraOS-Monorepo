// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqpCr3Gh0ZuA7-Frdrl9h1NWZ8gcGCTjI",
  authDomain: "adept-student-469614-k2.firebaseapp.com",
  databaseURL: "https://adept-student-469614-k2-default-rtdb.firebaseio.com",
  projectId: "adept-student-469614-k2",
  storageBucket: "adept-student-469614-k2.firebasestorage.app",
  messagingSenderId: "436679358368",
  appId: "1:436679358368:web:48c801ddca460d759c96c5",
  measurementId: "G-F482TZLQ5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
