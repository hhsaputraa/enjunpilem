
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTVDetails } from '@/services/tmdb';
import { Skeleton } from '@/components/ui/skeleton';
import { AddToCollectionDialog } from '@/components/AddToCollectionDialog';

const TVShowDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: tvShow, isLoading } = useQuery({
    queryKey: ['tv', id],
    queryFn: () => getTVDetails(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold">TV Show not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          {tvShow.poster_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/w500${tvShow.poster_path}`} 
              alt={tvShow.name} 
              className="w-full rounded-lg"
            />
          ) : (
            <div className="w-full h-[450px] bg-gray-200 rounded-lg flex items-center justify-center">
              No Image
            </div>
          )}
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{tvShow.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {tvShow.first_air_date?.split('-')[0]}
            </span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              {tvShow.vote_average?.toFixed(1)} ★
            </span>
          </div>
          
          <p className="text-gray-700 mb-6">{tvShow.overview}</p>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {tvShow.genres?.map(genre => (
                <span key={genre.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex gap-4">
            <AddToCollectionDialog 
              mediaId={tvShow.id}
              mediaType="tv"
              posterPath={tvShow.poster_path}
              name={tvShow.name}
              overview={tvShow.overview}
              voteAverage={tvShow.vote_average}
              firstAirDate={tvShow.first_air_date}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVShowDetails;
