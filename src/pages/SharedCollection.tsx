
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { MovieCard } from '@/components/MovieCard';

const SharedCollection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { collectionId, userId } = location.state || {};
  const [collectionName, setCollectionName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!collectionId || !userId) {
      navigate('/');
    }
  }, [collectionId, userId, navigate]);

  const { data: items, isLoading } = useQuery({
    queryKey: ['shared-collection-items', collectionId],
    queryFn: async () => {
      // Get collection details and items
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select(`
          name,
          profiles!collections_user_id_fkey (username)
        `)
        .eq('id', collectionId)
        .eq('user_id', userId)
        .eq('is_shared', true)
        .single();

      if (collectionError) throw collectionError;
      
      setCollectionName(collection.name);
      setUsername(collection.profiles?.username || 'Unknown');

      // Get collection items
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId);

      if (error) throw error;

      return data.map(item => ({
        ...item,
        tmdb_data: {
          title: item.title || '',
          name: item.name || '',
          poster_path: item.poster_path || '',
          overview: item.overview || '',
          vote_average: item.vote_average || 0,
          release_date: item.release_date,
          first_air_date: item.first_air_date
        }
      }));
    },
    enabled: !!collectionId && !!userId,
  });

  if (!collectionId || !userId) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{collectionName}</h1>
            <p className="text-sm text-muted-foreground">Shared by {username}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : items?.length === 0 ? (
          <p className="text-center text-muted-foreground">No items in this collection</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items?.map((item) => (
              <div key={`${item.media_type}-${item.media_id}`}>
                <MovieCard
                  id={item.media_id}
                  title={item.tmdb_data.title || item.tmdb_data.name || ''}
                  posterPath={item.tmdb_data.poster_path}
                  overview={item.tmdb_data.overview}
                  mediaType={item.media_type}
                  voteAverage={item.tmdb_data.vote_average}
                  releaseDate={item.tmdb_data.release_date || item.tmdb_data.first_air_date}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedCollection;
