import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@auraos/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: any;
  lastLogin: any;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or update user profile in Firestore
  const createUserProfile = async (user: User, additionalData?: any) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        preferences: {
          theme: 'dark',
          language: 'en',
        },
        ...additionalData,
      };

      await setDoc(userRef, profile);
      return profile;
    } else {
      // Update last login
      await setDoc(
        userRef,
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
      return userSnap.data() as UserProfile;
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      setUserProfile(userSnap.data() as UserProfile);
    } else {
      const profile = await createUserProfile(user);
      setUserProfile(profile);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await loadUserProfile(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(result.user, { displayName });
      
      // Create user profile
      await createUserProfile(result.user, { displayName });
      await loadUserProfile(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await loadUserProfile(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign in as guest
  const signInAsGuest = async () => {
    try {
      // Create a guest account with random credentials
      const guestEmail = `guest_${Date.now()}@auraos.local`;
      const guestPassword = Math.random().toString(36).slice(-8);
      const guestName = `Guest_${Date.now().toString().slice(-4)}`;

      const result = await createUserWithEmailAndPassword(auth, guestEmail, guestPassword);
      await updateProfile(result.user, { displayName: guestName });
      await createUserProfile(result.user, { displayName: guestName, isGuest: true });
      await loadUserProfile(result.user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      
      // Reload profile
      await loadUserProfile(user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInAsGuest,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
