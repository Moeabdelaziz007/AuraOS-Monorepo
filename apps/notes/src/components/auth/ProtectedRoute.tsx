/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginPage } from './LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
