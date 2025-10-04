/**
 * Main entry point for Notes app
 * Sprint 3: Added authentication and protected routes
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotesApp } from './components/NotesApp';
import './styles/notes-app.css';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user && <NotesApp userId={user.id} />}
    </ProtectedRoute>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
