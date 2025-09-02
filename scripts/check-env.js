#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Checks if all required environment variables are properly configured
 */

import fs from 'fs';
import path from 'path';

// Required environment variables
const REQUIRED_VARS = [
  'VITE_TMDB_API_KEY',
  'VITE_TMDB_ACCOUNT_ID',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Optional environment variables with defaults
const OPTIONAL_VARS = {
  'VITE_TMDB_BASE_URL': 'https://api.themoviedb.org/3',
  'VITE_TMDB_IMAGE_BASE_URL': 'https://image.tmdb.org/t/p',
  'VITE_TMDB_SESSION_ID': '',
  'VITE_TMDB_ACCESS_TOKEN': '',
  'VITE_APP_NAME': 'EnjunPilem',
  'VITE_APP_VERSION': '2.0.0',
  'VITE_DEV_MODE': 'false',
  'VITE_ENABLE_PERFORMANCE_MONITORING': 'false'
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  
  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red');
    
    if (fs.existsSync(envExamplePath)) {
      log('💡 Found .env.example file. Copy it to .env and fill in your values:', 'yellow');
      log('   cp .env.example .env', 'blue');
    } else {
      log('💡 Create a .env file with the required variables.', 'yellow');
    }
    
    return false;
  }
  
  log('✅ .env file found', 'green');
  return true;
}

function parseEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return envVars;
}

function validateEnvironmentVariables() {
  log('\n🔍 Validating Environment Variables...', 'bold');
  
  if (!checkEnvFile()) {
    return false;
  }
  
  const envVars = parseEnvFile();
  let isValid = true;
  
  // Check required variables
  log('\n📋 Required Variables:', 'bold');
  REQUIRED_VARS.forEach(varName => {
    if (envVars[varName] && envVars[varName].length > 0) {
      log(`✅ ${varName}: configured`, 'green');
    } else {
      log(`❌ ${varName}: missing or empty`, 'red');
      isValid = false;
    }
  });
  
  // Check optional variables
  log('\n⚙️  Optional Variables:', 'bold');
  Object.entries(OPTIONAL_VARS).forEach(([varName, defaultValue]) => {
    if (envVars[varName]) {
      log(`✅ ${varName}: ${envVars[varName]}`, 'green');
    } else {
      log(`⚠️  ${varName}: using default (${defaultValue})`, 'yellow');
    }
  });

  if (!envVars['VITE_TMDB_SESSION_ID'] && !envVars['VITE_TMDB_ACCESS_TOKEN']) {
    log('\n⚠️  VITE_TMDB_SESSION_ID or VITE_TMDB_ACCESS_TOKEN is required for authenticated TMDB requests', 'yellow');
    isValid = false;
  }
  
  return isValid;
}

function main() {
  log('🔐 EnjunPilem Environment Setup Checker', 'bold');
  log('=====================================\n', 'bold');
  
  const isValid = validateEnvironmentVariables();
  
  if (isValid) {
    log('\n🎉 Environment setup is complete!', 'green');
    log('You can now run the application.', 'green');
  } else {
    log('\n❌ Environment setup is incomplete!', 'red');
    log('Please fix the missing variables before running the application.', 'red');
    log('\n📖 For detailed setup instructions, see ENV_SETUP.md', 'blue');
    process.exit(1);
  }
}

// Run the validation
main();
