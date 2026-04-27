import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CollectionConfig } from '@/config/collections';
import { getCollectionBySlugPreview } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Film, Star, Flame, Trophy, Zap, TrendingUp, LucideIcon } from 'lucide-react';

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
  // ✅ Otomatis fetch data berdasarkan slug
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['collection-preview', collection.slug],
    queryFn: () => collection.queryFn 
      ? collection.queryFn(1).then(result => 'items' in result ? result.items : result)
      : getCollectionBySlugPreview(collection.slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // ✅ Otomatis ambil icon
  const IconComponent = iconMap[collection.icon] || Film;

  return (
    <section className="mb-12 animate-fade-in relative z-0">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
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

      <ScrollArea className="w-full whitespace-nowrap rounded-2xl pb-4">
        <div className="flex space-x-4 pb-4">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-[180px] sm:w-[220px] flex-shrink-0">
                  <div className="h-[270px] sm:h-[330px] rounded-xl bg-muted/50 animate-pulse border border-white/5"></div>
                </div>
              ))
          ) : (
            <>
              {items?.slice(0, 12).map((item: any, index: number) => (
                <div
                  key={item.id}
                  className="w-[180px] sm:w-[220px] flex-shrink-0 transition-opacity duration-500"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <MovieCard
                    id={item.id}
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
                <div className="w-[180px] sm:w-[220px] flex-shrink-0 flex items-center justify-center h-[270px] sm:h-[330px]">
                  <Link 
                    to={`/detail-list-collection?queryKey=${collection.id}`} 
                    className="group w-full h-full p-2"
                  >
                    <Button
                      variant="outline"
                      className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-xl border-dashed border-2 border-muted hover:border-primary/50 bg-transparent hover:bg-accent/5 transition-all duration-300"
                    >
                      <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <ChevronRight className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                        Show More
                      </span>
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="h-2.5 bg-muted/10" />
      </ScrollArea>
    </section>
  );
};
