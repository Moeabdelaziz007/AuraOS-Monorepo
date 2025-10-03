import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
      // Enable babel plugins for optimization
      babel: {
        plugins: [
          // Remove console.log in production
          process.env.NODE_ENV === 'production' && [
            'transform-remove-console',
            { exclude: ['error', 'warn'] }
          ]
        ].filter(Boolean)
      }
    }),
    // Bundle analyzer
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  
  resolve: {
    alias: {
      '@auraos/core': resolve(__dirname, 'packages/core/src'),
      '@auraos/ui': resolve(__dirname, 'packages/ui/src'),
      '@auraos/ai': resolve(__dirname, 'packages/ai/src'),
      '@auraos/hooks': resolve(__dirname, 'packages/hooks/src'),
      '@auraos/common': resolve(__dirname, 'packages/common/src'),
      '@auraos/desktop': resolve(__dirname, 'apps/desktop/src'),
      '@auraos/terminal': resolve(__dirname, 'apps/terminal/src'),
      '@auraos/debugger': resolve(__dirname, 'apps/debugger/src')
    }
  },
  
  build: {
    // Target modern browsers for better optimization
    target: 'es2020',
    
    // Enable source maps for debugging
    sourcemap: true,
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['framer-motion', '@tanstack/react-query'],
          'utils-vendor': ['lodash', 'date-fns', 'uuid'],
          
          // App chunks
          'desktop-app': ['@auraos/desktop'],
          'terminal-app': ['@auraos/terminal'],
          'debugger-app': ['@auraos/debugger'],
          
          // Core chunks
          'core-ai': ['@auraos/ai'],
          'core-hooks': ['@auraos/hooks'],
          'core-common': ['@auraos/common']
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(extType || '')) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    
    // Enable CSS code splitting
    cssCodeSplit: true,
    
    // Optimize minification
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        unused: true,
        // Optimize conditionals
        conditionals: true,
        // Optimize comparisons
        comparisons: true,
        // Optimize evaluations
        evaluate: true,
        // Optimize booleans
        booleans: true,
        // Optimize loops
        loops: true,
        // Optimize if statements
        if_return: true,
        // Optimize join variables
        join_vars: true,
        // Optimize sequences
        sequences: true
      },
      mangle: {
        // Mangle class names
        keep_classnames: false,
        // Mangle function names
        keep_fnames: false
      }
    },
    
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable tree shaking
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    }
  },
  
  // Development server optimization
  server: {
    // Enable HMR
    hmr: true,
    // Optimize file watching
    watch: {
      usePolling: false,
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  },
  
  // CSS optimization
  css: {
    // Enable CSS modules
    modules: {
      localsConvention: 'camelCase'
    },
    // Optimize CSS
    postcss: {
      plugins: [
        // Autoprefixer for browser compatibility
        require('autoprefixer'),
        // CSS optimization
        require('cssnano')({
          preset: 'default'
        })
      ]
    }
  },
  
  // Environment variables
  define: {
    // Define global constants
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@tanstack/react-query'
    ],
    exclude: [
      '@auraos/core',
      '@auraos/ui',
      '@auraos/ai'
    ]
  }
});
