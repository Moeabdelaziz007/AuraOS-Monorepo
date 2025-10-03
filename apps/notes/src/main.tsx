/**
 * Main entry point for Notes app
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { NotesApp } from './components/NotesApp';
import './styles/notes-app.css';

// For development, use a mock user ID
// In production, this would come from authentication
const userId = 'demo-user-123';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotesApp userId={userId} />
  </React.StrictMode>
);
