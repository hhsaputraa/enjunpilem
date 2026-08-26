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
