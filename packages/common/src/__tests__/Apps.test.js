import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Apps from '../pages/Apps';
import { FirebaseProvider } from '../services/FirebaseService';
import { appsAPI } from '../services/api';

// Mock the API services
jest.mock('../services/api');
jest.mock('../services/FirebaseService', () => ({
  FirebaseProvider: ({ children }) => <div>{children}</div>,
  useFirebase: () => ({ loading: false })
}));

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

describe('Apps Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    appsAPI.getAll.mockResolvedValue({ apps: mockApps });
    appsAPI.create.mockResolvedValue({ id: 'newApp', ...mockApps[0] });
    appsAPI.update.mockResolvedValue({ id: 'app1', ...mockApps[0] });
    appsAPI.delete.mockResolvedValue({ message: 'App deleted successfully' });
    appsAPI.toggleStatus.mockResolvedValue({ id: 'app1', status: 'inactive' });
  });

  test('renders apps page with app list', async () => {
    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('AIOS Applications')).toBeInTheDocument();
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
      expect(screen.getByText('Test App 2')).toBeInTheDocument();
    });
  });

  test('opens create app dialog', async () => {
    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Add App')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add App');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New App')).toBeInTheDocument();
      expect(screen.getByLabelText('App Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
    });
  });

  test('creates new app successfully', async () => {
    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Add App')).toBeInTheDocument();
    });

    // Open dialog
    const addButton = screen.getByText('Add App');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New App')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByLabelText('App Name');
    const descriptionInput = screen.getByLabelText('Description');
    const createButton = screen.getByText('Create');

    fireEvent.change(nameInput, { target: { value: 'New Test App' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Test Description' } });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(appsAPI.create).toHaveBeenCalledWith({
        name: 'New Test App',
        description: 'New Test Description',
        category: 'general',
        config: {}
      });
    });
  });

  test('edits existing app', async () => {
    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit App')).toBeInTheDocument();
    });

    // Update form
    const nameInput = screen.getByLabelText('App Name');
    const updateButton = screen.getByText('Update');

    fireEvent.change(nameInput, { target: { value: 'Updated App Name' } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(appsAPI.update).toHaveBeenCalledWith('app1', {
        name: 'Updated App Name',
        description: 'Test Description 1',
        category: 'general',
        config: {}
      });
    });
  });

  test('toggles app status', async () => {
    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });

    // Click stop button for active app
    const stopButtons = screen.getAllByText('Stop');
    fireEvent.click(stopButtons[0]);

    await waitFor(() => {
      expect(appsAPI.toggleStatus).toHaveBeenCalledWith('app1', 'inactive');
    });
  });

  test('deletes app with confirmation', async () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test App 1')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this app?');
      expect(appsAPI.delete).toHaveBeenCalledWith('app1');
    });
  });

  test('shows empty state when no apps', async () => {
    appsAPI.getAll.mockResolvedValue({ apps: [] });

    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Apps Available')).toBeInTheDocument();
      expect(screen.getByText('Create your first AI-powered application to get started with AIOS.')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    appsAPI.getAll.mockRejectedValue(new Error('API Error'));

    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  test('refreshes app list', async () => {
    render(
      <FirebaseProvider>
        <Apps />
      </FirebaseProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(appsAPI.getAll).toHaveBeenCalledTimes(2);
    });
  });
});
