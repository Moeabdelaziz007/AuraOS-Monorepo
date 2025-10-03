/**
 * Lazy Components with Advanced Loading Strategies
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import { createLazyComponent, createLazyComponentWithPreload } from '../utils/codeSplitting';

// Desktop App Components
export const LazyDesktopApp = createLazyComponent(
  () => import('@auraos/desktop').then(module => ({ default: module.DesktopApp }))
);

export const LazyWindowManager = createLazyComponent(
  () => import('@auraos/desktop').then(module => ({ default: module.WindowManager }))
);

export const LazyTaskbar = createLazyComponent(
  () => import('@auraos/desktop').then(module => ({ default: module.Taskbar }))
);

// Terminal App Components
export const LazyTerminalApp = createLazyComponent(
  () => import('@auraos/terminal').then(module => ({ default: module.TerminalApp }))
);

export const LazyTerminalEmulator = createLazyComponent(
  () => import('@auraos/terminal').then(module => ({ default: module.TerminalEmulator }))
);

// Debugger App Components
export const LazyDebuggerApp = createLazyComponent(
  () => import('@auraos/debugger').then(module => ({ default: module.DebuggerApp }))
);

export const LazyCPUViewer = createLazyComponent(
  () => import('@auraos/debugger').then(module => ({ default: module.CPUViewer }))
);

export const LazyMemoryViewer = createLazyComponent(
  () => import('@auraos/debugger').then(module => ({ default: module.MemoryViewer }))
);

// UI Components with Preloading
export const LazyFileManager = createLazyComponentWithPreload(
  () => import('./FileManager/FileManager'),
  () => import('./FileManager/FileManager').then(module => module.preload)
);

export const LazyTextEditor = createLazyComponentWithPreload(
  () => import('./TextEditor/TextEditor'),
  () => import('./TextEditor/TextEditor').then(module => module.preload)
);

export const LazyImageEditor = createLazyComponentWithPreload(
  () => import('./ImageEditor/ImageEditor'),
  () => import('./ImageEditor/ImageEditor').then(module => module.preload)
);

// Advanced Lazy Loading with Intersection Observer
export const LazyWithIntersection = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = { rootMargin: '50px' }
) => {
  const LazyComponent = lazy(importFunc);
  
  return React.forwardRef<any, any>((props, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const elementRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        options
      );
      
      if (elementRef.current) {
        observer.observe(elementRef.current);
      }
      
      return () => observer.disconnect();
    }, []);
    
    return (
      <div ref={elementRef}>
        {isVisible ? (
          <Suspense fallback={<div className="loading-placeholder">Loading...</div>}>
            <LazyComponent {...props} ref={ref} />
          </Suspense>
        ) : (
          <div className="loading-placeholder">Loading...</div>
        )}
      </div>
    );
  });
};

// Lazy Loading with Priority
export const createPriorityLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  priority: 'high' | 'medium' | 'low' = 'medium'
) => {
  const LazyComponent = lazy(importFunc);
  
  const PriorityComponent = (props: any) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    
    React.useEffect(() => {
      const loadComponent = async () => {
        const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;
        await new Promise(resolve => setTimeout(resolve, delay));
        setIsLoaded(true);
      };
      
      loadComponent();
    }, [priority]);
    
    if (!isLoaded) {
      return <div className="loading-placeholder">Loading...</div>;
    }
    
    return (
      <Suspense fallback={<div className="loading-placeholder">Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
  
  return PriorityComponent;
};

// Lazy Loading with Caching
export const createCachedLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  cacheKey: string
) => {
  const cache = new Map<string, ComponentType<any>>();
  
  const LazyComponent = lazy(async () => {
    if (cache.has(cacheKey)) {
      return { default: cache.get(cacheKey)! };
    }
    
    const module = await importFunc();
    cache.set(cacheKey, module.default);
    return module;
  });
  
  return (props: any) => (
    <Suspense fallback={<div className="loading-placeholder">Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Lazy Loading with Error Recovery
export const createResilientLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackComponent?: ComponentType<any>
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => {
    const [hasError, setHasError] = React.useState(false);
    
    const handleError = (error: Error) => {
      console.error('Lazy component error:', error);
      setHasError(true);
    };
    
    if (hasError && fallbackComponent) {
      return React.createElement(fallbackComponent, props);
    }
    
    return (
      <Suspense fallback={<div className="loading-placeholder">Loading...</div>}>
        <ErrorBoundary onError={handleError}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
};
