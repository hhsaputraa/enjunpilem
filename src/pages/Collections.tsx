
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CollectionDetails } from '@/components/CollectionDetails';
import { getImageUrl } from '@/services/tmdb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Share2, Lock } from 'lucide-react';

const Collections = () => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<{ id: string; name: string } | null>(null);

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
          is_shared,
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

  const createCollection = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('You must be logged in to create a collection');
      
      const { data, error } = await supabase
        .from('collections')
        .insert({ 
          name,
          user_id: user.id,
          is_shared: false
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
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error creating collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCollection = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!user) throw new Error('You must be logged in to update a collection');
      
      const { error } = await supabase
        .from('collections')
        .update({ name })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: "Collection updated successfully" });
      setEditingCollection(null);
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('You must be logged in to delete a collection');
      
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id)
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

  const toggleShareMutation = useMutation({
    mutationFn: async ({ id, isShared }: { id: string; isShared: boolean }) => {
      if (!user) throw new Error('You must be logged in to update a collection');
      
      const { error } = await supabase
        .from('collections')
        .update({ is_shared: isShared })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ 
        title: "Collection sharing updated", 
        description: "Your collection's sharing status has been updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating collection sharing",
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

  const handleUpdateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollection && editingCollection.name.trim()) {
      updateCollection.mutate({
        id: editingCollection.id,
        name: editingCollection.name.trim()
      });
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCollection} className="space-y-4">
              <Input
                placeholder="Collection name"
                value={editingCollection?.name || ''}
                onChange={(e) => setEditingCollection(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
              <Button type="submit" disabled={!editingCollection?.name.trim()}>
                Update Collection
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-lg bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : collections?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No collections yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections?.map((collection) => (
              <div
                key={collection.id}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{collection.name}</h3>
                    {collection.is_shared && (
                      <div className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full text-xs">
                        Shared
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleShareMutation.mutate({
                        id: collection.id,
                        isShared: !collection.is_shared
                      })}
                      title={collection.is_shared ? "Make private" : "Share this collection"}
                    >
                      {collection.is_shared ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCollection({ id: collection.id, name: collection.name });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCollection.mutate(collection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {collection.collection_items && collection.collection_items.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4 h-32">
                    {collection.collection_items.slice(0, 3).map((item) => (
                      <div key={item.id} className="relative rounded-md overflow-hidden bg-gray-900">
                        {item.poster_path ? (
                          <img
                            src={getImageUrl(item.poster_path)}
                            alt={item.title || item.name || ''}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground mb-4">
                  {collection.collection_items?.length || 0} items
                </p>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setSelectedCollection({ id: collection.id, name: collection.name })}
                >
                  View Collection
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collections;
