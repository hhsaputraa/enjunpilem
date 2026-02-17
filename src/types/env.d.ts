/// <reference types="vite/client" />

// Type definitions for environment variables
interface ImportMetaEnv {
  // TMDB Configuration
  readonly VITE_TMDB_API_KEY: string;
  readonly VITE_TMDB_BASE_URL: string;
  readonly VITE_TMDB_IMAGE_BASE_URL: string;
  
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  // Application Configuration
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;
  
  // Development Configuration
  readonly VITE_DEV_MODE: string;
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
