/**
 * Lazy Components with Advanced Loading Strategies
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import { createLazyComponent } from '../utils/codeSplitting';

// Desktop App Components - Using actual app components
export const LazyDashboardApp = createLazyComponent(
  () => import('../apps/DashboardApp').then(module => ({ default: module.DashboardApp }))
);

export const LazyTerminalApp = createLazyComponent(
  () => import('../apps/TerminalApp').then(module => ({ default: module.TerminalApp }))
);

export const LazyFileManagerApp = createLazyComponent(
  () => import('../apps/FileManagerApp').then(module => ({ default: module.FileManagerApp }))
);

// Note: Removed non-existent package imports
// @auraos/desktop, @auraos/terminal, @auraos/debugger packages don't exist
// FileManager, TextEditor, ImageEditor components don't exist yet

// Advanced Lazy Loading with Intersection Observer
export const LazyWithIntersection = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = { rootMargin: '50px' }
) => {
  const LazyComponent = lazy(importFunc);
  
  const IntersectionWrapper = React.forwardRef<any, any>((props, ref) => {
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
            <LazyComponent {...props} />
          </Suspense>
        ) : (
          <div className="loading-placeholder">Loading...</div>
        )}
      </div>
    );
  });
  
  IntersectionWrapper.displayName = 'LazyWithIntersection';
  return IntersectionWrapper;
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
    }, []);
    
    if (!isLoaded) {
      return <div className="loading-placeholder">Loading...</div>;
    }
    
    return (
      <Suspense fallback={<div className="loading-placeholder">Loading...</div>}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
  
  PriorityComponent.displayName = 'PriorityLazyComponent';
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
  
  const CachedComponent = (props: any) => (
    <Suspense fallback={<div className="loading-placeholder">Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
  
  CachedComponent.displayName = 'CachedLazyComponent';
  return CachedComponent;
};

// Lazy Loading with Error Recovery
export const createResilientLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackComponent?: ComponentType<any>
) => {
  const LazyComponent = lazy(importFunc);
  
  const ResilientComponent = (props: any) => {
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
        <LazyComponent {...props} />
      </Suspense>
    );
  };
  
  ResilientComponent.displayName = 'ResilientLazyComponent';
  return ResilientComponent;
};
