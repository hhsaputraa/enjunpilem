import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface CollectionDetailsProps {
  collectionId: string;
  collectionName: string;
  onBack: () => void;
}

interface TMDBData {
  title?: string;
  name?: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

interface CollectionItem {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  collection_id: string;
  tmdb_data: TMDBData;
}

export const CollectionDetails = ({ collectionId, collectionName, onBack }: CollectionDetailsProps) => {
  const { data: items, isLoading } = useQuery({
    queryKey: ['collection-items', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId);

      if (error) throw error;

      // Since we don't have a direct relationship with TMDB data in our database,
      // we'll need to fetch it from the TMDB API or use the data that was stored
      // when the item was added to the collection
      return (data || []).map(item => ({
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
      })) as CollectionItem[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-2xl font-bold">{collectionName}</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-lg bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : items?.length === 0 ? (
        <p className="text-center text-muted-foreground">No items in this collection yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items?.map((item) => (
            <MovieCard
              key={`${item.media_type}-${item.media_id}`}
              id={item.media_id}
              title={item.tmdb_data.title || item.tmdb_data.name || ''}
              posterPath={item.tmdb_data.poster_path}
              overview={item.tmdb_data.overview}
              mediaType={item.media_type}
              voteAverage={item.tmdb_data.vote_average}
              releaseDate={item.tmdb_data.release_date || item.tmdb_data.first_air_date}
            />
          ))}
        </div>
      )}
    </div>
  );
};