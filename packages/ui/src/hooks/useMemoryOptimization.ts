/**
 * Memory Optimization Hooks
 * Advanced memory management for optimal performance
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

/**
 * Hook for memory leak prevention
 */
export const useMemoryCleanup = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);
  
  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);
  
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, []);
  
  return { addCleanup };
};

/**
 * Hook for debounced state updates
 */
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, () => void] => {
  const [value, setValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const setDebouncedValue = useCallback((newValue: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setValue(newValue);
    }, delay);
  }, [delay]);
  
  const cancelDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [value, setDebouncedValue, cancelDebounce];
};

/**
 * Hook for throttled callbacks
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        return callback(...args);
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - (now - lastCallRef.current));
    },
    [callback, delay]
  ) as T;
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback;
};

/**
 * Hook for memory-efficient state management
 */
export const useOptimizedState = <T>(
  initialValue: T,
  options: {
    maxHistory?: number;
    enableHistory?: boolean;
    debounceMs?: number;
  } = {}
) => {
  const {
    maxHistory = 10,
    enableHistory = false,
    debounceMs = 0
  } = options;
  
  const [value, setValue] = useState<T>(initialValue);
  const historyRef = useRef<T[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const setOptimizedValue = useCallback((newValue: T) => {
    if (debounceMs > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setValue(newValue);
        if (enableHistory) {
          historyRef.current.unshift(newValue);
          if (historyRef.current.length > maxHistory) {
            historyRef.current.pop();
          }
        }
      }, debounceMs);
    } else {
      setValue(newValue);
      if (enableHistory) {
        historyRef.current.unshift(newValue);
        if (historyRef.current.length > maxHistory) {
          historyRef.current.pop();
        }
      }
    }
  }, [debounceMs, enableHistory, maxHistory]);
  
  const getHistory = useCallback(() => historyRef.current, []);
  
  const clearHistory = useCallback(() => {
    historyRef.current = [];
  }, []);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    value,
    setValue: setOptimizedValue,
    getHistory,
    clearHistory
  };
};

/**
 * Hook for virtual scrolling optimization
 */
export const useVirtualScrolling = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );
    
    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.max(0, endIndex)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

/**
 * Hook for memory usage monitoring
 */
export const useMemoryMonitor = (interval: number = 5000) => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    limit: number;
    percentage: number;
  } | null>(null);
  
  useEffect(() => {
    const updateMemoryInfo = () => {
      if (typeof window !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize;
        const total = memory.totalJSHeapSize;
        const limit = memory.jsHeapSizeLimit;
        const percentage = (used / limit) * 100;
        
        setMemoryInfo({
          used,
          total,
          limit,
          percentage
        });
      }
    };
    
    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);
    
    return () => clearInterval(intervalId);
  }, [interval]);
  
  return memoryInfo;
};

/**
 * Hook for component memoization
 */
export const useMemoizedComponent = <T extends ComponentType<any>>(
  Component: T,
  props: any,
  deps: any[]
) => {
  return useMemo(() => {
    return React.createElement(Component, props);
  }, deps);
};

/**
 * Hook for event listener optimization
 */
export const useOptimizedEventListener = <K extends keyof WindowEventMap>(
  event: K,
  handler: (event: WindowEventMap[K]) => void,
  options: AddEventListenerOptions = {}
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  
  useEffect(() => {
    const eventHandler = (event: WindowEventMap[K]) => {
      handlerRef.current(event);
    };
    
    window.addEventListener(event, eventHandler, options);
    
    return () => {
      window.removeEventListener(event, eventHandler, options);
    };
  }, [event, options]);
};

/**
 * Hook for intersection observer optimization
 */
export const useIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver>();
  const elementsRef = useRef<Set<Element>>(new Set());
  
  const observe = useCallback((element: Element) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(callback, options);
    }
    
    observerRef.current.observe(element);
    elementsRef.current.add(element);
  }, [callback, options]);
  
  const unobserve = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
      elementsRef.current.delete(element);
    }
  }, []);
  
  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      elementsRef.current.clear();
    }
  }, []);
  
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return { observe, unobserve, disconnect };
};
