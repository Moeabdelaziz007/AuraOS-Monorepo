import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@auraos/firebase': path.resolve(__dirname, '../firebase/src'),
      '@auraos/hooks': path.resolve(__dirname, '../hooks/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['@auraos/ui/contexts/AuthContext'],
    },
  },
});
