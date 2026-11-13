import { useEffect, useRef } from 'react';
import { updateWatchProgress } from '@/services/history';
import { useQueryClient } from '@tanstack/react-query';

interface VidrockMediaProgress {
  watched?: number;
  duration?: number;
}

interface VidrockShowProgressItem {
  season?: string | number;
  episode?: string | number;
  progress?: VidrockMediaProgress;
  last_updated?: number;
}

interface VidrockMediaData {
  id?: number | string;
  type?: 'movie' | 'tv';
  title?: string;
  poster_path?: string;
  backdrop_path?: string;
  progress?: VidrockMediaProgress;
  last_updated?: number;
  last_season_watched?: string | number;
  last_episode_watched?: string | number;
  show_progress?: Record<string, VidrockShowProgressItem>;
}

interface VidrockPlayerEventData {
  event?: 'play' | 'pause' | 'seeked' | 'ended' | 'timeupdate';
  currentTime?: number;
  duration?: number;
  tmdbId?: number | string;
  mediaType?: 'movie' | 'tv';
  season?: number;
  episode?: number;
}

interface UseVidrockProgressOptions {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  season?: number;
  episode?: number;
  episodeName?: string;
  enabled?: boolean;
}

export const useVidrockProgress = ({
  mediaId,
  mediaType,
  title,
  posterPath,
  backdropPath,
  season = 1,
  episode = 1,
  episodeName,
  enabled = true,
}: UseVidrockProgressOptions) => {
  const queryClient = useQueryClient();
  const lastSavedTimeRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !mediaId) return;

    const handleMessage = (event: MessageEvent) => {
      // Security check: Only process messages from Vidrock player
      if (event.origin !== 'https://vidrock.net' && event.origin !== 'https://vidrock.ru') return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      // 1. Handle MEDIA_DATA event (Stored in localStorage & Supabase)
      if (data.type === 'MEDIA_DATA' && data.data) {
        const mediaData: VidrockMediaData = data.data;

        // Backup to LocalStorage as requested by VidRock API spec
        try {
          const existingRaw = localStorage.getItem('vidRockProgress');
          let existingList: VidrockMediaData[] = existingRaw ? JSON.parse(existingRaw) : [];
          if (!Array.isArray(existingList)) existingList = [];
          
          const index = existingList.findIndex((item) => String(item.id) === String(mediaId));
          if (index >= 0) {
            existingList[index] = { ...existingList[index], ...mediaData };
          } else {
            existingList.push(mediaData);
          }
          localStorage.setItem('vidRockProgress', JSON.stringify(existingList));
        } catch (e) {
          console.warn('Failed to update vidRockProgress in localStorage:', e);
        }

        // Calculate progress percentage if watched & duration exist
        if (mediaData.progress?.watched !== undefined && mediaData.progress?.duration && mediaData.progress.duration > 0) {
          const percent = Math.round((mediaData.progress.watched / mediaData.progress.duration) * 100);
          saveProgressToSupabase(percent, mediaData.last_season_watched, mediaData.last_episode_watched);
        }
      }

      // 2. Handle PLAYER_EVENT event (real-time playback events)
      if (data.type === 'PLAYER_EVENT' && data.data) {
        const eventData: VidrockPlayerEventData = data.data;
        const { event: eventType, currentTime = 0, duration = 0, season: eventSeason, episode: eventEpisode } = eventData;

        if (duration > 0) {
          const percent = Math.round((currentTime / duration) * 100);
          const currentSeason = eventSeason || season;
          const currentEpisode = eventEpisode || episode;

          // Save immediately on pause, ended, or seeked
          if (eventType === 'pause' || eventType === 'ended' || eventType === 'seeked') {
            saveProgressToSupabase(percent, currentSeason, currentEpisode);
          } else if (eventType === 'timeupdate') {
            // Throttle timeupdate saves to every 30 seconds
            const now = Date.now();
            if (now - lastSavedTimeRef.current > 30000) {
              lastSavedTimeRef.current = now;
              saveProgressToSupabase(percent, currentSeason, currentEpisode);
            }
          }
        }
      }
    };

    const saveProgressToSupabase = (
      progressPercent: number,
      seasonNum?: string | number,
      episodeNum?: string | number
    ) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updateWatchProgress({
          media_id: mediaId,
          media_type: mediaType,
          title,
          poster_path: posterPath,
          backdrop_path: backdropPath,
          progress_percent: progressPercent,
          season_number: seasonNum ? Number(seasonNum) : season,
          episode_number: episodeNum ? Number(episodeNum) : episode,
          episode_name: episodeName,
        }).then((result) => {
          if (result) {
            // Update in-memory query cache directly without triggering background network refetch
            queryClient.setQueryData(['continueWatching', result.user_id], (old: any) => {
              if (!old || !Array.isArray(old)) return [result];
              const index = old.findIndex((x: any) => x.id === result.id);
              if (index >= 0) {
                const updated = [...old];
                updated[index] = result;
                return updated;
              }
              return [result, ...old].slice(0, 10);
            });
          }
        });
      }, 1000);
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [mediaId, mediaType, title, posterPath, backdropPath, season, episode, episodeName, enabled, queryClient]);
};
