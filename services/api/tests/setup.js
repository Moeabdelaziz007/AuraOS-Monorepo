// Test setup for backend tests
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.FIREBASE_PROJECT_ID = 'aios-test';
process.env.FIREBASE_API_KEY = 'test-api-key';
process.env.FIREBASE_AUTH_DOMAIN = 'aios-test.firebaseapp.com';
process.env.FIREBASE_STORAGE_BUCKET = 'aios-test.appspot.com';
process.env.FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.FIREBASE_APP_ID = 'test-app-id';
process.env.AIOS_API_URL = 'http://localhost:3000/api';
process.env.AIOS_WS_URL = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000);
