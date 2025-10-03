import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    include: [
      'packages/**/*.{test,spec}.{js,ts,tsx}',
      'apps/**/*.{test,spec}.{js,ts,tsx}',
      'services/**/*.{test,spec}.{js,ts,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '**/coverage/**'
    ]
  },
  resolve: {
    alias: {
      '@auraos/core': resolve(__dirname, 'packages/core/src'),
      '@auraos/ui': resolve(__dirname, 'packages/ui/src'),
      '@auraos/ai': resolve(__dirname, 'packages/ai/src'),
      '@auraos/hooks': resolve(__dirname, 'packages/hooks/src'),
      '@auraos/common': resolve(__dirname, 'packages/common/src')
    }
  }
});
