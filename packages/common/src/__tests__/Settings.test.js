import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from '../pages/Settings';
import { FirebaseProvider } from '../services/FirebaseService';
import { systemAPI } from '../services/api';

// Mock the API services
jest.mock('../services/api');
jest.mock('../services/FirebaseService', () => ({
  FirebaseProvider: ({ children }) => <div>{children}</div>,
  useFirebase: () => ({ loading: false })
}));

const mockSystemConfig = {
  projectId: 'aios-57775401',
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'http://localhost:3000'
};

const mockLogs = [
  {
    id: 'log1',
    level: 'info',
    message: 'System started successfully',
    timestamp: new Date(),
    metadata: { source: 'system' }
  },
  {
    id: 'log2',
    level: 'error',
    message: 'Failed to connect to database',
    timestamp: new Date(),
    metadata: { source: 'database' }
  }
];

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    systemAPI.getConfig.mockResolvedValue(mockSystemConfig);
    systemAPI.getLogs.mockResolvedValue({ logs: mockLogs });
    systemAPI.createLog.mockResolvedValue({ id: 'newLog', message: 'Log created' });
  });

  test('renders settings page with all sections', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('AIOS Settings')).toBeInTheDocument();
      expect(screen.getByText('System Configuration')).toBeInTheDocument();
      expect(screen.getByText('User Preferences')).toBeInTheDocument();
      expect(screen.getByText('System Logs')).toBeInTheDocument();
      expect(screen.getByText('Security Settings')).toBeInTheDocument();
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    });
  });

  test('displays system configuration', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Project ID: aios-57775401')).toBeInTheDocument();
      expect(screen.getByText('API URL: http://localhost:3000/api')).toBeInTheDocument();
      expect(screen.getByText('WebSocket URL: http://localhost:3000')).toBeInTheDocument();
    });
  });

  test('handles user preference changes', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Enable Notifications')).toBeInTheDocument();
    });

    const notificationSwitch = screen.getByLabelText('Enable Notifications');
    fireEvent.click(notificationSwitch);

    expect(notificationSwitch).toBeChecked();
  });

  test('displays system logs', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('System started successfully')).toBeInTheDocument();
      expect(screen.getByText('Failed to connect to database')).toBeInTheDocument();
    });
  });

  test('clears logs when clear button is clicked', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Clear Logs')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear Logs');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(systemAPI.createLog).toHaveBeenCalledWith({
        level: 'info',
        message: 'Logs cleared by user',
        metadata: { action: 'clear_logs' }
      });
    });
  });

  test('refreshes configuration when refresh button is clicked', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Refresh Config')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh Config');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(systemAPI.getConfig).toHaveBeenCalledTimes(2);
      expect(systemAPI.getLogs).toHaveBeenCalledTimes(2);
    });
  });

  test('shows empty logs state', async () => {
    systemAPI.getLogs.mockResolvedValue({ logs: [] });

    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No logs available')).toBeInTheDocument();
      expect(screen.getByText('System logs will appear here')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    systemAPI.getConfig.mockRejectedValue(new Error('Config API Error'));
    systemAPI.getLogs.mockRejectedValue(new Error('Logs API Error'));

    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Config API Error')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    systemAPI.getConfig.mockImplementation(() => new Promise(() => {}));
    systemAPI.getLogs.mockImplementation(() => new Promise(() => {}));

    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    expect(screen.getByText('Loading settings...')).toBeInTheDocument();
  });

  test('updates API timeout setting', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('API Timeout (ms)')).toBeInTheDocument();
    });

    const timeoutInput = screen.getByLabelText('API Timeout (ms)');
    fireEvent.change(timeoutInput, { target: { value: '15000' } });

    expect(timeoutInput.value).toBe('15000');
  });

  test('displays security settings information', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Firebase Authentication is enabled')).toBeInTheDocument();
      expect(screen.getByText('CORS is configured for development')).toBeInTheDocument();
      expect(screen.getByText('API endpoints are protected')).toBeInTheDocument();
    });
  });

  test('displays notification settings', async () => {
    render(
      <FirebaseProvider>
        <Settings />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('App Status Changes')).toBeInTheDocument();
      expect(screen.getByText('System Alerts')).toBeInTheDocument();
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });
  });
});
