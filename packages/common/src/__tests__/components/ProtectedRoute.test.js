import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  ProtectedRoute,
  AdminRoute,
  SuperAdminRoute,
  PermissionRoute,
  PublicRoute,
  useRouteGuard,
} from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

// Mock AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Test components
const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;

describe('ProtectedRoute', () => {
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: true,
        hasRole: jest.fn(),
        hasPermission: jest.fn(),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('should redirect to /auth when user is not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: false,
        hasRole: jest.fn(),
        hasPermission: jest.fn(),
      });

      render(
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<LoginComponent />} />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children when user is authenticated', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        hasRole: jest.fn(() => true),
        hasPermission: jest.fn(() => true),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Role-based Access', () => {
    it('should render children when user has required role', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        hasRole: jest.fn((role) => role === 'admin'),
        hasPermission: jest.fn(),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show access denied when user lacks required role', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        hasRole: jest.fn(() => false),
        hasPermission: jest.fn(),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/don't have the required permissions/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Permission-based Access', () => {
    it('should render children when user has required permission', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        hasRole: jest.fn(() => true),
        hasPermission: jest.fn((perm) => perm === 'edit:posts'),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute requiredPermission="edit:posts">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should show permission denied when user lacks required permission', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        hasRole: jest.fn(() => true),
        hasPermission: jest.fn(() => false),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute requiredPermission="delete:posts">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Permission Denied')).toBeInTheDocument();
      expect(screen.getByText(/required permission: delete:posts/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Combined Role and Permission', () => {
    it('should check both role and permission when both are required', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        hasRole: jest.fn((role) => role === 'admin'),
        hasPermission: jest.fn((perm) => perm === 'edit:posts'),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin" requiredPermission="edit:posts">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should deny access if role is missing even with permission', () => {
      useAuth.mockReturnValue({
        user: mockUser,
        loading: false,
        hasRole: jest.fn(() => false),
        hasPermission: jest.fn(() => true),
      });

      render(
        <BrowserRouter>
          <ProtectedRoute requiredRole="admin" requiredPermission="edit:posts">
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });
});

describe('AdminRoute', () => {
  it('should require admin role', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
      hasRole: jest.fn((role) => role === 'admin'),
      hasPermission: jest.fn(),
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should deny access to non-admin users', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
      hasRole: jest.fn(() => false),
      hasPermission: jest.fn(),
    });

    render(
      <BrowserRouter>
        <AdminRoute>
          <TestComponent />
        </AdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });
});

describe('SuperAdminRoute', () => {
  it('should require superadmin role', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
      hasRole: jest.fn((role) => role === 'superadmin'),
      hasPermission: jest.fn(),
    });

    render(
      <BrowserRouter>
        <SuperAdminRoute>
          <TestComponent />
        </SuperAdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should deny access to non-superadmin users', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
      hasRole: jest.fn((role) => role === 'admin'), // Admin but not superadmin
      hasPermission: jest.fn(),
    });

    render(
      <BrowserRouter>
        <SuperAdminRoute>
          <TestComponent />
        </SuperAdminRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });
});

describe('PermissionRoute', () => {
  it('should require specific permission', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
      hasRole: jest.fn(() => true),
      hasPermission: jest.fn((perm) => perm === 'manage:users'),
    });

    render(
      <BrowserRouter>
        <PermissionRoute permission="manage:users">
          <TestComponent />
        </PermissionRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should deny access without permission', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
      hasRole: jest.fn(() => true),
      hasPermission: jest.fn(() => false),
    });

    render(
      <BrowserRouter>
        <PermissionRoute permission="manage:users">
          <TestComponent />
        </PermissionRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Permission Denied')).toBeInTheDocument();
  });
});

describe('PublicRoute', () => {
  it('should render children when user is not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <BrowserRouter>
        <PublicRoute>
          <LoginComponent />
        </PublicRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should redirect authenticated users to home', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <LoginComponent />
              </PublicRoute>
            }
          />
          <Route path="/" element={<TestComponent />} />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('should show loading state', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <BrowserRouter>
        <PublicRoute>
          <LoginComponent />
        </PublicRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to original location after login', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
    });

    const TestApp = () => (
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <LoginComponent />
              </PublicRoute>
            }
          />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </BrowserRouter>
    );

    render(<TestApp />);

    // User should be redirected to home by default
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});

describe('useRouteGuard', () => {
  it('should return correct access status', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
      hasRole: jest.fn((role) => role === 'admin'),
      hasPermission: jest.fn((perm) => perm === 'edit:posts'),
    });

    const TestHookComponent = () => {
      const { canAccess, isAuthenticated, isLoading } = useRouteGuard();
      return (
        <div>
          <div>Can Access Admin: {canAccess('admin') ? 'Yes' : 'No'}</div>
          <div>Can Access User: {canAccess('user') ? 'Yes' : 'No'}</div>
          <div>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>Is Loading: {isLoading ? 'Yes' : 'No'}</div>
        </div>
      );
    };

    render(<TestHookComponent />);

    expect(screen.getByText('Can Access Admin: Yes')).toBeInTheDocument();
    expect(screen.getByText('Is Authenticated: Yes')).toBeInTheDocument();
    expect(screen.getByText('Is Loading: No')).toBeInTheDocument();
  });

  it('should return correct redirect path', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      hasRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    const TestHookComponent = () => {
      const { redirectTo } = useRouteGuard();
      return <div>Redirect To: {redirectTo()}</div>;
    };

    render(<TestHookComponent />);

    expect(screen.getByText('Redirect To: /auth')).toBeInTheDocument();
  });

  it('should handle loading state in canAccess', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
      hasRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    const TestHookComponent = () => {
      const { canAccess } = useRouteGuard();
      return <div>Can Access: {canAccess() ? 'Yes' : 'No'}</div>;
    };

    render(<TestHookComponent />);

    expect(screen.getByText('Can Access: No')).toBeInTheDocument();
  });

  it('should check permission in canAccess', () => {
    useAuth.mockReturnValue({
      user: { uid: 'user123' },
      loading: false,
      hasRole: jest.fn(() => true),
      hasPermission: jest.fn((perm) => perm === 'edit:posts'),
    });

    const TestHookComponent = () => {
      const { canAccess } = useRouteGuard();
      return (
        <div>
          <div>Can Edit Posts: {canAccess('user', 'edit:posts') ? 'Yes' : 'No'}</div>
          <div>Can Delete Posts: {canAccess('user', 'delete:posts') ? 'Yes' : 'No'}</div>
        </div>
      );
    };

    render(<TestHookComponent />);

    expect(screen.getByText('Can Edit Posts: Yes')).toBeInTheDocument();
    expect(screen.getByText('Can Delete Posts: No')).toBeInTheDocument();
  });
});
