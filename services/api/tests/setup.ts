/**
 * Test Setup
 * Global test configuration and mocks
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_NAME = 'auraos_test';
process.env.DATABASE_USER = 'auraos_test';
process.env.DATABASE_PASSWORD = 'test_password';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.API_PORT = '3002';

// Increase test timeout for integration tests
jest.setTimeout(10000);
