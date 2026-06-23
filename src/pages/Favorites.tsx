
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TMDBMediaItem } from '@/types/tmdb';
import { supabase } from '@/integrations/supabase/client';
import { MovieCard } from '@/components/MovieCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getMovieDetails, getTVDetails } from '@/services/tmdb';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { promisePool } from '@/lib/promisePool';

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (!favoritesData) return [];

      const settledResults = await promisePool(
        favoritesData,
        async (item) => {
          const details = await (item.media_type === 'movie' 
            ? getMovieDetails(item.media_id.toString())
            : getTVDetails(item.media_id.toString())
          );
          return { ...details, media_type: item.media_type, favorite_id: item.id } as TMDBMediaItem & { favorite_id: string };
        },
        5
      );

      const mediaDetails = settledResults
        .filter((res): res is PromiseFulfilledResult<TMDBMediaItem & { favorite_id: string }> => res.status === 'fulfilled')
        .map((res) => res.value);

      return mediaDetails;
    },
    enabled: !!user?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (favoriteId: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast({
        title: "Removed from favorites",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your favorites</h2>
          <Button onClick={() => navigate('/auth')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : favorites?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">No favorites added yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites?.map((item: TMDBMediaItem & { favorite_id: string }) => (
              <div key={`${item.media_type}-${item.id}`} className="relative group">
                <div className="relative">
                  <MovieCard
                    id={Number(item.id)}
                    title={item.title || item.name}
                    posterPath={item.poster_path}
                    overview={item.overview}
                    mediaType={item.media_type}
                    voteAverage={item.vote_average}
                    releaseDate={item.release_date || item.first_air_date}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out z-10 hover:bg-destructive/90"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation
                      deleteMutation.mutate(item.favorite_id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
