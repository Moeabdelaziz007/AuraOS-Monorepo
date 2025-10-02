import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

// Protected Route Component
export const ProtectedRoute = ({ children, requiredRole = 'user', requiredPermission = null }) => {
  const { user, loading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <Typography variant="h4" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have the required permissions to access this page.
        </Typography>
      </Box>
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <Typography variant="h4" color="error" gutterBottom>
          Permission Denied
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You don't have the required permission: {requiredPermission}
        </Typography>
      </Box>
    );
  }

  return children;
};

// Admin Route Component
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
};

// Super Admin Route Component
export const SuperAdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="superadmin">
      {children}
    </ProtectedRoute>
  );
};

// Permission-based Route Component
export const PermissionRoute = ({ children, permission }) => {
  return (
    <ProtectedRoute requiredPermission={permission}>
      {children}
    </ProtectedRoute>
  );
};

// Public Route Component (redirects authenticated users)
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (user) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Route Guard Hook
export const useRouteGuard = () => {
  const { user, loading, hasRole, hasPermission } = useAuth();

  const canAccess = (requiredRole = 'user', requiredPermission = null) => {
    if (loading) return false;
    if (!user) return false;
    if (requiredRole && !hasRole(requiredRole)) return false;
    if (requiredPermission && !hasPermission(requiredPermission)) return false;
    return true;
  };

  const redirectTo = () => {
    if (!user) return '/auth';
    if (!hasRole('user')) return '/unauthorized';
    return null;
  };

  return {
    canAccess,
    redirectTo,
    isAuthenticated: !!user,
    isLoading: loading
  };
};
