import { Link } from 'react-router-dom';
import { getImageUrl } from '@/services/tmdb';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  overview: string;
  mediaType: 'movie' | 'tv';
  voteAverage?: number;
  releaseDate?: string;
}

export const MovieCard = ({ 
  id, 
  title, 
  posterPath, 
  overview, 
  mediaType,
  voteAverage,
  releaseDate 
}: MovieCardProps) => {
  return (
    <Link to={`/${mediaType}/${id}`} className="movie-card block">
      <div className="relative h-[300px] rounded-lg overflow-hidden">
        <img
          src={getImageUrl(posterPath)}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="movie-card-overlay">
          <div className="movie-card-content text-left">
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm line-clamp-3 mb-2 text-gray-200">{overview}</p>
            <div className="flex items-center gap-2">
              {voteAverage && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {voteAverage.toFixed(1)}
                </Badge>
              )}
              {releaseDate && (
                <Badge variant="outline">
                  {new Date(releaseDate).getFullYear()}
                </Badge>
              )}
              <Badge variant="default">
                {mediaType === 'movie' ? 'Movie' : 'TV Show'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};