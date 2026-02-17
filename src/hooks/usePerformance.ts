import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export const usePerformance = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    
    // Measure render time
    const measureRenderTime = () => {
      const renderTime = performance.now() - startTime;
      
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
        
        // Log memory usage if available
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          console.log(`💾 Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    };

    // Use requestAnimationFrame to measure after paint
    requestAnimationFrame(measureRenderTime);
    
    // Cleanup function
    return () => {
      // Optional: Log component unmount time
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 ${componentName} unmounted`);
      }
    };
  }, [componentName]);

  // Function to measure custom performance metrics
  const measureCustom = (metricName: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${componentName} - ${metricName}: ${(end - start).toFixed(2)}ms`);
    }
  };

  return { measureCustom };
};

// Performance observer for Core Web Vitals
export const initPerformanceObserver = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('🎯 LCP:', lastEntry.startTime.toFixed(2), 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.log('⚡ FID:', entry.processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('📐 CLS:', clsValue.toFixed(4));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }
};
