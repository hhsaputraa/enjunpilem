
import { useQuery } from '@tanstack/react-query';
import { getEnjunChoice } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';

const MoreCollection = () => {
  const { data: enjunChoice, isLoading: enjunLoading } = useQuery({
    queryKey: ['enjunChoice'],
    queryFn: getEnjunChoice,
  });

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Top Choice by Enjun - Complete Collection
        </h1>
        
        {enjunLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-[300px] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {enjunChoice?.map((item: any) => (
              <div key={item.id} className="w-full">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MoreCollection;
