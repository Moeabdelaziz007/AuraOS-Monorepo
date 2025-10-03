import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeDataAgent } from './api';

// Initialize Firebase app
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [firebaseApp, setFirebaseApp] = useState(app);
  const [dataAgent, setDataAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Initialize Data Agent
        const agent = initializeDataAgent(db, auth);
        setDataAgent(agent);

        logger.info('Firebase and Data Agent initialized successfully');
        setLoading(false);
      } catch (error) {
        logger.error('Firebase initialization error:', error);
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  const value = {
    firebaseApp,
    db,
    auth,
    dataAgent,
    loading
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
