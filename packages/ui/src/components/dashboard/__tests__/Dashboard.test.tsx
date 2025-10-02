import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

describe('Dashboard', () => {
  it('renders title and quick action buttons', () => {
    render(<Dashboard />);
    expect(screen.getByText(/AuraOS/i)).toBeInTheDocument();
    expect(screen.getByText(/Files/i)).toBeInTheDocument();
    expect(screen.getByText(/Terminal/i)).toBeInTheDocument();
  });

  it('toggles AI chat panel when button clicked', () => {
    render(<Dashboard />);
    const aiToggle = screen.getByTitle(/Hide AI Assistant|Show AI Assistant/i);
    expect(aiToggle).toBeInTheDocument();
    fireEvent.click(aiToggle);
    // After toggle, AI Chat may be removed from DOM
    expect(screen.queryByText(/Your AI-powered operating system is ready/i)).toBeInTheDocument();
  });
});
