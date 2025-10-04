/**
 * AuraOS Studio - Cognitive Edition
 * 
 * Main entry point for the revolutionary Cognitive Orchestration Environment
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import StudioApp from './components/StudioApp';
import './styles/globals.css';

// Initialize the application
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <StudioApp />
  </React.StrictMode>
);
