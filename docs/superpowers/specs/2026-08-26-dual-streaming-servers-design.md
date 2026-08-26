# Dual Streaming Servers (VidSrc & Vidrock) Design Specification

## Overview
This specification details adding support for a second streaming server (`Vidrock` - `https://vidrock.ru/`) alongside the existing `VidSrc` (`https://vidsrc-embed.ru/embed`) server in EnjunPilem. Users will be able to switch between streaming servers via 2 button controls, and their server preference will persist across sessions using `localStorage`.

## Architecture & Data Flow

### 1. Streaming Service Helpers (`src/services/streaming.ts`)
- Server identifiers: `'vidsrc'` | `'vidrock'`
- URL Generator `getStreamingUrl`:
  - `vidsrc`:
    - Movie: `https://vidsrc-embed.ru/embed/movie?tmdb={id}`
    - TV: `https://vidsrc-embed.ru/embed/tv?tmdb={id}&season={season}&episode={episode}`
  - `vidrock`:
    - Movie: `https://vidrock.ru/movie/{id}`
    - TV: `https://vidrock.ru/tv/{id}/{season}/{episode}`

### 2. Custom Hook (`src/hooks/useStreamingServer.ts`)
- Reads initial server from `localStorage.getItem('preferred_streaming_server')` defaulting to `'vidsrc'`.
- Provides `currentServer`, `setServer`, and `getEmbedUrl(type, id, season, episode)`.
- Updates `localStorage` when `setServer` is called.

### 3. Server Selector Component (`src/components/ServerSelector.tsx`)
- Renders 2 buttons: "Server 1 (VidSrc)" and "Server 2 (Vidrock)".
- Displays active state styling (primary background / active badge).
- Accepts `currentServer`, `onSelectServer`, and optional `className`.

### 4. Desktop Player View (`src/pages/Watch.tsx`)
- Uses `useStreamingServer` hook.
- Displays `ServerSelector` UI adjacent to the player area.
- Updates iframe `src` dynamically according to active server.

### 5. Mobile Player Component (`src/components/mobile/MobileVideoPlayer.tsx`)
- Integrates `useStreamingServer` or accepts server state.
- Adds server switcher buttons in the player header/controls.
- Updates iframe `src` dynamically according to active server.

## UI/UX Considerations
- Both servers use standard TMDB IDs (`movieId` / `id`).
- For TV shows, both servers use 1-indexed season and episode numbers.
- Smooth transitions and clean button design matching shadcn/ui and Tailwind styles.
