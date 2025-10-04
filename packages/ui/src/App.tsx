import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { DesktopOS } from './pages/DesktopOS';
import { PricingPage } from './pages/PricingPage';
import { ContentGeneratorPage } from './pages/ContentGeneratorPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/desktop"
              element={
                <ProtectedRoute>
                  <DesktopOS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content-generator"
              element={
                <ProtectedRoute>
                  <ContentGeneratorPage />
                </ProtectedRoute>
              }
            />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
