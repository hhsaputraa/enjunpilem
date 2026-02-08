import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CollectionConfig } from '@/config/collections';
import { getCollectionBySlugPreview } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';

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
      ? collection.queryFn(1).then(result => result.items || result)
      : getCollectionBySlugPreview(collection.slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // ✅ Otomatis ambil icon dari lucide-react
  const IconComponent = (Icons as any)[collection.icon] || Icons.Film;

  return (
    <section className="mt-16 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
            <IconComponent className={`h-6 w-6 ${collection.color}`} />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {collection.title}
            </h2>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-purple-500 rounded-full mt-1"></div>
          </div>
        </div>
        {showLoadMore && (
          <Link 
            to={`/detail-list-collection?queryKey=${collection.id}`} 
            className="group"
          >
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-white bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 rounded-xl px-6 py-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25"
            >
              <span className="font-semibold">View all</span>
              <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-6 pb-4">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="w-[220px] flex-shrink-0 animate-pulse">
                  <Skeleton className="w-full aspect-[2/3] rounded-2xl mb-4" />
                  <Skeleton className="w-3/4 h-6 mb-2" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
              ))
            ) : (
              <>
                {items.slice(0, 12).map((item: any) => (
                  <div key={item.id} className="w-[220px] flex-shrink-0 group">
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
                
                {showLoadMore && items.length > 12 && (
                  <div className="w-[220px] flex-shrink-0 flex items-center justify-center h-[330px] animate-fade-in">
                    <Link 
                      to={`/detail-list-collection?queryKey=${collection.id}`} 
                      className="group"
                    >
                      <Button
                        variant="outline"
                        className="h-32 w-44 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:from-primary/10 hover:to-purple-500/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/20 backdrop-blur-sm"
                      >
                        <div className="p-3 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors duration-300">
                          <ChevronRight className="h-6 w-6 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                        <span className="font-semibold text-primary group-hover:text-white transition-colors duration-300">
                          See More
                        </span>
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </section>
  );
};
