import { Link } from 'react-router-dom';
import { getImageUrl } from '@/services/tmdb';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LazyImage } from './LazyImage';

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
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-400 border-green-400/30 bg-green-500/20';
    if (rating >= 7) return 'text-yellow-400 border-yellow-400/30 bg-yellow-500/20';
    if (rating >= 6) return 'text-orange-400 border-orange-400/30 bg-orange-500/20';
    return 'text-red-400 border-red-400/30 bg-red-500/20';
  };

  return (
    <div className="group relative">
      <Link to={`/${mediaType}/${id}`} className="block">
        <div className="relative h-[330px] rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift hover-scale">
          {/* Optimized Image Container */}
          <LazyImage
            src={getImageUrl(posterPath)}
            alt={title}
            className="group-hover:scale-105 transition-transform duration-300"
            placeholder="Loading..."
          />

          {/* Simplified Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Simplified Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-primary/90 backdrop-blur-sm border border-white/20 hover:bg-primary transition-colors duration-200"
            >
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            </Button>
          </div>

          {/* Simplified Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="space-y-2">
              <h3 className="text-white font-bold text-base leading-tight line-clamp-2">
                {title}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {voteAverage && voteAverage > 0 && (
                  <Badge
                    variant="secondary"
                    className={`flex items-center gap-1 text-xs ${getRatingColor(voteAverage)}`}
                  >
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-semibold">{voteAverage.toFixed(1)}</span>
                  </Badge>
                )}

                {releaseDate && (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(releaseDate).getFullYear()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};