export type StreamingServer = 'vidsrc' | 'vidrock';

export interface ServerOption {
  id: StreamingServer;
  name: string;
  label: string;
}

export const STREAMING_SERVERS: ServerOption[] = [
  { id: 'vidsrc', name: 'VidSrc', label: 'Server 1' },
  { id: 'vidrock', name: 'Vidrock', label: 'Server 2' },
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
      return `https://vidrock.net/movie/${cleanId}`;
    }
    return `https://vidrock.net/tv/${cleanId}/${season}/${episode}`;
  }

  // Default: vidsrc
  if (type === 'movie') {
    return `https://vidsrc.sh/embed/movie?tmdb=${cleanId}`;
  }
  return `https://vidsrc.sh/embed/tv?tmdb=${cleanId}&season=${season}&episode=${episode}`;
};
