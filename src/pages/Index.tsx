
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  getTrending, 
  getPopularMovies, 
  getPopularTVShows,
  getTopRatedMovies,getEnjunChoice,getEnjunTop ,getIndiaAca
} from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { SearchBar } from '@/components/SearchBar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
                    mediaType={item.media_type || (item.first_air_date ? 'tv' : 'movie')}
                    voteAverage={item.vote_average}
                    releaseDate={item.release_date || item.first_air_date}
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
                        <span>Load More</span>
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

const Index = () => {
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
  });

  const { data: popularMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ['popularMovies'],
    queryFn: getPopularMovies,
  });

  const { data: popularTV, isLoading: tvLoading } = useQuery({
    queryKey: ['popularTV'],
    queryFn: getPopularTVShows,
  });

  const { data: topRatedMovies, isLoading: topRatedLoading } = useQuery({
    queryKey: ['topRatedMovies'],
    queryFn: getTopRatedMovies,
  });

  const { data: enjunChoice, isLoading: enjunLoading } = useQuery({
    queryKey: ['enjunChoice'],
    queryFn: getEnjunChoice,
  });
  
  const { data: enjunTop, isLoading: enjunTopLoading } = useQuery({
    queryKey: ['enjunTop'],
    queryFn: getEnjunTop,
  });
  
  const { data: indiaAca, isLoading: indiaAcaLoading } = useQuery({
    queryKey: ['indiaAca'],
    queryFn: getIndiaAca,
  });

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            EnjunPilem
          </h1>
          <SearchBar />
        </div>
        
        <ContentRow title="Trending Now" items={trending || []} isLoading={trendingLoading} />
        <ContentRow title="Popular Movies" items={popularMovies || []} isLoading={moviesLoading} />
        <ContentRow title="Top 4 Enjun" items={enjunTop || []} isLoading={enjunTopLoading} />
        <ContentRow 
          title="Top Choice by Enjun" 
          items={enjunChoice || []} 
          isLoading={enjunLoading} 
          initialLimit={12}
        />
        <ContentRow title="India ACA - ACA nehi nehi" items={indiaAca || []} isLoading={indiaAcaLoading} />
        <ContentRow title="Top Rated Movies" items={topRatedMovies || []} isLoading={topRatedLoading} />
      </div>
    </div>
  );
};

export default Index;
