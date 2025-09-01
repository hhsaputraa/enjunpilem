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

createRoot(document.getElementById("root")!).render(<App />);
