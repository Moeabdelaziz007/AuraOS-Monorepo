/**
 * Code Splitting Utilities
 * Advanced code splitting strategies for optimal performance
 */

import { lazy, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="error-boundary">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

/**
 * Create lazy component with error boundary and loading state
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <ErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Lazy component error:', error, errorInfo);
      }}
    >
      <React.Suspense fallback={<LoadingSpinner />}>
        <LazyComponent {...props} />
      </React.Suspense>
    </ErrorBoundary>
  );
};

/**
 * Route-based code splitting
 */
export const createLazyRoute = (importFunc: () => Promise<any>) => {
  return createLazyComponent(importFunc);
};

/**
 * Component-based code splitting with preloading
 */
export const createLazyComponentWithPreload = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  preloadFunc?: () => Promise<any>
) => {
  const LazyComponent = lazy(importFunc);
  
  // Preload function
  const preload = () => {
    if (preloadFunc) {
      preloadFunc();
    }
    importFunc();
  };
  
  return {
    Component: (props: any) => (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <React.Suspense fallback={<LoadingSpinner />}>
          <LazyComponent {...props} />
        </React.Suspense>
      </ErrorBoundary>
    ),
    preload
  };
};

/**
 * Library splitting utilities
 */
export const splitLibraries = {
  // Split large libraries
  lodash: () => import('lodash'),
  moment: () => import('moment'),
  'framer-motion': () => import('framer-motion'),
  
  // Split UI libraries
  'react-router': () => import('react-router-dom'),
  'react-query': () => import('@tanstack/react-query'),
  
  // Split utility libraries
  'date-fns': () => import('date-fns'),
  'uuid': () => import('uuid'),
};

/**
 * Dynamic import with retry logic
 */
export const dynamicImportWithRetry = async <T>(
  importFunc: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await importFunc();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};

/**
 * Bundle analyzer configuration
 */
export const bundleAnalyzerConfig = {
  analyzerMode: 'static',
  openAnalyzer: false,
  generateStatsFile: true,
  statsFilename: 'bundle-stats.json',
  reportFilename: 'bundle-report.html',
  defaultSizes: 'gzip',
  excludeAssets: ['node_modules'],
};

/**
 * Performance monitoring for code splitting
 */
export const performanceMonitor = {
  trackChunkLoad: (chunkName: string, loadTime: number) => {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`chunk-${chunkName}-loaded`);
      window.performance.measure(
        `chunk-${chunkName}-load-time`,
        `chunk-${chunkName}-start`,
        `chunk-${chunkName}-loaded`
      );
    }
  },
  
  trackComponentLoad: (componentName: string, loadTime: number) => {
    console.log(`Component ${componentName} loaded in ${loadTime}ms`);
  },
  
  trackMemoryUsage: () => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};
