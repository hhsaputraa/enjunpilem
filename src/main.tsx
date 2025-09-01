import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPerformanceObserver } from './hooks/usePerformance'

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  initPerformanceObserver();
}

createRoot(document.getElementById("root")!).render(<App />);
