import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMobileAuth } from './useMobileAuth';
import { useToastHelpers } from '@/components/mobile/Toast';
import { promisePool } from '@/lib/promisePool';
import { getMovieDetails, getTVDetails } from '@/services/tmdb';

// DB row shape (from generated types). Title/poster are NOT stored in `watchlist` table —
// they live on TMDB. We keep the mobile API backward-compatible by carrying optional UI
// fields in-memory only.
export interface WatchlistItem {
  id: string;
  user_id: string;
  media_id: number;
  media_type: string;
  added_at: string;
  // Convenience aliases used across mobile UI (derived/optional)
  tmdb_id?: string;
  title?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  created_at?: string;
}

type ToggleInput = {
  id: string;
  title: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  year?: string;
  rating?: number;
  type: 'movie' | 'tv';
};

export const useMobileWatchlist = () => {
  const { user } = useMobileAuth();
  const { showSuccess, showError } = useToastHelpers();
  const queryClient = useQueryClient();

  const { data: watchlist = [], isLoading, error, refetch } = useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: async (): Promise<WatchlistItem[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('watchlist')
        .select('id, user_id, media_id, media_type, added_at')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });
      if (error) throw error;

      const settledResults = await promisePool(
        data ?? [],
        async (r) => {
          try {
            const tmdbData = await (r.media_type === 'movie'
              ? getMovieDetails(r.media_id.toString())
              : getTVDetails(r.media_id.toString())
            );
            return {
              ...r,
              tmdb_id: String(r.media_id),
              created_at: r.added_at,
              title: tmdbData?.title || tmdbData?.name || 'Unknown',
              poster_path: tmdbData?.poster_path || undefined,
              vote_average: tmdbData?.vote_average || 0,
              release_date: tmdbData?.release_date || tmdbData?.first_air_date || '',
            };
          } catch (e) {
            return {
              ...r,
              tmdb_id: String(r.media_id),
              created_at: r.added_at,
              title: 'Unknown',
              vote_average: 0,
              release_date: '',
            };
          }
        },
        5
      );

      return settledResults.map((res) => {
        if (res.status === 'fulfilled') return res.value;
        return res.reason;
      });
    },
    enabled: !!user,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async (item: ToggleInput) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          media_id: Number(item.id),
          media_type: item.type,
        })
        .select()
        .single();
      if (error) throw error;
      return { ...data, title: item.title };
    },
    onSuccess: (data: { title: string }) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
      showSuccess('Ditambahkan ke Watchlist', `"${data.title}" berhasil ditambahkan`);
    },
    onError: (err: Error) => showError('Gagal menambahkan', err.message),
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (tmdbId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', Number(tmdbId));
      if (error) throw error;
      return tmdbId;
    },
    onSuccess: (tmdbId) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
      const item = watchlist.find((w) => w.tmdb_id === tmdbId);
      showSuccess('Dihapus dari Watchlist', `"${item?.title || 'Item'}" telah dihapus`);
    },
    onError: (err: Error) => showError('Gagal menghapus', err.message),
  });

  const isInWatchlist = (tmdbId: string) => watchlist.some((i) => i.tmdb_id === tmdbId);

  const toggleWatchlist = async (item: ToggleInput) => {
    if (!user) {
      showError('Login diperlukan', 'Silakan login untuk menggunakan watchlist');
      return;
    }
    if (isInWatchlist(item.id)) removeFromWatchlistMutation.mutate(item.id);
    else addToWatchlistMutation.mutate(item);
  };

  const bulkRemoveFromWatchlist = async (tmdbIds: string[]) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .in('media_id', tmdbIds.map((id) => Number(id)));
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
      showSuccess('Berhasil dihapus', `${tmdbIds.length} item telah dihapus dari watchlist`);
    } catch (err) {
      const error = err as Error;
      showError('Gagal menghapus', error.message);
    }
  };

  const getWatchlistStats = () => ({
    total: watchlist.length,
    movies: watchlist.filter((i) => i.media_type === 'movie').length,
    tvShows: watchlist.filter((i) => i.media_type === 'tv').length,
  });

  return {
    watchlist,
    isLoading,
    error,
    refetch,
    isInWatchlist,
    toggleWatchlist,
    bulkRemoveFromWatchlist,
    getWatchlistStats,
    isAddingToWatchlist: addToWatchlistMutation.isPending,
    isRemovingFromWatchlist: removeFromWatchlistMutation.isPending,
  };
};

export const useMobileFavorites = () => {
  const { user } = useMobileAuth();
  const { showSuccess, showError } = useToastHelpers();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async (): Promise<WatchlistItem[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('id, user_id, media_id, media_type, added_at')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });
      if (error) throw error;

      const settledResults = await promisePool(
        data ?? [],
        async (r) => {
          try {
            const tmdbData = await (r.media_type === 'movie'
              ? getMovieDetails(r.media_id.toString())
              : getTVDetails(r.media_id.toString())
            );
            return {
              ...r,
              tmdb_id: String(r.media_id),
              created_at: r.added_at,
              title: tmdbData?.title || tmdbData?.name || 'Unknown',
              poster_path: tmdbData?.poster_path || undefined,
              vote_average: tmdbData?.vote_average || 0,
              release_date: tmdbData?.release_date || tmdbData?.first_air_date || '',
            };
          } catch (e) {
            return {
              ...r,
              tmdb_id: String(r.media_id),
              created_at: r.added_at,
              title: 'Unknown',
              vote_average: 0,
              release_date: '',
            };
          }
        },
        5
      );

      return settledResults.map((res) => {
        if (res.status === 'fulfilled') return res.value;
        return res.reason;
      });
    },
    enabled: !!user,
  });

  const addToFavoritesMutation = useMutation({
    mutationFn: async (item: ToggleInput) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          media_id: Number(item.id),
          media_type: item.type,
        })
        .select()
        .single();
      if (error) throw error;
      return { ...data, title: item.title };
    },
    onSuccess: (data: { title: string }) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      showSuccess('Ditambahkan ke Favorit', `"${data.title}" berhasil ditambahkan`);
    },
    onError: (err: Error) => showError('Gagal menambahkan', err.message),
  });

  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (tmdbId: string) => {
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('media_id', Number(tmdbId));
      if (error) throw error;
      return tmdbId;
    },
    onSuccess: (tmdbId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      const item = favorites.find((f) => f.tmdb_id === tmdbId);
      showSuccess('Dihapus dari Favorit', `"${item?.title || 'Item'}" telah dihapus`);
    },
    onError: (err: Error) => showError('Gagal menghapus', err.message),
  });

  const isInFavorites = (tmdbId: string) => favorites.some((i) => i.tmdb_id === tmdbId);

  const toggleFavorites = async (item: ToggleInput) => {
    if (!user) {
      showError('Login diperlukan', 'Silakan login untuk menggunakan favorit');
      return;
    }
    if (isInFavorites(item.id)) removeFromFavoritesMutation.mutate(item.id);
    else addToFavoritesMutation.mutate(item);
  };

  return {
    favorites,
    isLoading,
    error,
    isInFavorites,
    toggleFavorites,
    isAddingToFavorites: addToFavoritesMutation.isPending,
    isRemovingFromFavorites: removeFromFavoritesMutation.isPending,
  };
};
