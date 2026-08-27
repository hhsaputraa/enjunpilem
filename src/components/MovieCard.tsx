import { Link } from 'react-router-dom';
import { getResponsiveImageUrl } from '@/services/tmdb';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Play, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, memo } from 'react';
import { cn } from "@/lib/utils";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string;
  overview: string;
  mediaType: 'movie' | 'tv';
  voteAverage?: number;
  releaseDate?: string;
  priority?: boolean;
}

export const MovieCard = memo(({
  id,
  title,
  posterPath,
  overview,
  mediaType,
  voteAverage,
  releaseDate,
  priority = false
}: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (rating >= 7) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    if (rating >= 6) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="group relative">
      <Link to={`/${mediaType}/${id}`} className="block">
        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ring-1 ring-border/50 hover:ring-primary/50 transform-gpu will-change-transform">
          {/* Image container — aspect-ratio menjaga dimensi tetap sebelum gambar load */}
          <div className="relative h-full w-full overflow-hidden">
            {!imageError ? (
              <>
                {/* Skeleton background — selalu ada, hilang saat gambar load */}
                <div className={cn(
                  "absolute inset-0 bg-muted transition-opacity duration-300",
                  imageLoaded ? "opacity-0" : "opacity-100 animate-pulse"
                )} />
                <img
                  src={getResponsiveImageUrl(posterPath)}
                  alt={title}
                  width={220}
                  height={330}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-500",
                    imageLoaded ? "opacity-100" : "opacity-0",
                    "group-hover:scale-110"
                  )}
                  loading={priority ? 'eager' : 'lazy'}
                  decoding="async"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground flex flex-col items-center justify-center">
                  <Film className="w-8 h-8 mb-2 opacity-50" />
                  <div className="text-sm">No Image</div>
                </div>
              </div>
            )}
          </div>

          {/* Clean Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
            <div className="h-12 w-12 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg text-primary-foreground transform transition-transform group-active:scale-95">
              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="space-y-2">
              <h3 className="text-white font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">
                {title}
              </h3>

              <div className="flex flex-wrap items-center gap-1.5">
                {voteAverage && voteAverage > 0 && (
                  <div
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md",
                      getRatingColor(voteAverage)
                    )}
                  >
                    <Star className="w-2.5 h-2.5 fill-current" />
                    <span>{voteAverage.toFixed(1)}</span>
                  </div>
                )}

                {releaseDate && !isNaN(new Date(releaseDate).getTime()) && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-white/10 text-white/90 border border-white/10 backdrop-blur-md">
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(releaseDate).getFullYear()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

MovieCard.displayName = 'MovieCard';