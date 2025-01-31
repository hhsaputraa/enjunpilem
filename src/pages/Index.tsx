import { useQuery } from '@tanstack/react-query';
import { getTrending } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { SearchBar } from '@/components/SearchBar';

const Index = () => {
  const { data: trending, isLoading } = useQuery({
    queryKey: ['trending'],
    queryFn: getTrending,
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">StreamFlix</h1>
        <SearchBar />
        
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Trending Now</h2>
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trending?.map((item: any) => (
                <MovieCard
                  key={item.id}
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  overview={item.overview}
                  mediaType={item.media_type}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;