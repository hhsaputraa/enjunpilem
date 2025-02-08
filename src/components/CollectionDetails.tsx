
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['collection-items', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId);

      if (error) throw error;

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

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('collection_items')
        .delete()
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-items', collectionId] });
      toast({
        title: "Removed from collection",
      });
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
            <div key={`${item.media_type}-${item.media_id}`} className="relative group">
              <div className="relative">
                <MovieCard
                  id={item.media_id}
                  title={item.tmdb_data.title || item.tmdb_data.name || ''}
                  posterPath={item.tmdb_data.poster_path}
                  overview={item.tmdb_data.overview}
                  mediaType={item.media_type}
                  voteAverage={item.tmdb_data.vote_average}
                  releaseDate={item.tmdb_data.release_date || item.tmdb_data.first_air_date}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out z-10 hover:bg-destructive/90"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigation
                    deleteMutation.mutate(item.id);
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
  );
};
