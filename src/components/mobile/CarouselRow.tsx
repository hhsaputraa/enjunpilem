'use client';

import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PosterCard, PosterCardSkeleton } from './PosterCard';
import { cn } from '@/lib/utils';

export interface CarouselItem {
  id: string;
  title: string;
  poster: string;
  rating?: number;
  year?: string;
  type?: 'movie' | 'tv';
  isInWatchlist?: boolean;
}

interface CarouselRowProps {
  title: string;
  items: CarouselItem[];
  isLoading?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onItemClick?: (item: CarouselItem) => void;
  onWatchlistToggle?: (id: string) => void;
  className?: string;
  itemSize?: 'sm' | 'md' | 'lg';
}

export const CarouselRow: React.FC<CarouselRowProps> = ({
  title,
  items,
  isLoading = false,
  showViewAll = true,
  onViewAll,
  onItemClick,
  onWatchlistToggle,
  className,
  itemSize = 'md',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = itemSize === 'sm' ? 200 : itemSize === 'md' ? 280 : 360;
      // Use requestAnimationFrame to avoid forced reflow
      requestAnimationFrame(() => {
        scrollRef.current?.scrollBy({
          left: direction === 'right' ? scrollAmount : -scrollAmount,
          behavior: 'smooth',
        });
      });
    }
  };

  return (
    <section 
      className={cn("space-y-3", className)}
      aria-label={title}
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 260px' }} // Optimize rendering of off-screen content
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {showViewAll && onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
          >
            Lihat Semua
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-3 overflow-x-auto scrollbar-hide",
            "scroll-smooth snap-x snap-mandatory",
            "px-4 pb-2"
          )}
          role="list"
          aria-label={`${title} items`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 snap-start">
                <PosterCardSkeleton size={itemSize} />
              </div>
            ))
          ) : (
            // Actual items
            items.map((item) => (
              <div key={item.id} className="flex-shrink-0 snap-start" role="listitem">
                <PosterCard
                  id={item.id}
                  title={item.title}
                  poster={item.poster}
                  rating={item.rating}
                  year={item.year}
                  type={item.type}
                  isInWatchlist={item.isInWatchlist}
                  size={itemSize}
                  onClick={() => onItemClick?.(item)}
                  onWatchlistToggle={onWatchlistToggle}
                />
              </div>
            ))
          )}
        </div>

        {/* Scroll Indicators (optional) */}
        {!isLoading && items.length > 3 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              aria-label={`Scroll ${title} left`}
              className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4 rotate-180" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              aria-label={`Scroll ${title} right`}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
    </section>
  );
};

// Specialized carousel variants
export const TrendingCarousel: React.FC<Omit<CarouselRowProps, 'title'>> = (props) => (
  <CarouselRow title="Sedang Tren" itemSize="lg" {...props} />
);

export const NewReleasesCarousel: React.FC<Omit<CarouselRowProps, 'title'>> = (props) => (
  <CarouselRow title="Baru Rilis" {...props} />
);

export const TopRatedCarousel: React.FC<Omit<CarouselRowProps, 'title'>> = (props) => (
  <CarouselRow title="Rating Tertinggi" {...props} />
);

export const RecommendedCarousel: React.FC<Omit<CarouselRowProps, 'title'>> = (props) => (
  <CarouselRow title="Rekomendasi" {...props} />
);

export const ContinueWatchingCarousel: React.FC<Omit<CarouselRowProps, 'title'>> = (props) => (
  <CarouselRow title="Lanjut Tonton" showViewAll={false} {...props} />
);
