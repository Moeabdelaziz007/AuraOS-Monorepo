import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../pages/Dashboard';
import { FirebaseProvider } from '../services/FirebaseService';
import { systemAPI, appsAPI } from '../services/api';

// Mock the API services
jest.mock('../services/api');
jest.mock('../services/FirebaseService', () => ({
  FirebaseProvider: ({ children }) => <div>{children}</div>,
  useFirebase: () => ({ loading: false })
}));

const mockSystemStatus = {
  status: 'online',
  totalApps: 5,
  activeApps: 3,
  inactiveApps: 2,
  timestamp: new Date().toISOString()
};

const mockApps = [
  {
    id: 'app1',
    name: 'Test App 1',
    description: 'Test Description 1',
    category: 'general',
    status: 'active',
    createdAt: new Date()
  },
  {
    id: 'app2',
    name: 'Test App 2',
    description: 'Test Description 2',
    category: 'ai',
    status: 'inactive',
    createdAt: new Date()
  }
];

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    systemAPI.getStatus.mockResolvedValue(mockSystemStatus);
    appsAPI.getAll.mockResolvedValue({ apps: mockApps });
  });

  test('renders dashboard with system status', async () => {
    render(
      <FirebaseProvider>
        <Dashboard />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('AIOS Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Total Apps')).toBeInTheDocument();
      expect(screen.getByText('Active Apps')).toBeInTheDocument();
      expect(screen.getByText('System Status')).toBeInTheDocument();
    });
  });

  test('displays correct app counts', async () => {
    render(
      <FirebaseProvider>
        <Dashboard />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Total apps
      expect(screen.getByText('3')).toBeInTheDocument(); // Active apps
    });
  });

  test('shows recent apps section', async () => {
    render(
      <FirebaseProvider>
        <Dashboard />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Recent Apps')).toBeInTheDocument();
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.getByText('Test App 2')).toBeInTheDocument();
    });
  });

  test('handles refresh button click', async () => {
    render(
      <FirebaseProvider>
        <Dashboard />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(systemAPI.getStatus).toHaveBeenCalledTimes(2);
      expect(appsAPI.getAll).toHaveBeenCalledTimes(2);
    });
  });

  test('displays error message when API fails', async () => {
    systemAPI.getStatus.mockRejectedValue(new Error('API Error'));
    appsAPI.getAll.mockRejectedValue(new Error('API Error'));

    render(
      <FirebaseProvider>
        <Dashboard />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    systemAPI.getStatus.mockImplementation(() => new Promise(() => {}));
    appsAPI.getAll.mockImplementation(() => new Promise(() => {}));

    render(
      <FirebaseProvider>
        <Dashboard />
      </FirebaseProvider>
    );

    expect(screen.getByText('Loading AIOS Dashboard...')).toBeInTheDocument();
  });

  test('displays empty state when no apps', async () => {
    appsAPI.getAll.mockResolvedValue({ apps: [] });

    render(
      <FirebaseProvider>
        <Dashboard />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No apps available. Create your first app to get started.')).toBeInTheDocument();
    });
  });
});
