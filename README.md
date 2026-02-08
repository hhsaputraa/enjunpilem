# 🎬 EnjunPilem - Movie & TV Show Streaming Platform

A modern, responsive web application for discovering and exploring movies and TV shows, built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- 🎭 **Browse Movies & TV Shows** - Discover trending, popular, and top-rated content
- 🔍 **Advanced Search** - Find your favorite movies and shows instantly
- 📱 **Responsive Design** - Optimized for all devices and screen sizes
- 🎨 **Modern UI/UX** - Beautiful glassmorphism design with smooth animations
- 👤 **User Authentication** - Secure login and registration with Supabase
- ❤️ **Personal Collections** - Create and manage your favorite lists
- 🚀 **Performance Optimized** - Fast loading with lazy loading and caching
- 🔐 **Environment Security** - Secure credential management

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: TanStack Query (React Query)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **API**: The Movie Database (TMDB)
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- TMDB API key
- Supabase project

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/enjunpilem.git
cd enjunpilem
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Check environment setup
npm run check-env
```

### 4. Configure Environment Variables

Edit `.env` file with your credentials:

```env
# TMDB API Configuration
VITE_TMDB_API_KEY=your_tmdb_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Enable development features
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### 5. Run Development Server

```bash
npm run dev
# or
npm run setup  # Includes environment validation
```

Visit `http://localhost:5173` to see the application.

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run check-env` - Validate environment variables
- `npm run setup` - Check environment and start dev server

## 🔐 Environment Variables

See [ENV_SETUP.md](ENV_SETUP.md) for detailed environment setup instructions.

### Required Variables

- `VITE_TMDB_API_KEY` - TMDB API key
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### Optional Variables

- `VITE_APP_NAME` - Application name
- `VITE_ENABLE_PERFORMANCE_MONITORING` - Enable performance monitoring

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services (TMDB, Supabase)
├── hooks/              # Custom React hooks
├── config/             # Configuration files
├── types/              # TypeScript type definitions
├── integrations/       # Third-party integrations
└── lib/                # Utility functions
```

## 🎨 Key Features

### Performance Optimizations

- ⚡ Lazy loading for images and components
- 🔄 Efficient caching with React Query
- 📱 Responsive image sizes
- 🎯 Priority loading for above-the-fold content

### Security Features

- 🔐 Environment variable validation
- 🛡️ Secure API key management
- 🔒 Protected routes and authentication

### User Experience

- 🎭 Smooth animations and transitions
- 📱 Mobile-first responsive design
- 🔍 Instant search with debouncing
- ❤️ Personal collections and favorites

## 🔐 Environment Security

This project implements secure credential management:

- All sensitive data stored in environment variables
- Automatic validation on startup
- Development and production configurations
- Type-safe environment variable access

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/2c7b49cf-d6d2-4253-9430-704a00c3dc09) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/2c7b49cf-d6d2-4253-9430-704a00c3dc09) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
