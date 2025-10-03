import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Window } from '../Window';
import { WindowState } from '../../types/window';

describe('Window Component', () => {
  const mockWindow: WindowState = {
    id: 'test-window',
    title: 'Test Window',
    component: () => <div>Test Content</div>,
    position: { x: 100, y: 100 },
    size: { width: 800, height: 600 },
    zIndex: 1000,
    isMinimized: false,
    isMaximized: false,
    isActive: true,
    icon: '📝',
  };

  const mockHandlers = {
    onClose: vi.fn(),
    onMinimize: vi.fn(),
    onMaximize: vi.fn(),
    onFocus: vi.fn(),
    onMove: vi.fn(),
    onResize: vi.fn(),
  };

  it('renders window with title', () => {
    render(<Window window={mockWindow} {...mockHandlers} />);
    expect(screen.getByText('Test Window')).toBeInTheDocument();
  });

  it('renders window icon', () => {
    render(<Window window={mockWindow} {...mockHandlers} />);
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('renders window content', () => {
    render(<Window window={mockWindow} {...mockHandlers} />);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<Window window={mockWindow} {...mockHandlers} />);
    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);
    expect(mockHandlers.onClose).toHaveBeenCalledWith('test-window');
  });

  it('calls onMinimize when minimize button is clicked', () => {
    render(<Window window={mockWindow} {...mockHandlers} />);
    const minimizeButton = screen.getByTitle('Minimize');
    fireEvent.click(minimizeButton);
    expect(mockHandlers.onMinimize).toHaveBeenCalledWith('test-window');
  });

  it('calls onMaximize when maximize button is clicked', () => {
    render(<Window window={mockWindow} {...mockHandlers} />);
    const maximizeButton = screen.getByTitle('Maximize');
    fireEvent.click(maximizeButton);
    expect(mockHandlers.onMaximize).toHaveBeenCalledWith('test-window');
  });

  it('does not render when minimized', () => {
    const minimizedWindow = { ...mockWindow, isMinimized: true };
    const { container } = render(<Window window={minimizedWindow} {...mockHandlers} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies maximized styles when maximized', () => {
    const maximizedWindow = { ...mockWindow, isMaximized: true };
    render(<Window window={maximizedWindow} {...mockHandlers} />);
    const windowElement = screen.getByText('Test Window').closest('.window');
    expect(windowElement).toHaveStyle({
      position: 'fixed',
      top: '0',
      left: '0',
    });
  });

  it('applies active class when window is active', () => {
    render(<Window window={mockWindow} {...mockHandlers} />);
    const windowElement = screen.getByText('Test Window').closest('.window');
    expect(windowElement).toHaveClass('active');
  });

  it('does not show resize handle when maximized', () => {
    const maximizedWindow = { ...mockWindow, isMaximized: true };
    const { container } = render(<Window window={maximizedWindow} {...mockHandlers} />);
    const resizeHandle = container.querySelector('.window-resize-handle');
    expect(resizeHandle).toBeNull();
  });

  it('shows resize handle when not maximized', () => {
    const { container } = render(<Window window={mockWindow} {...mockHandlers} />);
    const resizeHandle = container.querySelector('.window-resize-handle');
    expect(resizeHandle).toBeInTheDocument();
  });
});
