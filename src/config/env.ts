// Environment configuration with validation and type safety

interface EnvConfig {
  // TMDB Configuration
  tmdb: {
    apiKey: string;
    baseUrl: string;
    imageBaseUrl: string;
    accountId: string;
    sessionId?: string;
    accessToken?: string;
  };
  
  // Supabase Configuration
  supabase: {
    url: string;
    anonKey: string;
  };
  
  // Application Configuration
  app: {
    name: string;
    version: string;
    description: string;
  };
  
  // Development Configuration
  dev: {
    mode: boolean;
    performanceMonitoring: boolean;
  };
}

// Get environment variable with validation
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] || fallback;
  
  if (!value) {
    console.error(`❌ Environment variable ${key} is not defined`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
};

// Get optional environment variable
const getOptionalEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback;
};

// Environment configuration object
export const env: EnvConfig = {
  tmdb: {
    apiKey: getEnvVar('VITE_TMDB_API_KEY'),
    baseUrl: getEnvVar('VITE_TMDB_BASE_URL', 'https://api.themoviedb.org/3'),
    imageBaseUrl: getEnvVar('VITE_TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p'),
    accountId: getEnvVar('VITE_TMDB_ACCOUNT_ID'),
    sessionId: getOptionalEnvVar('VITE_TMDB_SESSION_ID'),
    accessToken: getOptionalEnvVar('VITE_TMDB_ACCESS_TOKEN'),
  },
  
  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
  },
  
  app: {
    name: getOptionalEnvVar('VITE_APP_NAME', 'EnjunPilem'),
    version: getOptionalEnvVar('VITE_APP_VERSION', '2.0.0'),
    description: getOptionalEnvVar('VITE_APP_DESCRIPTION', 'Your ultimate destination for movies and TV shows'),
  },
  
  dev: {
    mode: getOptionalEnvVar('VITE_DEV_MODE', 'false') === 'true',
    performanceMonitoring: getOptionalEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING', 'false') === 'true',
  },
};

// Validate all required environment variables on startup
export const validateEnv = (): void => {
  const requiredVars = [
    'VITE_TMDB_API_KEY',
    'VITE_TMDB_ACCOUNT_ID',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('📝 Please check your .env file and ensure all required variables are set.');
    console.error('💡 You can use .env.example as a template.');
  } else {
    console.log('✅ All required environment variables are configured');
  }

  if (!import.meta.env['VITE_TMDB_SESSION_ID'] && !import.meta.env['VITE_TMDB_ACCESS_TOKEN']) {
    console.warn('⚠️  TMDB session ID or access token is not configured. Some TMDB features may not work.');
  }
};

// Export individual configs for convenience
export const tmdbConfig = env.tmdb;
export const supabaseConfig = env.supabase;
export const appConfig = env.app;
export const devConfig = env.dev;
