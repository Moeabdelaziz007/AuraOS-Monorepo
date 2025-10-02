/**
 * Firebase Authentication Service
 * Handles user authentication and session management
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  type Auth,
} from 'firebase/auth';

export class FirebaseAuthService {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    return userCredential.user;
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(this.auth, provider);
    return userCredential.user;
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(displayName?: string, photoURL?: string): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user signed in');
    
    await updateProfile(user, { displayName, photoURL });
  }
}

/**
 * Create Firebase Auth Service
 */
export function createAuthService(auth: Auth): FirebaseAuthService {
  return new FirebaseAuthService(auth);
}
