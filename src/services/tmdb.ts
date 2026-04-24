
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';
import { tmdbConfig } from '@/config/env';

// Use environment configuration
const API_KEY = tmdbConfig.apiKey;
const BASE_URL = tmdbConfig.baseUrl;
const IMAGE_BASE_URL = tmdbConfig.imageBaseUrl;
const ACCOUNT_ID = tmdbConfig.accountId;
const SESSION_ID = tmdbConfig.sessionId;
const ACCESS_TOKEN = tmdbConfig.accessToken;
const V4_BASE_URL = 'https://api.themoviedb.org/3';

// Cache for account lists to avoid repeated TMDB calls
let accountListsCache: any[] | null = null;

const slugify = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const getAccountLists = async (): Promise<any[]> => {
  if (accountListsCache) return accountListsCache;

  try {
    if (ACCESS_TOKEN) {
      const response = await axios.get(
        `${V4_BASE_URL}/account/${ACCOUNT_ID}/lists`,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json;charset=utf-8',
          },
        }
      );
      accountListsCache = response.data.results;
    } else if (SESSION_ID) {
      const response = await axios.get(
        `${BASE_URL}/account/${ACCOUNT_ID}/lists`,
        {
          params: {
            api_key: API_KEY,
            session_id: SESSION_ID,
          },
        }
      );
      accountListsCache = response.data.results;
    } else {
      throw new Error('TMDB session ID or access token must be provided');
    }
  } catch (error) {
    console.error('Error fetching account lists:', error);
    accountListsCache = [];
  }

  return accountListsCache;
};

const findListBySlug = async (slug: string) => {
  const lists = await getAccountLists();
  return lists.find((list: any) => list.slug === slug || slugify(list.name) === slug);
};

const fetchListItems = async (listId: string, page = 1) => {
  try {
    if (ACCESS_TOKEN) {
      const response = await axios.get(`${V4_BASE_URL}/list/${listId}`, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
        params: { page },
      });
      return {
        items: response.data.results || response.data.items,
        totalPages: response.data.total_pages,
      };
    }
    const response = await axios.get(`${BASE_URL}/list/${listId}`, {
      params: { api_key: API_KEY, page },
    });
    return { items: response.data.items, totalPages: response.data.total_pages };
  } catch (error) {
    console.error('Error fetching list items:', error);
    return { items: [], totalPages: 0 };
  }
};

export const getTrending = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/trending/all/day?api_key=${API_KEY}&page=${page}`);
  return { items: response.data.results, totalPages: response.data.total_pages };
};

export const getPopularMovies = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
  return { items: response.data.results, totalPages: response.data.total_pages };
};

export const getPopularTVShows = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
  return { items: response.data.results, totalPages: response.data.total_pages };
};

export const getTopRatedMovies = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`);
  return { items: response.data.results, totalPages: response.data.total_pages };
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

export const getImageUrl = (path: string, size: 'w300' | 'w500' | 'original' = 'w500') => {
  if (!path) return '/placeholder.svg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Optimized image URL for different screen sizes
export const getResponsiveImageUrl = (path: string) => {
  if (!path) return '/placeholder.svg';

  // Gunakan ukuran yang lebih kecil untuk mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const size = isMobile ? 'w300' : 'w500';

  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// Merge /similar + /recommendations, dedupe, prioritize /similar (genre/keyword based),
// and filter out low-quality entries (no poster, very low vote_count).
const mergeAndFilterRelated = (similar: any[] = [], recommended: any[] = []) => {
  const seen = new Set<number>();
  const merged: any[] = [];

  const pushIfGood = (item: any) => {
    if (!item || !item.id || seen.has(item.id)) return;
    if (!item.poster_path) return; // buang yang tanpa poster
    if ((item.vote_count ?? 0) < 50) return; // buang yang vote_count terlalu rendah
    seen.add(item.id);
    merged.push(item);
  };

  similar.forEach(pushIfGood);
  recommended.forEach(pushIfGood);

  // Sort by vote_average desc sebagai tiebreaker biar yang bagus naik
  return merged.sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
};

export const getMovieRecommendations = async (id: string) => {
  try {
    const [similarRes, recRes] = await Promise.all([
      axios.get(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`),
      axios.get(`${BASE_URL}/movie/${id}/recommendations?api_key=${API_KEY}`),
    ]);
    return mergeAndFilterRelated(similarRes.data.results, recRes.data.results);
  } catch (error) {
    console.error('Error fetching movie related:', error);
    return [];
  }
};

export const getTVRecommendations = async (id: string) => {
  try {
    const [similarRes, recRes] = await Promise.all([
      axios.get(`${BASE_URL}/tv/${id}/similar?api_key=${API_KEY}`),
      axios.get(`${BASE_URL}/tv/${id}/recommendations?api_key=${API_KEY}`),
    ]);
    return mergeAndFilterRelated(similarRes.data.results, recRes.data.results);
  } catch (error) {
    console.error('Error fetching TV related:', error);
    return [];
  }
};

export const getMovieCredits = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`);
  return response.data;
};

export const getTVCredits = async (id: string) => {
  const response = await axios.get(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}`);
  return response.data;
};

export const getNowPlayingMovies = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`);
  return { items: response.data.results, totalPages: response.data.total_pages };
};

export const getTopRatedTVShows = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=${page}`);
  return { items: response.data.results, totalPages: response.data.total_pages };
};

export const getAiringTodayTVShows = async (page: number = 1) => {
  const response = await axios.get(`${BASE_URL}/tv/airing_today?api_key=${API_KEY}&page=${page}`);
  return { items: response.data.results, totalPages: response.data.total_pages };
};

export const getEnjunTop = async () => {
  const list = await findListBySlug('top-4');
  if (!list) return [];
  const { items } = await fetchListItems(list.id);
  return items;
};

export const getEnjunChoice = async (page: number = 1) => {
  const list = await findListBySlug('enjun-choice');
  if (!list) return { items: [], totalPages: 0 };
  return fetchListItems(list.id, page);
};

export const getIndiaAca = async () => {
  const list = await findListBySlug('india-aca-aca');
  if (!list) return [];
  const { items } = await fetchListItems(list.id);
  return items;
};
export const getOscarWon = async () => {
  const list = await findListBySlug('oscar-won');
  if (!list) return [];
  const { items } = await fetchListItems(list.id);
  return items;
};

export const get250LetterBox = async () => {
  const list = await findListBySlug('250-letterbox');
  if (!list) return [];
  const { items } = await fetchListItems(list.id);
  return items;
}

// Version with pagination support
export const get250LetterBoxPaginated = async (page: number = 1) => {
  const list = await findListBySlug('250-letterbox');
  if (!list) return { items: [], totalPages: 0 };
  return fetchListItems(list.id, page);
}

export const getOscarWonPaginated = async (page: number = 1) => {
  const list = await findListBySlug('oscar-won');
  if (!list) return { items: [], totalPages: 0 };
  return fetchListItems(list.id, page);

}

// ✅ GENERIC FUNCTION - Otomatis untuk semua koleksi baru!
export const getCollectionBySlug = async (slug: string, page: number = 1) => {
  const list = await findListBySlug(slug);
  if (!list) return { items: [], totalPages: 0 };
  return fetchListItems(list.id, page);
}

// Helper function untuk non-paginated (untuk preview di home)
export const getCollectionBySlugPreview = async (slug: string) => {
  const list = await findListBySlug(slug);
  if (!list) return [];
  const { items } = await fetchListItems(list.id, 1);
  return items;
}

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