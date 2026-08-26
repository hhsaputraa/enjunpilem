# Dual Streaming Servers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Vidrock (`https://vidrock.ru/`) as a second streaming server alongside VidSrc and provide 2 server selector button controls with persistent localStorage preference.

**Architecture:** Create a centralized streaming helper (`src/services/streaming.ts`) and custom hook (`src/hooks/useStreamingServer.ts`), build a reusable `ServerSelector` component, and integrate it into `src/pages/Watch.tsx` and `src/components/mobile/MobileVideoPlayer.tsx`.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide Icons, localStorage API.

## Global Constraints
- Target servers: `vidsrc` (`https://vidsrc-embed.ru/embed`) and `vidrock` (`https://vidrock.ru`)
- Storage key: `preferred_streaming_server`
- Movie embed formats:
  - VidSrc: `https://vidsrc-embed.ru/embed/movie?tmdb={id}`
  - Vidrock: `https://vidrock.ru/movie/{id}`
- TV embed formats:
  - VidSrc: `https://vidsrc-embed.ru/embed/tv?tmdb={id}&season={season}&episode={episode}`
  - Vidrock: `https://vidrock.ru/tv/{id}/{season}/{episode}`

---

### Task 1: Create Streaming Helper and Hook

**Files:**
- Create: `src/services/streaming.ts`
- Create: `src/hooks/useStreamingServer.ts`

**Interfaces:**
- Consumes: TMDB media parameters (`type`, `id`, `season`, `episode`)
- Produces: `StreamingServer` type (`'vidsrc'` | `'vidrock'`), `getStreamingUrl`, `useStreamingServer` hook

- [ ] **Step 1: Write `src/services/streaming.ts`**

```typescript
export type StreamingServer = 'vidsrc' | 'vidrock';

export interface ServerOption {
  id: StreamingServer;
  name: string;
  label: string;
}

export const STREAMING_SERVERS: ServerOption[] = [
  { id: 'vidsrc', name: 'VidSrc', label: 'Server 1 (VidSrc)' },
  { id: 'vidrock', name: 'Vidrock', label: 'Server 2 (Vidrock)' },
];

export const getStreamingUrl = (
  server: StreamingServer,
  type: 'movie' | 'tv',
  id: string | number,
  season: number = 1,
  episode: number = 1
): string => {
  const cleanId = String(id);

  if (server === 'vidrock') {
    if (type === 'movie') {
      return `https://vidrock.ru/movie/${cleanId}`;
    }
    return `https://vidrock.ru/tv/${cleanId}/${season}/${episode}`;
  }

  // Default: vidsrc
  if (type === 'movie') {
    return `https://vidsrc-embed.ru/embed/movie?tmdb=${cleanId}`;
  }
  return `https://vidsrc-embed.ru/embed/tv?tmdb=${cleanId}&season=${season}&episode=${episode}`;
};
```

- [ ] **Step 2: Write `src/hooks/useStreamingServer.ts`**

```typescript
import { useState, useEffect } from 'react';
import { StreamingServer, getStreamingUrl } from '@/services/streaming';

const STORAGE_KEY = 'preferred_streaming_server';

export const useStreamingServer = (defaultServer: StreamingServer = 'vidsrc') => {
  const [server, setServerState] = useState<StreamingServer>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'vidsrc' || saved === 'vidrock') {
        return saved;
      }
    } catch (e) {
      console.error('Failed to read streaming server from localStorage:', e);
    }
    return defaultServer;
  });

  const setServer = (newServer: StreamingServer) => {
    setServerState(newServer);
    try {
      localStorage.setItem(STORAGE_KEY, newServer);
    } catch (e) {
      console.error('Failed to save streaming server to localStorage:', e);
    }
  };

  const getEmbedUrl = (
    type: 'movie' | 'tv',
    id: string | number,
    season: number = 1,
    episode: number = 1
  ) => {
    return getStreamingUrl(server, type, id, season, episode);
  };

  return {
    server,
    setServer,
    getEmbedUrl,
  };
};
```

- [ ] **Step 3: Commit**

```bash
git add src/services/streaming.ts src/hooks/useStreamingServer.ts
git commit -m "feat: add streaming helper and useStreamingServer hook"
```

---

### Task 2: Create `ServerSelector` Component

**Files:**
- Create: `src/components/ServerSelector.tsx`

**Interfaces:**
- Consumes: `StreamingServer`, `setServer` from Task 1
- Produces: `ServerSelector` component

- [ ] **Step 1: Write `src/components/ServerSelector.tsx`**

```typescript
import React from 'react';
import { Button } from '@/components/ui/button';
import { Server } from 'lucide-react';
import { StreamingServer, STREAMING_SERVERS } from '@/services/streaming';
import { cn } from '@/lib/utils';

interface ServerSelectorProps {
  currentServer: StreamingServer;
  onSelectServer: (server: StreamingServer) => void;
  className?: string;
  size?: 'sm' | 'default';
}

export const ServerSelector: React.FC<ServerSelectorProps> = ({
  currentServer,
  onSelectServer,
  className,
  size = 'default',
}) => {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mr-1">
        <Server className="w-3.5 h-3.5" />
        Server:
      </span>
      {STREAMING_SERVERS.map((srv) => {
        const isActive = currentServer === srv.id;
        return (
          <Button
            key={srv.id}
            variant={isActive ? "default" : "outline"}
            size={size === 'sm' ? "sm" : "default"}
            onClick={() => onSelectServer(srv.id)}
            className={cn(
              "transition-all duration-200 font-medium text-xs rounded-xl",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                : "bg-background/60 hover:bg-muted/80 text-foreground border-border/60"
            )}
          >
            <span className={cn(
              "w-2 h-2 rounded-full mr-2",
              isActive ? "bg-white animate-pulse" : "bg-muted-foreground/40"
            )} />
            {srv.label}
          </Button>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ServerSelector.tsx
git commit -m "feat: add ServerSelector component for switching streaming servers"
```

---

### Task 3: Integrate Dual Server Support in Desktop Watch Page (`Watch.tsx`)

**Files:**
- Modify: `src/pages/Watch.tsx`

**Interfaces:**
- Consumes: `useStreamingServer` from Task 1, `ServerSelector` from Task 2
- Produces: Updated `Watch` page with server toggle and dynamic URL iframe

- [ ] **Step 1: Update `src/pages/Watch.tsx`**

Import `useStreamingServer` and `ServerSelector`:
```typescript
import { useStreamingServer } from '@/hooks/useStreamingServer';
import { ServerSelector } from '@/components/ServerSelector';
```

Inside `Watch` component:
```typescript
const { server, setServer, getEmbedUrl } = useStreamingServer();
```

Above the iframe container (before `div className="aspect-video w-full mb-6..."`):
```typescript
<div className="flex items-center justify-between mb-3 bg-muted/20 p-3 rounded-xl border border-border/40">
  <ServerSelector currentServer={server} onSelectServer={setServer} />
</div>
```

Update iframe `src`:
```typescript
<iframe
  src={getEmbedUrl(validType as 'movie' | 'tv', id!, selectedSeason, selectedEpisode)}
  className="w-full h-full border-0"
  allowFullScreen
  scrolling="no"
/>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/Watch.tsx
git commit -m "feat: integrate dual streaming servers into desktop Watch page"
```

---

### Task 4: Integrate Dual Server Support in Mobile Video Player (`MobileVideoPlayer.tsx`)

**Files:**
- Modify: `src/components/mobile/MobileVideoPlayer.tsx`

**Interfaces:**
- Consumes: `useStreamingServer` from Task 1, `ServerSelector` or server buttons
- Produces: Updated `MobileVideoPlayer` component with server switcher in top bar / player controls

- [ ] **Step 1: Update `src/components/mobile/MobileVideoPlayer.tsx`**

Import `useStreamingServer` and `ServerSelector`:
```typescript
import { useStreamingServer } from '@/hooks/useStreamingServer';
import { ServerSelector } from '@/components/ServerSelector';
```

Inside `MobileVideoPlayer`:
```typescript
const { server, setServer, getEmbedUrl } = useStreamingServer();
```

In the top floating bar (or right below the title bar), add server toggle buttons, and update `iframe` `src`:
```typescript
<iframe
  key={`${server}-${movieId}-${season}-${episode}`}
  src={getEmbedUrl(type, movieId, season, episode)}
  className="w-full h-full border-0 z-10"
  allowFullScreen
  scrolling="no"
  allow="autoplay; encrypted-media; picture-in-picture"
  onLoad={() => setIsLoading(false)}
/>
```

Add server switcher controls inside top bar or header overlay so mobile users can switch servers easily.

- [ ] **Step 2: Commit**

```bash
git add src/components/mobile/MobileVideoPlayer.tsx
git commit -m "feat: integrate dual streaming servers into MobileVideoPlayer"
```

---

### Task 5: Verification & Build Test

- [ ] **Step 1: Run TypeScript / build verification**

Run: `npx tsc --noEmit` or `npm run build`
Expected: 0 errors, build success.

- [ ] **Step 2: Commit final changes if any**
