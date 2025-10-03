import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { AuthContext, AuthContextType } from '@auraos/ui/contexts/AuthContext';
import { useUserProfile } from './useUserProfile';

// Mock the useAuth hook directly
vi.mock('@auraos/ui/contexts/AuthContext', async (importOriginal) => {
  const original = await importOriginal<typeof import('@auraos/ui/contexts/AuthContext')>();
  return {
    ...original,
    useAuth: vi.fn(),
  };
});

const mockUseAuth = useAuth as vi.Mock;

describe('useUserProfile', () => {
  it('should throw an error if not used within an AuthProvider', () => {
    // Arrange: Simulate useAuth returning undefined
    mockUseAuth.mockReturnValue(undefined);

    // Act & Assert
    // We need to wrap the hook call in a function for renderHook to catch the error
    const { result } = renderHook(() => {
      try {
        return useUserProfile();
      } catch (e) {
        return e;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toBe('useAuth must be used within AuthProvider');
  });

  it('should return the user profile and loading state from AuthContext', () => {
    // Arrange: Provide a mock context value
    const mockProfile = { uid: '123', displayName: 'Test User', email: 'test@test.com' };
    mockUseAuth.mockReturnValue({
      user: { uid: '123' },
      userProfile: mockProfile,
      loading: false,
      updateUserProfile: vi.fn(),
    });

    // Act
    const { result } = renderHook(() => useUserProfile());

    // Assert
    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.user?.uid).toBe('123');
  });
});