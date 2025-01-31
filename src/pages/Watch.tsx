import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  getMovieDetails, 
  getTVDetails, 
  getMovieRecommendations,
  getTVRecommendations,
  getMovieCredits,
  getTVCredits,
  getImageUrl 
} from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Calendar, Clock } from 'lucide-react';

const Watch = () => {
  const { type, id } = useParams();
  
  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ['details', type, id],
    queryFn: () => type === 'movie' ? getMovieDetails(id!) : getTVDetails(id!),
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations', type, id],
    queryFn: () => type === 'movie' ? getMovieRecommendations(id!) : getTVRecommendations(id!),
  });

  const { data: credits, isLoading: creditsLoading } = useQuery({
    queryKey: ['credits', type, id],
    queryFn: () => type === 'movie' ? getMovieCredits(id!) : getTVCredits(id!),
  });

  if (detailsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="w-full aspect-video mb-6" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{details?.title || details?.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {details?.vote_average?.toFixed(1)}/10
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(details?.release_date || details?.first_air_date).getFullYear()}
            </Badge>
            {details?.runtime && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {details.runtime} min
              </Badge>
            )}
          </div>
        </div>

        <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden">
          <iframe
            src={`https://player.embed-api.stream/?id=${id}&type=${type}`}
            className="w-full h-full"
            allowFullScreen
          />
        </div>

        <div className="prose prose-invert max-w-none mb-8">
          <p className="text-lg">{details?.overview}</p>
        </div>

        {!creditsLoading && credits?.cast && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cast</h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-4">
                {credits.cast.slice(0, 10).map((actor: any) => (
                  <div key={actor.id} className="flex-shrink-0 w-[150px]">
                    <div className="rounded-lg overflow-hidden mb-2">
                      <img
                        src={getImageUrl(actor.profile_path)}
                        alt={actor.name}
                        className="w-full h-[225px] object-cover"
                      />
                    </div>
                    <p className="font-semibold truncate">{actor.name}</p>
                    <p className="text-sm text-gray-400 truncate">{actor.character}</p>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {!recommendationsLoading && recommendations?.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">More Like This</h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-4">
                {recommendations.map((item: any) => (
                  <div key={item.id} className="w-[200px] flex-shrink-0">
                    <MovieCard
                      id={item.id}
                      title={item.title || item.name}
                      posterPath={item.poster_path}
                      overview={item.overview}
                      mediaType={type as 'movie' | 'tv'}
                      voteAverage={item.vote_average}
                      releaseDate={item.release_date || item.first_air_date}
                    />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}
      </div>
    </div>
  );
};

export default Watch;