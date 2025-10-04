/**
 * Code Splitting Utilities
 * Advanced code splitting strategies for optimal performance
 */

import React, { lazy, ComponentType, Suspense } from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
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
    <Suspense fallback={<LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
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
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent {...props} />
      </Suspense>
    ),
    preload
  };
};

/**
 * Library splitting utilities
 * Note: Only include libraries that are actually installed
 */
export const splitLibraries = {
  // Split UI libraries
  reactRouter: () => import('react-router-dom'),
  
  // Split utility libraries
  dateFns: () => import('date-fns'),
  
  // Commented out - install if needed:
  // lodash: () => import('lodash'),
  // moment: () => import('moment'),
  // framerMotion: () => import('framer-motion'),
  // reactQuery: () => import('@tanstack/react-query'),
  // uuid: () => import('uuid'),
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
    console.info(`Component ${componentName} loaded in ${loadTime}ms`);
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
