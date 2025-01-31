import axios from 'axios';

const API_KEY = '7ade81ac5dcabfafe1963455e05c35b9';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getTrending = async () => {
  const response = await axios.get(`${BASE_URL}/trending/all/day?api_key=${API_KEY}`);
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

export const searchContent = async (query: string) => {
  const response = await axios.get(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  );
  return response.data.results;
};

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  return `${IMAGE_BASE_URL}/${size}${path}`;
};