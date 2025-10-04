/**
 * Authentication Context
 * Manages user authentication state
 * 
 * Note: This is a simplified implementation for Sprint 3 MVP
 * Full JWT authentication will be implemented in Sprint 4
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('auraos_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auraos_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // TODO: Replace with actual API call in Sprint 4
    // For now, create a mock user
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create mock user (in production, this would come from API)
    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
      email,
      name: email.split('@')[0],
    };

    setUser(mockUser);
    localStorage.setItem('auraos_user', JSON.stringify(mockUser));
  };

  const register = async (email: string, password: string, name: string): Promise<void> => {
    // TODO: Replace with actual API call in Sprint 4
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create mock user
    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email,
      name,
    };

    setUser(mockUser);
    localStorage.setItem('auraos_user', JSON.stringify(mockUser));
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('auraos_user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
