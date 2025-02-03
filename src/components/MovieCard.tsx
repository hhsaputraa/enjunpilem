import { Link } from 'react-router-dom';
import { getImageUrl } from '@/services/tmdb';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock } from 'lucide-react';

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
          <div className="movie-card-content text-left space-y-2">
            <h3 className="text-lg font-bold mb-2 line-clamp-2">{title}</h3>
            <p className="text-sm line-clamp-3 text-gray-200/90">{overview}</p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {voteAverage && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Star className="w-3 h-3 fill-yellow-300" />
                  {voteAverage.toFixed(1)}
                </Badge>
              )}
              {releaseDate && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500/20 text-blue-300 border-blue-500/30">
                  <Calendar className="w-3 h-3" />
                  {new Date(releaseDate).getFullYear()}
                </Badge>
              )}
              <Badge 
                variant="secondary" 
                className={`flex items-center gap-1 ${
                  mediaType === 'movie' 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                    : 'bg-pink-500/20 text-pink-300 border-pink-500/30'
                }`}
              >
                <Clock className="w-3 h-3" />
                {mediaType === 'movie' ? 'Movie' : 'TV Show'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};