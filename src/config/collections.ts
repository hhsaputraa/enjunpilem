import { 
  getEnjunChoice, 
  get250LetterBoxPaginated,
  getOscarWonPaginated 
} from '@/services/tmdb';

import { TMDBMediaItem } from '@/types/tmdb';

export interface CollectionConfig {
  id: string;
  title: string;
  slug: string; // slug di TMDB list
  icon: string; // lucide icon name
  color: string; // tailwind color class
  description?: string;
  queryFn?: (page: number) => Promise<TMDBMediaItem[] | { items: TMDBMediaItem[]; totalPages: number }>; // Optional custom function
}

// Konfigurasi semua koleksi di satu tempat
export const COLLECTIONS: CollectionConfig[] = [
  {
    id: 'enjunChoice',
    title: 'Top Choice by Enjun',
    slug: 'enjun-choice',
    icon: 'Star',
    color: 'text-yellow-500',
    description: 'Curated collection by Enjun team',
    queryFn: getEnjunChoice, // Custom function yang sudah ada
  },
  {
    id: 'letterbox250',
    title: 'Top 250 Letterboxd',
    slug: '250-letterbox',
    icon: 'Flame',
    color: 'text-red-500',
    description: 'Top 250 movies from Letterboxd',
    queryFn: get250LetterBoxPaginated,
  },
  {
    id: 'oscarWon',
    title: 'Oscar Won Movies',
    slug: 'oscar-won',
    icon: 'Trophy',
    color: 'text-rose-500',
    description: 'Academy Award winning movies',
    queryFn: getOscarWonPaginated,
  },
  // ✅ TAMBAH KOLEKSI BARU CUKUP DI SINI SAJA!
  {
    id: 'nolanFilm',
    title: 'Christopher Nolan Collection',
    slug: 'nolan-film',
    icon: 'Film',
    color: 'text-blue-500',
    description: 'Complete Christopher Nolan filmography',
    // queryFn akan di-generate otomatis dari slug
  },
  {
    id: 'marvelMovies',
    title: 'Marvel Cinematic Universe',
    slug: 'marvel-mcu',
    icon: 'Zap',
    color: 'text-cyan-500',
    description: 'Complete MCU collection',
  },
  {
    id: 'top100Imdb',
    title: 'Top 100 IMDB',
    slug: 'top-100-imdb',
    icon: 'TrendingUp',
    color: 'text-green-500',
    description: 'Top 100 movies from IMDB',
  },
];

// Helper function untuk mendapatkan koleksi berdasarkan ID
export const getCollectionById = (id: string): CollectionConfig | undefined => {
  return COLLECTIONS.find(collection => collection.id === id);
};

// Helper function untuk mendapatkan semua koleksi yang bisa ditampilkan di home
export const getHomeCollections = (): CollectionConfig[] => {
  return COLLECTIONS.filter(collection =>
    // Bisa tambah filter di sini, misalnya hanya yang featured
    true
  );
};

// Helper function untuk mendapatkan koleksi berdasarkan ID array
export const getCollectionsByIds = (ids: string[]): CollectionConfig[] => {
  return ids.map(id => getCollectionById(id)).filter(Boolean) as CollectionConfig[];
};

// Helper function untuk mendapatkan koleksi yang cocok untuk Movies
export const getMovieCollections = (): CollectionConfig[] => {
  // Filter koleksi yang cocok untuk halaman Movies
  const movieCollectionIds = [
    'letterbox250',
    'oscarWon',
    'nolanFilm',
    'enjunChoice'
  ];
  return getCollectionsByIds(movieCollectionIds);
};

// Helper function untuk mendapatkan koleksi yang cocok untuk TV Shows
export const getTVCollections = (): CollectionConfig[] => {
  // Filter koleksi yang cocok untuk halaman TV Shows
  const tvCollectionIds = [
    'marvelMovies', // Bisa juga TV shows
    // Tambah koleksi TV lainnya
  ];
  return getCollectionsByIds(tvCollectionIds);
};
