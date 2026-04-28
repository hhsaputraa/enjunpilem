import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateEnv, devConfig } from '@/config/env'
import { initPerformanceObserver } from './hooks/usePerformance'

// Validate environment variables on startup
validateEnv();

// Initialize performance monitoring if enabled
if (devConfig.performanceMonitoring && import.meta.env.DEV) {
  initPerformanceObserver();
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });

  // Reload page when new Service Worker takes over
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}


createRoot(document.getElementById("root")!).render(
  <App />
);
