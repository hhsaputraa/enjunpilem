# 🔐 Environment Variables Setup

This document explains how to set up environment variables for the EnjunPilem application.

## 📋 Required Environment Variables

### TMDB API Configuration
- `VITE_TMDB_API_KEY` - Your TMDB API key (required)
- `VITE_TMDB_BASE_URL` - TMDB API base URL (optional, defaults to https://api.themoviedb.org/3)
- `VITE_TMDB_IMAGE_BASE_URL` - TMDB image base URL (optional, defaults to https://image.tmdb.org/t/p)

### Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL (required)
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (required)

### Application Configuration (Optional)
- `VITE_APP_NAME` - Application name (defaults to "EnjunPilem")
- `VITE_APP_VERSION` - Application version (defaults to "2.0.0")
- `VITE_APP_DESCRIPTION` - Application description

### Development Configuration (Optional)
- `VITE_DEV_MODE` - Enable development mode (defaults to "false")
- `VITE_ENABLE_PERFORMANCE_MONITORING` - Enable performance monitoring (defaults to "false")

## 🚀 Setup Instructions

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Get TMDB API Key
1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account or sign in
3. Go to Settings > API
4. Request an API key
5. Copy your API key to `VITE_TMDB_API_KEY` in `.env`

### 3. Get Supabase Credentials
1. Go to [Supabase](https://supabase.com/)
2. Create a new project or use existing one
3. Go to Settings > API
4. Copy the Project URL to `VITE_SUPABASE_URL`
5. Copy the anon/public key to `VITE_SUPABASE_ANON_KEY`

### 4. Update .env File
```env
# TMDB API Configuration
VITE_TMDB_API_KEY=your_actual_tmdb_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_actual_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here

# Optional configurations can use defaults
VITE_APP_NAME=EnjunPilem
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

## 🔒 Security Best Practices

### ✅ Do's
- Keep `.env` file in `.gitignore`
- Use different keys for development and production
- Regularly rotate API keys
- Use environment-specific configurations

### ❌ Don'ts
- Never commit `.env` file to version control
- Don't share API keys in public channels
- Don't use production keys in development
- Don't hardcode sensitive data in source code

## 🛠️ Development vs Production

### Development
- Use `.env` file for local development
- Enable performance monitoring
- Use development Supabase project

### Production
- Set environment variables in your hosting platform
- Use production Supabase project
- Disable development features

## 🔍 Validation

The application automatically validates required environment variables on startup:

- ✅ **Success**: All required variables are configured
- ❌ **Error**: Missing required variables (check console for details)

## 🐛 Troubleshooting

### Common Issues

1. **"Missing required environment variable" error**
   - Check if `.env` file exists
   - Verify variable names (must start with `VITE_`)
   - Ensure no spaces around `=` in `.env` file

2. **TMDB API not working**
   - Verify API key is correct
   - Check if API key has proper permissions
   - Ensure API key is not expired

3. **Supabase connection issues**
   - Verify Supabase URL and key are correct
   - Check if Supabase project is active
   - Ensure RLS policies are configured properly

### Getting Help
- Check browser console for error messages
- Verify `.env` file format
- Compare with `.env.example`
- Ensure all required variables are set
