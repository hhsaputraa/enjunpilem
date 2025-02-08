
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CollectionDetails } from '@/components/CollectionDetails';
import { CollectionSkeleton } from '@/components/collections/CollectionSkeleton';
import { NewCollectionDialog } from '@/components/collections/NewCollectionDialog';
import { CollectionCard } from '@/components/collections/CollectionCard';

const Collections = () => {
  const [selectedCollection, setSelectedCollection] = useState<{ id: string; name: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          collection_items (
            id,
            media_id,
            media_type,
            title,
            name,
            poster_path,
            overview,
            vote_average,
            release_date,
            first_air_date
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching collections:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Collections</h1>
          <p className="text-lg text-muted-foreground">Please sign in to view and manage your collections.</p>
        </div>
      </div>
    );
  }

  if (selectedCollection) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <CollectionDetails
            collectionId={selectedCollection.id}
            collectionName={selectedCollection.name}
            onBack={() => setSelectedCollection(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Collections</h1>
          <NewCollectionDialog userId={user.id} />
        </div>

        {isLoading ? (
          <CollectionSkeleton />
        ) : collections?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No collections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections?.map((collection) => (
              <CollectionCard
                key={collection.id}
                id={collection.id}
                name={collection.name}
                items={collection.collection_items}
                userId={user.id}
                onSelect={(id, name) => setSelectedCollection({ id, name })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
