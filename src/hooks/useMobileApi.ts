import { useQuery } from '@tanstack/react-query';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getNowPlayingMovies,
  getMovieDetails,
  getTVDetails,
  getMovieCredits,
  getTVCredits,
  getMovieRecommendations,
  getTVRecommendations,
  searchContent,
  getImageUrl,
  getResponsiveImageUrl,
} from '@/services/tmdb';

// Hook for trending content (hero slider)
export const useTrending = () => {
  return useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for popular movies
export const usePopularMovies = () => {
  return useQuery({
    queryKey: ['popular-movies'],
    queryFn: getPopularMovies,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for popular TV shows
export const usePopularTVShows = () => {
  return useQuery({
    queryKey: ['popular-tv'],
    queryFn: getPopularTVShows,
    staleTime: 10 * 60 * 1000,
  });
};

// Hook for top rated movies
export const useTopRatedMovies = () => {
  return useQuery({
    queryKey: ['top-rated-movies'],
    queryFn: getTopRatedMovies,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook for top rated TV shows
export const useTopRatedTVShows = () => {
  return useQuery({
    queryKey: ['top-rated-tv'],
    queryFn: getTopRatedTVShows,
    staleTime: 30 * 60 * 1000,
  });
};

// Hook for now playing movies
export const useNowPlayingMovies = () => {
  return useQuery({
    queryKey: ['now-playing'],
    queryFn: getNowPlayingMovies,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for movie/TV details
export const useContentDetails = (type: 'movie' | 'tv', id: string) => {
  return useQuery({
    queryKey: ['content-details', type, id],
    queryFn: () => type === 'movie' ? getMovieDetails(id) : getTVDetails(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for movie/TV credits
export const useContentCredits = (type: 'movie' | 'tv', id: string) => {
  return useQuery({
    queryKey: ['content-credits', type, id],
    queryFn: () => type === 'movie' ? getMovieCredits(id) : getTVCredits(id),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  });
};

// Hook for recommendations
export const useContentRecommendations = (type: 'movie' | 'tv', id: string) => {
  return useQuery({
    queryKey: ['content-recommendations', type, id],
    queryFn: () => type === 'movie' ? getMovieRecommendations(id) : getTVRecommendations(id),
    enabled: !!id,
    staleTime: 30 * 60 * 1000,
  });
};

// Hook for search with debounce
export const useSearch = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchContent(query),
    enabled: enabled && query.length > 2,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for mixed content (movies + TV shows)
export const useMixedContent = () => {
  const trendingQuery = useTrending();
  const popularMoviesQuery = usePopularMovies();
  const popularTVQuery = usePopularTVShows();
  const topRatedMoviesQuery = useTopRatedMovies();
  const nowPlayingQuery = useNowPlayingMovies();

  return {
    trending: {
      data: trendingQuery.data || [],
      isLoading: trendingQuery.isLoading,
      error: trendingQuery.error,
    },
    popularMovies: {
      data: popularMoviesQuery.data || [],
      isLoading: popularMoviesQuery.isLoading,
      error: popularMoviesQuery.error,
    },
    popularTV: {
      data: popularTVQuery.data || [],
      isLoading: popularTVQuery.isLoading,
      error: popularTVQuery.error,
    },
    topRatedMovies: {
      data: topRatedMoviesQuery.data || [],
      isLoading: topRatedMoviesQuery.isLoading,
      error: topRatedMoviesQuery.error,
    },
    nowPlaying: {
      data: nowPlayingQuery.data || [],
      isLoading: nowPlayingQuery.isLoading,
      error: nowPlayingQuery.error,
    },
    isLoading: trendingQuery.isLoading || popularMoviesQuery.isLoading || popularTVQuery.isLoading,
  };
};

// Utility functions
export const formatContentForMobile = (item: any) => {
  return {
    id: item.id.toString(),
    title: item.title || item.name || 'Unknown Title',
    poster: getResponsiveImageUrl(item.poster_path),
    backdrop: getImageUrl(item.backdrop_path, 'original'),
    rating: item.vote_average,
    year: item.release_date ? new Date(item.release_date).getFullYear().toString() : 
          item.first_air_date ? new Date(item.first_air_date).getFullYear().toString() : '',
    type: item.media_type || (item.title ? 'movie' : 'tv') as 'movie' | 'tv',
    overview: item.overview || '',
    isInWatchlist: false, // Will be updated from Supabase
  };
};

// Transform TMDB data for mobile components
export const transformTMDBData = (data: any[]) => {
  return data.map(formatContentForMobile);
};

// Hook for explore page with pagination
export const useExploreContent = (
  type: 'movie' | 'tv' | 'all' = 'all',
  genre?: string,
  sortBy: string = 'popularity',
  page: number = 1
) => {
  // For now, we'll use existing endpoints
  // In a real implementation, you'd want to add genre filtering and sorting to the API
  const queryKey = ['explore', type, genre, sortBy, page];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      let data = [];
      
      if (type === 'movie' || type === 'all') {
        const movies = await getPopularMovies();
        data = [...data, ...movies];
      }
      
      if (type === 'tv' || type === 'all') {
        const tvShows = await getPopularTVShows();
        data = [...data, ...tvShows];
      }
      
      return transformTMDBData(data);
    },
    staleTime: 10 * 60 * 1000,
  });
};
