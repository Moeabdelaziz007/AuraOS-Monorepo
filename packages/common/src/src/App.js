import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Button, 
  Menu, 
  MenuItem,
  Avatar,
  IconButton,
  Badge
} from '@mui/material';
import {
  AccountCircle,
  Notifications,
  Logout,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Apps as AppsIcon,
  SmartToy,
  AutoAwesome,
  Psychology,
  Chat,
  People
} from '@mui/icons-material';

import Dashboard from './pages/Dashboard';
import Apps from './pages/Apps';
import Settings from './pages/Settings';
import DataAgentDashboard from './pages/DataAgentDashboard';
import AILearningLoop from './pages/AILearningLoop';
import AILearningRules from './pages/AILearningRules';
import OperatingSystemsList from './pages/OperatingSystemsList';
import AuthPage from './pages/AuthPage';
import LiveChat from './components/LiveChat';
import { FirebaseProvider } from './services/FirebaseService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

function AppContent() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const { user, userProfile, logout, isAuthenticated } = useAuth();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        } />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AIOS - AI Operating System
          </Typography>
          
          {/* Navigation Menu */}
          <Button 
            color="inherit" 
            onClick={handleMenuOpen}
            sx={{ ml: 2 }}
            startIcon={<DashboardIcon />}
          >
            Navigation
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <a href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <DashboardIcon sx={{ mr: 1 }} />
                Dashboard
              </a>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <a href="/apps" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <AppsIcon sx={{ mr: 1 }} />
                Apps
              </a>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <a href="/live-chat" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <Chat sx={{ mr: 1 }} />
                Live Chat
              </a>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <a href="/data-agent" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <SmartToy sx={{ mr: 1 }} />
                Data Agent
              </a>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <a href="/ai-learning" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <AutoAwesome sx={{ mr: 1 }} />
                AI Learning Loop
              </a>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <a href="/ai-rules" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <Psychology sx={{ mr: 1 }} />
                AI Learning Rules
              </a>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <a href="/os-platform" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <AppsIcon sx={{ mr: 1 }} />
                OS Platform
              </a>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <a href="/settings" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1 }} />
                Settings
              </a>
            </MenuItem>
          </Menu>

          {/* Notifications */}
          <IconButton color="inherit" sx={{ ml: 2 }}>
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <IconButton
            color="inherit"
            onClick={handleUserMenuOpen}
            sx={{ ml: 2 }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>
              {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.displayName || user?.email}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleUserMenuClose}>
              <SettingsIcon sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/apps" element={
            <ProtectedRoute>
              <Apps />
            </ProtectedRoute>
          } />
          <Route path="/live-chat" element={
            <ProtectedRoute>
              <LiveChat />
            </ProtectedRoute>
          } />
                  <Route path="/data-agent" element={
                    <ProtectedRoute>
                      <DataAgentDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-learning" element={
                    <ProtectedRoute>
                      <AILearningLoop />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-rules" element={
                    <ProtectedRoute>
                      <AILearningRules />
                    </ProtectedRoute>
                  } />
                  <Route path="/os-platform" element={
                    <ProtectedRoute>
                      <OperatingSystemsList />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
          <Route path="/auth" element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          } />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;

