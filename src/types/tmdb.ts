export interface TMDBList {
  id: string | number;
  name: string;
  description?: string | null;
  poster_path?: string | null;
  item_count?: number;
  favorite_count?: number;
  slug?: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMediaItem {
  id: number | string;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: 'movie' | 'tv';
  overview?: string;
  runtime?: number;
  genres?: TMDBGenre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface TMDBActor {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order?: number;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string | null;
  vote_average: number;
  runtime?: number;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  poster_path: string | null;
  air_date: string;
  episodes: TMDBEpisode[];
}
