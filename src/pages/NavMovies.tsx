
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies,
  getHarryPotterCollection,
  getEnjunChoice
} from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ContentRow = ({ 
  title, 
  items, 
  isLoading,
  initialLimit = 0
}: { 
  title: string; 
  items: any[]; 
  isLoading: boolean;
  initialLimit?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const showLoadMore = initialLimit > 0 && items?.length > initialLimit;
  const displayItems = showLoadMore && !expanded ? items?.slice(0, initialLimit) : items;

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex space-x-4 pb-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-[200px] h-[300px] rounded-lg flex-shrink-0" />
            ))
          ) : (
            <>
              {displayItems?.map((item: any) => (
                <div key={item.id} className="w-[200px] flex-shrink-0">
                  <MovieCard
                    id={item.id}
                    title={item.title || item.name}
                    posterPath={item.poster_path}
                    overview={item.overview}
                    mediaType="movie"
                    voteAverage={item.vote_average}
                    releaseDate={item.release_date}
                  />
                </div>
              ))}
              
              {showLoadMore && (
                <div className="w-[200px] flex-shrink-0 flex items-center justify-center">
                  <Button 
                    variant="outline" 
                    className="h-[300px] w-full rounded-lg border-dashed flex flex-col gap-2"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-6 w-6" />
                        <span>Show Less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-6 w-6" />
                        <span>Load More ({items.length - initialLimit} more)</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </section>
  );
};

const NavMovies = () => {
  const { data: popularMovies, isLoading: popularLoading } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
  });

  const { data: topRatedMovies, isLoading: topRatedLoading } = useQuery({
    queryKey: ['topRatedMovies'],
    queryFn: getTopRatedMovies,
  });

  const { data: nowPlayingMovies, isLoading: nowPlayingLoading } = useQuery({
    queryKey: ['nowPlayingMovies'],
    queryFn: getNowPlayingMovies,
  });

  const { data: harryPotterMovies, isLoading: harryPotterLoading } = useQuery({
    queryKey: ['harryPotterCollection'],
    queryFn: getHarryPotterCollection,
  });

  const { data: enjunChoice, isLoading: enjunChoiceLoading } = useQuery({
    queryKey: ['enjunChoice'],
    queryFn: getEnjunChoice,
  });

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Movies
        </h1>
        
        <ContentRow title="Now Playing" items={nowPlayingMovies || []} isLoading={nowPlayingLoading} />
        <ContentRow title="Harry Potter Collection" items={harryPotterMovies || []} isLoading={harryPotterLoading} />
        <ContentRow 
          title="Top Choice by Enjun" 
          items={enjunChoice || []} 
          isLoading={enjunChoiceLoading}
          initialLimit={12}
        />
        <ContentRow title="Popular Movies" items={popularMovies || []} isLoading={popularLoading} />
        <ContentRow title="Top Rated Movies" items={topRatedMovies || []} isLoading={topRatedLoading} />
      </div>
    </div>
  );
};

export default NavMovies;
