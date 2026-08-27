'use client';

import React, { useState, memo } from 'react';
// Using regular img tag instead of next/image
import { Star, Play, Plus, Check, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { cn } from '@/lib/utils';

interface PosterCardProps {
  id: string;
  title: string;
  poster: string;
  rating?: number;
  year?: string;
  type?: 'movie' | 'tv';
  isInWatchlist?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  showOverlay?: boolean;
  priority?: boolean;
  onClick?: () => void;
  onWatchlistToggle?: (id: string) => void;
}

const sizeClasses = {
  sm: 'w-24 h-36', // 2:3 ratio
  md: 'w-32 h-48',
  lg: 'w-40 h-60',
  responsive: 'w-full aspect-[2/3]',
};

export const PosterCard: React.FC<PosterCardProps> = memo(({
  id,
  title,
  poster,
  rating,
  year,
  type,
  isInWatchlist: propIsInWatchlist = false,
  className,
  size = 'md',
  showOverlay = true,
  priority = false,
  onClick,
  onWatchlistToggle,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useMobileWatchlist();

  // Use real watchlist state if available, otherwise use prop
  const inWatchlist = isInWatchlist(id) || propIsInWatchlist;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Use real watchlist toggle if available, otherwise use prop callback
    if (toggleWatchlist) {
      toggleWatchlist({
        id,
        title,
        poster,
        rating,
        year,
        type,
      });
    } else {
      onWatchlistToggle?.(id);
    }
  };

  return (
    <div
      className={cn(
        "relative group cursor-pointer transform-gpu will-change-transform",
        "transition-transform duration-200 ease-out",
        "hover:scale-105 active:scale-95",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {/* Poster Image */}
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-muted">
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted animate-pulse" />
            )}
            <img
              src={poster}
              alt={title}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                imageLoaded ? "opacity-100" : "opacity-0",
                "group-hover:scale-110"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center">
              <Film className="w-6 h-6 mb-1 opacity-60" />
              <div className="text-xs">No Image</div>
            </div>
          </div>
        )}

        {/* Overlay */}
        {showOverlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="icon"
                aria-label={`Play ${title}`}
                className="h-12 w-12 rounded-full bg-primary/90 backdrop-blur-sm hover:bg-primary"
              >
                <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
              </Button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                {title}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {typeof rating === 'number' && !isNaN(rating) && rating > 0 && (
                    <Badge variant="secondary" className="text-xs bg-black/60 text-yellow-400 border-yellow-400/30">
                      <Star className="w-3 h-3 fill-current mr-1" />
                      {rating.toFixed(1)}
                    </Badge>
                  )}
                  {year && (
                    <Badge variant="secondary" className="text-xs bg-black/60 text-white border-white/30">
                      {year}
                    </Badge>
                  )}
                </div>

                {/* Watchlist Button */}
                  {/* <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleWatchlistToggle}
                    className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80"
                  >
                    {inWatchlist ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Plus className="h-4 w-4 text-white" />
                    )}
                  </Button> */}
              </div>
            </div>
          </div>
        )}

        {/* Type Badge */}
        {type && (
          <div className="absolute top-2 left-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-2xs font-medium px-1.5 py-0.5 flex items-center justify-center",
                type === 'movie' 
                  ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                  : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
              )}
            >
              {type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
            </Badge>
          </div>
        )}

        {/* Rating Badge (Top Right) */}
        {rating && rating > 0 && !showOverlay && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-2xs bg-black/80 text-yellow-400 border-yellow-400/30">
              <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
              {rating.toFixed(1)}
            </Badge>
          </div>
        )}
      </div>

      {/* Title (Below poster for compact view) */}
      {!showOverlay && (
        <div className="mt-2 px-1">
          <h3 className="font-medium text-sm line-clamp-2 leading-tight">
            {title}
          </h3>
          {year && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {year}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

PosterCard.displayName = 'PosterCard';

// Skeleton version
export const PosterCardSkeleton: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'responsive' }> = ({ 
  size = 'md' 
}) => (
  <div className={cn("animate-pulse", sizeClasses[size])}>
    <div className="w-full h-full bg-muted rounded-xl" />
  </div>
);
