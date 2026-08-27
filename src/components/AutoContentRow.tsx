import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CollectionConfig } from '@/config/collections';
import { getCollectionBySlugPreview } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronRight, Film, Star, Flame, Trophy, Zap, TrendingUp, LucideIcon } from 'lucide-react';
import { TMDBMediaItem } from '@/types/tmdb';

const iconMap: Record<string, LucideIcon> = {
  Star,
  Flame,
  Trophy,
  Film,
  Zap,
  TrendingUp,
};

interface AutoContentRowProps {
  collection: CollectionConfig;
  showLoadMore?: boolean;
}

export const AutoContentRow: React.FC<AutoContentRowProps> = ({ 
  collection, 
  showLoadMore = true 
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer to defer loading until section is near viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Stop observing once visible
          }
        });
      },
      {
        rootMargin: '400px', // Start loading 400px before section enters viewport
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ✅ Only fetch when section is near viewport
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['collection-preview', collection.slug],
    queryFn: () => collection.queryFn 
      ? collection.queryFn(1).then(result => 'items' in result ? result.items : result)
      : getCollectionBySlugPreview(collection.slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isVisible, // Only fetch when visible
  });

  // ✅ Otomatis ambil icon
  const IconComponent = iconMap[collection.icon] || Film;

  return (
    <section 
      ref={sectionRef} 
      className="mb-12 relative z-0"
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 360px' }}
    >
      <div className="flex items-center justify-between mb-6 px-1 min-h-[52px]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {collection.title}
            </h2>
            <div className="h-1 w-12 bg-primary rounded-full mt-1.5 opacity-80"></div>
          </div>
        </div>
        
        {showLoadMore && (
          <Link to={`/detail-list-collection?queryKey=${collection.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors gap-1"
            >
              <span className="font-medium">View all</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      <div className="w-full relative">
        <div 
          className="flex space-x-4 pb-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {!isVisible || isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                /* Dimensi identik dengan MovieCard: w-[220px] × aspect-[2/3] = 330px */
                <div key={i} className="w-[180px] sm:w-[220px] flex-shrink-0 snap-start">
                  <div className="aspect-[2/3] w-full rounded-xl bg-muted/50 animate-pulse border border-white/5" />
                </div>
              ))
          ) : (
            <>
              {items?.slice(0, 12).map((item: TMDBMediaItem) => (
                <div
                  key={item.id}
                  className="w-[180px] sm:w-[220px] flex-shrink-0 snap-start"
                >
                  <MovieCard
                    id={Number(item.id)}
                    title={item.title || item.name}
                    posterPath={item.poster_path}
                    overview={item.overview}
                    mediaType={item.media_type || (item.title ? "movie" : "tv")}
                    voteAverage={item.vote_average}
                    releaseDate={item.release_date || item.first_air_date}
                  />
                </div>
              ))}
              
              {showLoadMore && (
                /* Tinggi identik dengan MovieCard via aspect-ratio */
                <div className="w-[180px] sm:w-[220px] flex-shrink-0 snap-start">
                  <Link
                    to={`/detail-list-collection?queryKey=${collection.id}`}
                    className="group aspect-[2/3] w-full flex flex-col items-center justify-center gap-3 rounded-xl border-dashed border-2 border-muted hover:border-primary/50 bg-transparent hover:bg-accent/5 transition-all duration-300"
                    aria-label={`Show more from ${collection.title}`}
                  >
                    <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <ChevronRight className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                      Show More
                    </span>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
