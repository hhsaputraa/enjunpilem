import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetails, getTVDetails } from '@/services/tmdb';

const Watch = () => {
  const { type, id } = useParams();
  
  const { data: details, isLoading } = useQuery({
    queryKey: ['details', type, id],
    queryFn: () => type === 'movie' ? getMovieDetails(id!) : getTVDetails(id!),
  });

  if (isLoading) return <div className="text-center p-12">Loading...</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{details?.title || details?.name}</h1>
        <div className="aspect-video w-full mb-6">
          <iframe
            src={`https://player.embed-api.stream/?id=${id}&type=${type}`}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
        </div>
        <div className="prose prose-invert max-w-none">
          <p>{details?.overview}</p>
          <div className="mt-4">
            <p>Release Date: {details?.release_date || details?.first_air_date}</p>
            <p>Rating: {details?.vote_average?.toFixed(1)} / 10</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;