import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Chrome DevTools Protocol
global.chrome = {
  debugger: {
    attach: vi.fn(),
    detach: vi.fn(),
    sendCommand: vi.fn(),
    onEvent: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
} as any;

// Mock WebSocket for debugging protocol
global.WebSocket = class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(public url: string) {
    setTimeout(() => {
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data: string) {
    // Mock send
  }

  close() {
    if (this.onclose) this.onclose();
  }
} as any;
