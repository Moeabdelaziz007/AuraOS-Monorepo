import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { auth } from '@auraos/firebase';

// Mock Firebase
vi.mock('@auraos/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
}));

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  updateProfile: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false })),
  serverTimestamp: vi.fn(() => Date.now()),
}));

describe('AuthContext - Guest Password Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generates secure guest password with minimum 16 characters', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const mockCreate = vi.mocked(createUserWithEmailAndPassword);
    
    mockCreate.mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'guest@test.com',
        displayName: 'Guest',
        photoURL: null,
      },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Trigger guest sign in
    await result.current.signInAsGuest();

    // Verify password length
    expect(mockCreate).toHaveBeenCalled();
    const callArgs = mockCreate.mock.calls[0];
    const password = callArgs[2] as string;
    
    // Password should be at least 16 characters
    expect(password.length).toBeGreaterThanOrEqual(16);
  });

  it('generates unique guest passwords', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const mockCreate = vi.mocked(createUserWithEmailAndPassword);
    
    mockCreate.mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'guest@test.com',
        displayName: 'Guest',
        photoURL: null,
      },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result: result1 } = renderHook(() => useAuth(), { wrapper });
    const { result: result2 } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    // Generate two guest passwords
    await result1.current.signInAsGuest();
    const password1 = mockCreate.mock.calls[0][2] as string;

    mockCreate.mockClear();
    
    await result2.current.signInAsGuest();
    const password2 = mockCreate.mock.calls[0][2] as string;

    // Passwords should be different
    expect(password1).not.toBe(password2);
  });

  it('generates guest password with alphanumeric characters', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const mockCreate = vi.mocked(createUserWithEmailAndPassword);
    
    mockCreate.mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'guest@test.com',
        displayName: 'Guest',
        photoURL: null,
      },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.signInAsGuest();

    const password = mockCreate.mock.calls[0][2] as string;
    
    // Password should contain only alphanumeric characters
    expect(password).toMatch(/^[a-z0-9]+$/);
  });

  it('includes timestamp in guest password for uniqueness', async () => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const mockCreate = vi.mocked(createUserWithEmailAndPassword);
    
    mockCreate.mockResolvedValue({
      user: {
        uid: 'test-uid',
        email: 'guest@test.com',
        displayName: 'Guest',
        photoURL: null,
      },
    } as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const beforeTimestamp = Date.now();
    await result.current.signInAsGuest();
    const afterTimestamp = Date.now();

    const password = mockCreate.mock.calls[0][2] as string;
    
    // Password should be longer than 16 chars (includes timestamp)
    expect(password.length).toBeGreaterThan(16);
    
    // Verify timestamp is included (convert to base36 and check)
    const timestampBase36 = beforeTimestamp.toString(36);
    const hasTimestamp = password.includes(timestampBase36.substring(0, 5));
    expect(hasTimestamp).toBe(true);
  });
});
