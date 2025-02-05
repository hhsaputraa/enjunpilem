import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MovieCard } from '@/components/MovieCard';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from 'lucide-react';

const Collections = () => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);

  // Get and maintain user session
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
            media_type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createCollection = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('You must be logged in to create a collection');
      
      const { data, error } = await supabase
        .from('collections')
        .insert({ 
          name,
          user_id: user.id 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: "Collection created successfully" });
      setNewCollectionName('');
    },
    onError: (error: any) => {
      toast({
        title: "Error creating collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      if (!user) throw new Error('You must be logged in to delete a collection');
      
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: "Collection deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting collection",
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

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Collections</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCollection} className="space-y-4">
                <Input
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                <Button type="submit" disabled={!newCollectionName.trim()}>
                  Create Collection
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : collections?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">No collections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections?.map((collection) => (
              <div
                key={collection.id}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{collection.name}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCollection.mutate(collection.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {collection.collection_items?.length || 0} items
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;