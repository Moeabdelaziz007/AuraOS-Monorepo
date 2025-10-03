/**
 * Test utilities and mocks for MCP server tests
 */

import { vi } from 'vitest';

// Mock Firestore
export const mockFirestore = {
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
};

// Mock Firebase db
export const mockDb = {};

// Mock document snapshot
export const createMockDocSnapshot = (data: any, exists = true) => ({
  exists: () => exists,
  data: () => data,
  id: data?.id || 'mock-id',
});

// Mock query snapshot
export const createMockQuerySnapshot = (docs: any[]) => ({
  empty: docs.length === 0,
  docs: docs.map(data => createMockDocSnapshot(data)),
});

// Mock note data
export const createMockNote = (overrides = {}) => ({
  id: 'note-123',
  title: 'Test Note',
  content: 'Test content',
  userId: 'user-123',
  folderId: undefined,
  tags: ['test'],
  isPinned: false,
  isArchived: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mock folder data
export const createMockFolder = (overrides = {}) => ({
  id: 'folder-123',
  name: 'Test Folder',
  userId: 'user-123',
  parentId: undefined,
  color: '#1976d2',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

// Mock Gemini service
export const mockGeminiService = {
  chat: vi.fn(),
  chatStream: vi.fn(),
  embed: vi.fn(),
};

// Setup Firestore mocks
export const setupFirestoreMocks = () => {
  vi.mock('firebase/firestore', () => ({
    collection: mockFirestore.collection,
    doc: mockFirestore.doc,
    getDoc: mockFirestore.getDoc,
    getDocs: mockFirestore.getDocs,
    setDoc: mockFirestore.setDoc,
    updateDoc: mockFirestore.updateDoc,
    deleteDoc: mockFirestore.deleteDoc,
    query: mockFirestore.query,
    where: mockFirestore.where,
    orderBy: mockFirestore.orderBy,
    limit: mockFirestore.limit,
    serverTimestamp: mockFirestore.serverTimestamp,
  }));

  vi.mock('@auraos/firebase/src/config/firebase', () => ({
    db: mockDb,
  }));
};

// Setup Gemini mocks
export const setupGeminiMocks = () => {
  vi.mock('@auraos/ai/src/services/gemini.service', () => ({
    geminiService: mockGeminiService,
  }));
};

// Reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
  Object.values(mockFirestore).forEach(mock => {
    if (typeof mock === 'function') mock.mockReset();
  });
  Object.values(mockGeminiService).forEach(mock => {
    if (typeof mock === 'function') mock.mockReset();
  });
};

// Mock logger to prevent console output during tests
export const setupLoggerMock = () => {
  global.logger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  } as any;
};
