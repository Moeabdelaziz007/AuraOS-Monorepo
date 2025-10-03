import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import monorepoAlias from 'vite-plugin-monorepo-alias';

export default defineConfig({
  plugins: [react()],
  plugins: [monorepoAlias(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@auraos/firebase': path.resolve(__dirname, '../firebase/src/index.ts'),
      '@auraos/hooks': path.resolve(__dirname, '../hooks/src/index.ts'),
      // The monorepo-alias plugin will handle the workspace aliases automatically
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
