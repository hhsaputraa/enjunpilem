import { Link } from 'react-router-dom';
import { getImageUrl } from '@/services/tmdb';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  overview: string;
  mediaType: 'movie' | 'tv';
}

export const MovieCard = ({ id, title, posterPath, overview, mediaType }: MovieCardProps) => {
  return (
    <Link to={`/${mediaType}/${id}`} className="movie-card block">
      <img
        src={getImageUrl(posterPath)}
        alt={title}
        className="w-full h-[300px] object-cover"
      />
      <div className="movie-card-overlay">
        <div className="movie-card-content">
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-sm line-clamp-3">{overview}</p>
        </div>
      </div>
    </Link>
  );
};