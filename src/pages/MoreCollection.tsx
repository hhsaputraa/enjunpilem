import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEnjunChoice } from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TMDBMediaItem } from '@/types/tmdb';

const MoreCollection = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['enjunChoice', page],
    queryFn: () => getEnjunChoice(page),
  });

  const { items = [], totalPages } = data || {};
  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-sky-600 dark:from-cyan-400 dark:to-blue-500 text-transparent bg-clip-text">
          Top Choice by Enjun - Complete Collection
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array(12).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-full h-[300px] rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {items.map((item: TMDBMediaItem) => (
                <div key={item.id} className="w-full">
                  <MovieCard
                    id={Number(item.id)}
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

            {/* Pagination Controls */}
            <div className="flex justify-center mt-8 gap-4">
  <Button
    onClick={() => setPage((prev) => prev - 1)}
    disabled={page === 1 || isFetching} // Disable jika di halaman pertama
  >
    Previous
  </Button>
  <span className="text-lg font-semibold">{page}</span>
  <Button
    onClick={() => setPage((prev) => prev + 1)}
    disabled={page === totalPages || isFetching} // Disable jika di halaman terakhir
  >
    Next
  </Button>
</div>

          </>
        )}
      </div>
    </div>
  );
};

export default MoreCollection;
