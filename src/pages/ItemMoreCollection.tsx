import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MovieCard } from '@/components/MovieCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';

const ItemMoreCollection = ({ title, queryKey, queryFn }: { title: string; queryKey: string; queryFn: (page: number) => Promise<any> }) => {
    const [page, setPage] = useState(1);
  
    const { data, isLoading, isFetching } = useQuery({
      queryKey: [queryKey, page], 
      queryFn: () => queryFn(page),
    });

    const items = data?.items || [];
    const totalPages = data?.totalPages || 1;
  
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            {title}
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
                {items.map((item: any) => (
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
  
              {/* Pagination */}
              <div className="flex justify-center mt-8 gap-4">
                <Button onClick={() => setPage((prev) => prev - 1)} disabled={page === 1 || isFetching}>
                  Prev
                </Button>
                <span className="font-semibold text-lg">{page} / {totalPages}</span>
                <Button onClick={() => setPage((prev) => prev + 1)} disabled={page === totalPages || isFetching}>
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  export default ItemMoreCollection;
