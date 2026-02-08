import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMobileAuth } from './useMobileAuth';
import { useToastHelpers } from '@/components/mobile/Toast';

export interface WatchlistItem {
  id: string;
  user_id: string;
  tmdb_id: string;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  created_at: string;
}

export const useMobileWatchlist = () => {
  const { user } = useMobileAuth();
  const { showSuccess, showError } = useToastHelpers();
  const queryClient = useQueryClient();

  // Fetch watchlist
  const { data: watchlist = [], isLoading, error } = useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!user,
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async (item: {
      tmdb_id: string;
      media_type: 'movie' | 'tv';
      title: string;
      poster_path?: string;
      backdrop_path?: string;
      overview?: string;
      release_date?: string;
      vote_average?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          ...item,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
      showSuccess('Ditambahkan ke Watchlist', `"${data.title}" berhasil ditambahkan`);
    },
    onError: (error: any) => {
      showError('Gagal menambahkan', error.message);
    },
  });

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (tmdbId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('tmdb_id', tmdbId);

      if (error) throw error;
      return tmdbId;
    },
    onSuccess: (tmdbId, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
      const item = watchlist.find(w => w.tmdb_id === tmdbId);
      showSuccess('Dihapus dari Watchlist', `"${item?.title || 'Item'}" telah dihapus`);
    },
    onError: (error: any) => {
      showError('Gagal menghapus', error.message);
    },
  });

  // Check if item is in watchlist
  const isInWatchlist = (tmdbId: string) => {
    return watchlist.some(item => item.tmdb_id === tmdbId);
  };

  // Toggle watchlist
  const toggleWatchlist = async (item: {
    id: string;
    title: string;
    poster?: string;
    backdrop?: string;
    overview?: string;
    year?: string;
    rating?: number;
    type: 'movie' | 'tv';
  }) => {
    if (!user) {
      showError('Login diperlukan', 'Silakan login untuk menggunakan watchlist');
      return;
    }

    const inWatchlist = isInWatchlist(item.id);

    if (inWatchlist) {
      removeFromWatchlistMutation.mutate(item.id);
    } else {
      addToWatchlistMutation.mutate({
        tmdb_id: item.id,
        media_type: item.type,
        title: item.title,
        poster_path: item.poster?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path: item.backdrop?.replace('https://image.tmdb.org/t/p/w1280', ''),
        overview: item.overview,
        release_date: item.year ? `${item.year}-01-01` : undefined,
        vote_average: item.rating,
      });
    }
  };

  // Bulk remove from watchlist
  const bulkRemoveFromWatchlist = async (tmdbIds: string[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .in('tmdb_id', tmdbIds);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
      showSuccess('Berhasil dihapus', `${tmdbIds.length} item telah dihapus dari watchlist`);
    } catch (error: any) {
      showError('Gagal menghapus', error.message);
    }
  };

  // Get watchlist stats
  const getWatchlistStats = () => {
    const total = watchlist.length;
    const movies = watchlist.filter(item => item.media_type === 'movie').length;
    const tvShows = watchlist.filter(item => item.media_type === 'tv').length;

    return { total, movies, tvShows };
  };

  return {
    watchlist,
    isLoading,
    error,
    isInWatchlist,
    toggleWatchlist,
    bulkRemoveFromWatchlist,
    getWatchlistStats,
    isAddingToWatchlist: addToWatchlistMutation.isPending,
    isRemovingFromWatchlist: removeFromWatchlistMutation.isPending,
  };
};

// Hook for favorites (similar to watchlist)
export const useMobileFavorites = () => {
  const { user } = useMobileAuth();
  const { showSuccess, showError } = useToastHelpers();
  const queryClient = useQueryClient();

  // Fetch favorites
  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!user,
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async (item: {
      tmdb_id: string;
      media_type: 'movie' | 'tv';
      title: string;
      poster_path?: string;
      backdrop_path?: string;
      overview?: string;
      release_date?: string;
      vote_average?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          ...item,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      showSuccess('Ditambahkan ke Favorit', `"${data.title}" berhasil ditambahkan`);
    },
    onError: (error: any) => {
      showError('Gagal menambahkan', error.message);
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (tmdbId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('tmdb_id', tmdbId);

      if (error) throw error;
      return tmdbId;
    },
    onSuccess: (tmdbId) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      const item = favorites.find(f => f.tmdb_id === tmdbId);
      showSuccess('Dihapus dari Favorit', `"${item?.title || 'Item'}" telah dihapus`);
    },
    onError: (error: any) => {
      showError('Gagal menghapus', error.message);
    },
  });

  // Check if item is in favorites
  const isInFavorites = (tmdbId: string) => {
    return favorites.some(item => item.tmdb_id === tmdbId);
  };

  // Toggle favorites
  const toggleFavorites = async (item: {
    id: string;
    title: string;
    poster?: string;
    backdrop?: string;
    overview?: string;
    year?: string;
    rating?: number;
    type: 'movie' | 'tv';
  }) => {
    if (!user) {
      showError('Login diperlukan', 'Silakan login untuk menggunakan favorit');
      return;
    }

    const inFavorites = isInFavorites(item.id);

    if (inFavorites) {
      removeFromFavoritesMutation.mutate(item.id);
    } else {
      addToFavoritesMutation.mutate({
        tmdb_id: item.id,
        media_type: item.type,
        title: item.title,
        poster_path: item.poster?.replace('https://image.tmdb.org/t/p/w500', ''),
        backdrop_path: item.backdrop?.replace('https://image.tmdb.org/t/p/w1280', ''),
        overview: item.overview,
        release_date: item.year ? `${item.year}-01-01` : undefined,
        vote_average: item.rating,
      });
    }
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
