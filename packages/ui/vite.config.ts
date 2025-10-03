import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@auraos/core': path.resolve(__dirname, '../core/src'),
      '@auraos/ai': path.resolve(__dirname, '../ai/src'),
      '@auraos/firebase': path.resolve(__dirname, '../firebase/src/index.ts'),
      '@auraos/hooks': path.resolve(__dirname, '../hooks/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});
