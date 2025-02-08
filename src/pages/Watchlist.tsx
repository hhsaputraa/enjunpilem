
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MovieCard } from '@/components/MovieCard';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getMovieDetails, getTVDetails } from '@/services/tmdb';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Watchlist = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      if (!user) return [];
      const { data: watchlistData } = await supabase
        .from('watchlist')
        .select('*')
        .order('added_at', { ascending: false });

      if (!watchlistData) return [];

      const mediaDetails = await Promise.all(
        watchlistData.map(async (item) => {
          const details = await (item.media_type === 'movie' 
            ? getMovieDetails(item.media_id.toString())
            : getTVDetails(item.media_id.toString())
          );
          return { ...details, media_type: item.media_type, watchlist_id: item.id };
        })
      );

      return mediaDetails;
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (watchlistId: string) => {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('id', watchlistId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      toast({
        title: "Removed from watchlist",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your watchlist</h2>
          <Button onClick={() => navigate('/auth')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  const movies = watchlist?.filter(item => item.media_type === 'movie') || [];
  const tvShows = watchlist?.filter(item => item.media_type === 'tv') || [];

  const MovieList = ({ items }: { items: any[] }) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {items.map((item: any) => (
        <div key={`${item.media_type}-${item.id}`} className="relative group">
          <MovieCard
            id={item.id}
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
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => deleteMutation.mutate(item.watchlist_id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : watchlist?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">No items in watchlist yet</p>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({watchlist?.length || 0})</TabsTrigger>
              <TabsTrigger value="movies">Movies ({movies.length})</TabsTrigger>
              <TabsTrigger value="tv">TV Shows ({tvShows.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <MovieList items={watchlist || []} />
            </TabsContent>
            
            <TabsContent value="movies">
              <MovieList items={movies} />
            </TabsContent>
            
            <TabsContent value="tv">
              <MovieList items={tvShows} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
