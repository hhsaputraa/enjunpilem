
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getImageUrl } from '@/services/tmdb';
import { useNavigate } from 'react-router-dom';

interface SharedCollection {
  id: string;
  name: string;
  username: string;
  user_id: string;
  items: {
    id: string;
    media_id: number;
    media_type: string;
    poster_path: string | null;
    title: string | null;
    name: string | null;
  }[];
}

export const SharedCollections = () => {
  const navigate = useNavigate();
  
  const { data: sharedCollections, isLoading } = useQuery({
    queryKey: ['shared-collections'],
    queryFn: async () => {
      // Get shared collections focusing on user "enjun"
      const { data: collections, error } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          user_id,
          profiles!collections_user_id_fkey (username),
          collection_items (
            id,
            media_id,
            media_type,
            poster_path,
            title,
            name
          )
        `)
        .eq('is_shared', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format the data for easier consumption
      return collections.map(collection => ({
        id: collection.id,
        name: collection.name,
        user_id: collection.user_id,
        username: collection.profiles?.username || 'Unknown',
        items: collection.collection_items || []
      })) as SharedCollection[];
    },
  });

  const handleCollectionClick = (collectionId: string, userId: string) => {
    navigate(`/shared-collection/${collectionId}`, { 
      state: { collectionId, userId } 
    });
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Shared Collections</h2>
        <div className="space-y-4">
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!sharedCollections || sharedCollections.length === 0) {
    return null; // Don't show section if no shared collections
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Shared Collections</h2>
      <div className="space-y-6">
        {sharedCollections.map((collection) => (
          <div key={collection.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{collection.name} <span className="text-sm text-muted-foreground">by {collection.username}</span></h3>
            </div>
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
              <div className="flex space-x-4 pb-4" onClick={() => handleCollectionClick(collection.id, collection.user_id)}>
                {collection.items.slice(0, 8).map((item) => (
                  <div key={item.id} className="w-[150px] flex-shrink-0 cursor-pointer">
                    <div className="rounded-md overflow-hidden">
                      {item.poster_path ? (
                        <img
                          src={getImageUrl(item.poster_path)}
                          alt={item.title || item.name || ''}
                          className="w-full h-[200px] object-cover transition-transform hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-[200px] bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm truncate mt-1">{item.title || item.name}</p>
                  </div>
                ))}
                {collection.items.length > 8 && (
                  <div className="w-[150px] flex-shrink-0 flex items-center justify-center h-[200px] bg-gray-800/50 rounded-md cursor-pointer">
                    <span className="text-gray-400">+{collection.items.length - 8} more</span>
                  </div>
                )}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        ))}
      </div>
    </section>
  );
};
