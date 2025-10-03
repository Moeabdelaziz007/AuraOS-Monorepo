/**
 * Test utilities for terminal tests
 */

import { vi } from 'vitest';
import type { MCPHook } from '../AICommandExecutor';

/**
 * Create mock MCP hook
 */
export const createMockMCP = (): MCPHook => ({
  file: {
    read: vi.fn().mockResolvedValue('file content'),
    write: vi.fn().mockResolvedValue('File written successfully'),
    list: vi.fn().mockResolvedValue('file1.txt\nfile2.txt\ndir1/'),
    search: vi.fn().mockResolvedValue('Found in file1.txt: match'),
    delete: vi.fn().mockResolvedValue('File deleted'),
  },
  emulator: {
    run: vi.fn().mockResolvedValue({
      output: 'Program output',
      success: true,
      explanation: 'Executed successfully',
    }),
    generate: vi.fn().mockResolvedValue('10 PRINT "HELLO"\n20 END'),
    execute: vi.fn().mockResolvedValue({
      code: '10 PRINT "HELLO"',
      output: 'HELLO',
      success: true,
      explanation: 'Program executed',
    }),
    getState: vi.fn().mockResolvedValue({ running: false }),
  },
  ai: {
    chat: vi.fn().mockResolvedValue('AI response'),
    analyzeCode: vi.fn().mockResolvedValue('Code analysis'),
    fixCode: vi.fn().mockResolvedValue('Fixed code'),
    explainCode: vi.fn().mockResolvedValue('Code explanation'),
    suggestImprovements: vi.fn().mockResolvedValue('Improvement suggestions'),
  },
  execute: vi.fn().mockResolvedValue({ success: true }),
  loading: false,
  error: null,
  initialized: true,
});

/**
 * Create mock context for client commands
 */
export const createMockContext = () => ({
  clearOutput: vi.fn(),
  getHistory: vi.fn().mockReturnValue(['command1', 'command2', 'command3']),
  setTheme: vi.fn(),
});

/**
 * Reset all mocks
 */
export const resetMocks = (mcp: MCPHook) => {
  Object.values(mcp.file).forEach(fn => {
    if (typeof fn === 'function') (fn as any).mockClear();
  });
  Object.values(mcp.emulator).forEach(fn => {
    if (typeof fn === 'function') (fn as any).mockClear();
  });
  Object.values(mcp.ai).forEach(fn => {
    if (typeof fn === 'function') (fn as any).mockClear();
  });
  (mcp.execute as any).mockClear();
};
