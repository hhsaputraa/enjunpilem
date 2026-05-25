import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchContent } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { SearchBar } from '@/components/SearchBar';
import { TMDBMediaItem } from '@/types/tmdb';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchContent(query),
    enabled: !!query,
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <SearchBar />
        
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Search Results for "{query}"</h2>
          {isLoading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results?.map((item: TMDBMediaItem) => (
                <MovieCard
                  key={item.id}
                  id={Number(item.id)}
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

export default Search;