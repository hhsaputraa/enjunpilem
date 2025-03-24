import axios from 'axios';

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
    totalPages: response.data.total_pages, // Ambil total halaman
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
