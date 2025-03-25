
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

const API_KEY = '7ade81ac5dcabfafe1963455e05c35b9';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getTrending = async () => {
  const response = await axios.get(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`);
  return response.data.results;
};

export const getPopularMovies = async () => {
  const response = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  return response.data.results;
};

export const getPopularTVShows = async () => {
  const response = await axios.get(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
  return response.data.results;
};

export const getTopRatedMovies = async () => {
  const response = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
  return response.data.results;
};

export const getMovieDetails = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
  return response.data;
};

export const getTVDetails = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
  return response.data;
};

export const getTVSeasonDetails = async (id: string, seasonNumber: number) => {
  const response = await axios.get(
    `${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`
  );
  return response.data;
};

export const searchContent = async (query: string) => {
  const response = await axios.get(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  return response.data.results;
};

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getMovieRecommendations = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}/recommendations?api_key=${API_KEY}`);
  return response.data.results;
};

export const getTVRecommendations = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/tv/${id}/recommendations?api_key=${API_KEY}`);
  return response.data.results;
};

export const getMovieCredits = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`);
  return response.data;
};

export const getTVCredits = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}`);
  return response.data;
};

export const getNowPlayingMovies = async () => {
  const response = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
  return response.data.results;
};

export const getTopRatedTVShows = async () => {
  const response = await axios.get(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}`);
  return response.data.results;
};

export const getAiringTodayTVShows = async () => {
  const response = await axios.get(`${BASE_URL}/tv/airing_today?api_key=${API_KEY}`);
  return response.data.results;
};

export const getEnjunTop = async () => {
  const response = await axios.get(`${BASE_URL}/list/8520113?api_key=${API_KEY}`);
  return response.data.items;
};

export const getEnjunChoice = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/list/8520116`, {
    params: {
      api_key: API_KEY,
      page: page,
    },
  });
  return {
    items: response.data.items,
    totalPages: response.data.total_pages,
  };
};

export const getIndiaAca = async () => {
  const response = await axios.get(`${BASE_URL}/list/8520117?api_key=${API_KEY}`);
  return response.data.items;
};

export const getHarryPotterCollection = async () => {
  const response = await axios.get(`${BASE_URL}/collection/1241?api_key=${API_KEY}`);
  return response.data.parts;
};

// Define the type for watched episodes
interface WatchedEpisode {
  id: string;
  user_id: string;
  tv_id: number;
  tv_name: string;
  season_number: number;
  episode_number: number;
  created_at: string;
  updated_at: string;
}

export const getWatchedEpisodes = async (tvId: string): Promise<WatchedEpisode | null> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return null;
  
  const { data, error } = await supabase
    .from('watched_episodes')
    .select('*')
    .eq('tv_id', parseInt(tvId))
    .eq('user_id', session.session.user.id)
    .single();
  
  if (error && error.code !== 'PGSQL_NO_ROWS_RETURNED') {
    console.error('Error fetching watched episodes:', error);
  }
  
  return data as WatchedEpisode | null;
};

export const updateWatchedEpisode = async (
  tvId: string, 
  seasonNumber: number, 
  episodeNumber: number, 
  tvName: string
): Promise<WatchedEpisode | null> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return null;
  
  const { data: existingRecord } = await supabase
    .from('watched_episodes')
    .select('*')
    .eq('tv_id', parseInt(tvId))
    .eq('user_id', session.session.user.id)
    .single();
  
  if (existingRecord) {
    const { data, error } = await supabase
      .from('watched_episodes')
      .update({
        season_number: seasonNumber,
        episode_number: episodeNumber,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingRecord.id)
      .select()
      .single();
    
    if (error) console.error('Error updating watched episode:', error);
    return data as WatchedEpisode | null;
  } else {
    const { data, error } = await supabase
      .from('watched_episodes')
      .insert({
        user_id: session.session.user.id,
        tv_id: parseInt(tvId),
        tv_name: tvName,
        season_number: seasonNumber,
        episode_number: episodeNumber
      })
      .select()
      .single();
    
    if (error) console.error('Error inserting watched episode:', error);
    return data as WatchedEpisode | null;
  }
};
