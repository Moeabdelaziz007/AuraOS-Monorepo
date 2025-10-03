/**
 * Test setup for Telegram Bot tests
 */

import { vi } from 'vitest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Mock process methods
vi.mock('process', () => ({
  exit: vi.fn(),
  on: vi.fn()
}));

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn(),
  spawn: vi.fn()
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readdir: vi.fn(),
  mkdir: vi.fn(),
  rm: vi.fn(),
  stat: vi.fn(),
  copyFile: vi.fn(),
  rename: vi.fn()
}));

// Mock node-telegram-bot-api
vi.mock('node-telegram-bot-api', () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    sendMessage: vi.fn(),
    answerCallbackQuery: vi.fn(),
    stopPolling: vi.fn()
  }))
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  config: vi.fn()
}));

// Set up test environment variables
process.env.TELEGRAM_BOT_TOKEN = 'test-token';
process.env.TELEGRAM_CHAT_ID = '123456789';
process.env.ADMIN_USER_IDS = '123456789';
