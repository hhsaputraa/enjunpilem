
import { useQuery } from '@tanstack/react-query';
import { getPopularTVShows, getTopRatedTVShows, getAiringTodayTVShows } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

const ContentRow = ({ title, items, isLoading }: { title: string; items: any[]; isLoading: boolean }) => (
  <section className="mt-8">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <ScrollArea className="w-full whitespace-nowrap rounded-md">
      <div className="flex space-x-4 pb-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="w-[200px] h-[300px] rounded-lg flex-shrink-0" />
          ))
        ) : (
          items?.map((item: any) => (
            <div key={item.id} className="w-[200px] flex-shrink-0">
              <MovieCard
                id={item.id}
                title={item.name}
                posterPath={item.poster_path}
                overview={item.overview}
                mediaType="tv"
                voteAverage={item.vote_average}
                releaseDate={item.first_air_date}
              />
            </div>
          ))
        )}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </section>
);

const NavTVShows = () => {
  const { data: popularTVShows, isLoading: popularLoading } = useQuery({
    queryKey: ['popularTV'],
    queryFn: () => getPopularTVShows(1),
  });

  const { data: topRatedTVShows, isLoading: topRatedLoading } = useQuery({
    queryKey: ['topRatedTV'],
    queryFn: () => getTopRatedTVShows(1),
  });

  const { data: airingTodayTVShows, isLoading: airingTodayLoading } = useQuery({
    queryKey: ['airingTodayTV'],
    queryFn: () => getAiringTodayTVShows(1),
  });

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          TV Shows
        </h1>
        
        <ContentRow title="Airing Today" items={airingTodayTVShows?.items || []} isLoading={airingTodayLoading} />
        <ContentRow title="Popular TV Shows" items={popularTVShows?.items || []} isLoading={popularLoading} />
        <ContentRow title="Top Rated TV Shows" items={topRatedTVShows?.items || []} isLoading={topRatedLoading} />
      </div>
    </div>
  );
};

export default NavTVShows;
