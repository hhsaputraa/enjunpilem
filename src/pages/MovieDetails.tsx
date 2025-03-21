
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetails } from '@/services/tmdb';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { AddToCollectionDialog } from '@/components/AddToCollectionDialog';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => getMovieDetails(id as string),
    enabled: !!id,
  });

  const handleWatchClick = () => {
    navigate(`/watch/movie/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">Movie not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          {movie.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title} 
              className="w-full rounded-lg"
            />
          ) : (
            <div className="w-full h-[450px] bg-gray-200 rounded-lg flex items-center justify-center">
              No Image
            </div>
          )}
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {movie.release_date?.split('-')[0]}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {movie.vote_average?.toFixed(1)} ★
            </span>
          </div>
          
          <p className="text-gray-700 mb-6">{movie.overview}</p>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map(genre => (
                <span key={genre.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={handleWatchClick}
              className="bg-red-600 hover:bg-red-700"
            >
              <Play className="mr-2 h-4 w-4" /> Watch Now
            </Button>
            <AddToCollectionDialog 
              mediaId={movie.id}
              mediaType="movie"
              posterPath={movie.poster_path}
              title={movie.title}
              overview={movie.overview}
              voteAverage={movie.vote_average}
              releaseDate={movie.release_date}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
