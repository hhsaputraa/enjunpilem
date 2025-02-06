import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FolderPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AddToCollectionDialogProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  posterPath?: string;
  title?: string;
  name?: string;
  overview?: string;
  voteAverage?: number;
  releaseDate?: string;
  firstAirDate?: string;
}

export const AddToCollectionDialog = ({ 
  mediaId, 
  mediaType,
  posterPath,
  title,
  name,
  overview,
  voteAverage,
  releaseDate,
  firstAirDate
}: AddToCollectionDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
        .select('*, collection_items!collection_items_collection_id_fkey(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createCollection = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User must be logged in');
      
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .insert({ 
          name,
          user_id: user.id
        })
        .select()
        .single();

      if (collectionError) throw collectionError;

      const { error: itemError } = await supabase
        .from('collection_items')
        .insert({
          collection_id: collection.id,
          media_id: mediaId,
          media_type: mediaType,
          poster_path: posterPath,
          title,
          name,
          overview,
          vote_average: voteAverage,
          release_date: releaseDate,
          first_air_date: firstAirDate
        });

      if (itemError) throw itemError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: "Added to new collection" });
      setNewCollectionName('');
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      // Check if the media item already exists in the collection
      const { data: existingItems } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId)
        .eq('media_id', mediaId)
        .eq('media_type', mediaType);

      if (existingItems && existingItems.length > 0) {
        throw new Error('This item is already in the collection');
      }

      const { error } = await supabase
        .from('collection_items')
        .insert({
          collection_id: collectionId,
          media_id: mediaId,
          media_type: mediaType,
          poster_path: posterPath,
          title,
          name,
          overview,
          vote_average: voteAverage,
          release_date: releaseDate,
          first_air_date: firstAirDate
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: "Added to collection" });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error adding to collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      createCollection.mutate(newCollectionName.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <FolderPlus className="w-4 h-4" />
          Add to Collection
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-4">
            {collections?.map((collection) => {
              const hasItem = collection.collection_items?.some(
                item => item.media_id === mediaId && item.media_type === mediaType
              );
              
              return (
                <Button
                  key={collection.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addToCollection.mutate(collection.id)}
                  disabled={hasItem}
                >
                  {collection.name}
                  {hasItem && <span className="ml-2 text-sm text-muted-foreground">(Already added)</span>}
                </Button>
              );
            })}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or create new collection
              </span>
            </div>
          </div>

          <form onSubmit={handleCreateCollection} className="flex gap-2">
            <Input
              placeholder="New collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
            <Button type="submit" disabled={!newCollectionName.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};