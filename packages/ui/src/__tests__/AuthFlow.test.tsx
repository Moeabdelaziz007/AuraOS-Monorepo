/**
 * Authentication Flow Tests
 * End-to-end tests for login, signup, and navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthPage } from '../pages/AuthPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Mock Firebase
const mockSignInWithEmailAndPassword = vi.fn();
const mockCreateUserWithEmailAndPassword = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockOnAuthStateChanged = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
  GoogleAuthProvider: vi.fn(),
  signOut: (...args: any[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
}));

// Mock Firestore
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockDoc = vi.fn();

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  doc: (...args: any[]) => mockDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  serverTimestamp: () => new Date(),
}));

// Mock Firebase config
vi.mock('@auraos/firebase', () => ({
  auth: {},
  db: {},
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null); // No user initially
      return vi.fn(); // Unsubscribe function
    });
  });

  describe('AuthPage Rendering', () => {
    it('should render login form by default', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('AuraOS')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should switch to signup form', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const signUpTab = screen.getAllByText('Sign Up')[0];
      fireEvent.click(signUpTab);

      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('should show Google sign-in button', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    });

    it('should show guest sign-in button', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Continue as Guest')).toBeInTheDocument();
    });
  });

  describe('Email/Password Login', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        uid: 'user_123',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      mockSignInWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          uid: 'user_123',
          email: 'test@example.com',
          displayName: 'Test User',
        }),
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/desktop');
      });
    });

    it('should handle login error', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue(
        new Error('Invalid credentials')
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      expect(emailInput.validity.valid).toBe(false);
    });

    it('should validate password length', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      
      expect(passwordInput.validity.valid).toBe(false);
    });
  });

  describe('Email/Password Signup', () => {
    it('should handle successful signup', async () => {
      const mockUser = {
        uid: 'new_user_123',
        email: 'newuser@example.com',
        displayName: 'New User',
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser,
      });

      mockUpdateProfile.mockResolvedValue(undefined);
      mockSetDoc.mockResolvedValue(undefined);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      // Switch to signup
      const signUpTab = screen.getAllByText('Sign Up')[0];
      fireEvent.click(signUpTab);

      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(nameInput, { target: { value: 'New User' } });
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/desktop');
      });
    });

    it('should require name for signup', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      // Switch to signup
      const signUpTab = screen.getAllByText('Sign Up')[0];
      fireEvent.click(signUpTab);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter your name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Google Sign-In', () => {
    it('should handle successful Google sign-in', async () => {
      const mockUser = {
        uid: 'google_user_123',
        email: 'google@example.com',
        displayName: 'Google User',
        photoURL: 'https://example.com/photo.jpg',
      };

      mockSignInWithPopup.mockResolvedValue({
        user: mockUser,
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUser,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByText('Sign in with Google');
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(mockSignInWithPopup).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/desktop');
      });
    });

    it('should handle Google sign-in error', async () => {
      mockSignInWithPopup.mockRejectedValue(
        new Error('Google sign-in failed')
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const googleButton = screen.getByText('Sign in with Google');
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/Google sign-in failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Guest Sign-In', () => {
    it('should handle successful guest sign-in', async () => {
      const mockGuestUser = {
        uid: 'guest_123',
        email: 'guest_123@auraos.local',
        displayName: 'Guest_123',
      };

      mockCreateUserWithEmailAndPassword.mockResolvedValue({
        user: mockGuestUser,
      });

      mockUpdateProfile.mockResolvedValue(undefined);
      mockSetDoc.mockResolvedValue(undefined);
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const guestButton = screen.getByText('Continue as Guest');
      fireEvent.click(guestButton);

      await waitFor(() => {
        expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/desktop');
      });
    });
  });

  describe('Protected Route', () => {
    it('should show loading state', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        // Don't call callback to simulate loading
        return vi.fn();
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should redirect to auth when not logged in', () => {
      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(null); // No user
        return vi.fn();
      });

      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      // Should not show protected content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should show protected content when logged in', async () => {
      const mockUser = {
        uid: 'user_123',
        email: 'test@example.com',
      };

      mockOnAuthStateChanged.mockImplementation((auth, callback) => {
        callback(mockUser);
        return vi.fn();
      });

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockUser,
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </AuthProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should disable buttons while loading', async () => {
      mockSignInWithEmailAndPassword.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <BrowserRouter>
          <AuthProvider>
            <AuthPage />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText('Please wait...')).toBeInTheDocument();
      });
    });
  });
});
