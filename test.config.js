/**
 * Test Configuration for AuraOS
 * Comprehensive testing setup for apps, MCP tools, autopilot, and learning loops
 */

export default {
  // Test environment configuration
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/__tests__/**/*.integration.test.{ts,tsx}',
    '**/__tests__/**/*.spec.{ts,tsx}',
    '**/e2e/**/*.spec.{ts,tsx}'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.ts',
    '<rootDir>/test/mocks.ts'
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@auraos/core$': '<rootDir>/packages/core/src',
    '^@auraos/ui$': '<rootDir>/packages/ui/src',
    '^@auraos/ai$': '<rootDir>/packages/ai/src',
    '^@auraos/hooks$': '<rootDir>/packages/hooks/src',
    '^@auraos/common$': '<rootDir>/packages/common/src',
    '^@auraos/desktop$': '<rootDir>/apps/desktop/src',
    '^@auraos/terminal$': '<rootDir>/apps/terminal/src',
    '^@auraos/debugger$': '<rootDir>/apps/debugger/src'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      useESM: true
    }]
  },
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Parallel execution
  maxWorkers: '50%',
  
  // Verbose output
  verbose: true,
  
  // Test categories
  testCategories: {
    unit: {
      pattern: '**/__tests__/**/*.test.{ts,tsx}',
      timeout: 5000
    },
    integration: {
      pattern: '**/__tests__/**/*.integration.test.{ts,tsx}',
      timeout: 15000
    },
    e2e: {
      pattern: '**/e2e/**/*.spec.{ts,tsx}',
      timeout: 30000
    }
  },
  
  // Performance testing
  performance: {
    enabled: true,
    thresholds: {
      memory: '100MB',
      cpu: '80%',
      duration: '30s'
    }
  },
  
  // Mock configuration
  mocks: {
    '@auraos/ai': {
      aiService: {
        chat: 'mock',
        generate: 'mock',
        analyze: 'mock'
      }
    },
    '@auraos/core': {
      mcpCommands: {
        file: 'mock',
        emulator: 'mock'
      }
    }
  },
  
  // Test data
  testData: {
    users: [
      { id: 'user1', name: 'Test User 1' },
      { id: 'user2', name: 'Test User 2' }
    ],
    apps: [
      { id: 'terminal', name: 'Terminal' },
      { id: 'files', name: 'Files' },
      { id: 'debugger', name: 'Debugger' }
    ],
    tasks: [
      { id: 'task1', description: 'Test Task 1' },
      { id: 'task2', description: 'Test Task 2' }
    ]
  }
};
