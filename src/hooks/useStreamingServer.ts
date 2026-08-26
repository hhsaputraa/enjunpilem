import { useState } from 'react';
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
