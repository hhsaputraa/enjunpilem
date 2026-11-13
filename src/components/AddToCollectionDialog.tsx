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
import { Plus, FolderPlus, Search, Loader2, Folder, CheckCircle2 } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

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
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          collection_items!collection_items_collection_id_fkey(
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
    mutationFn: async (nameToCreate: string) => {
      if (!user) throw new Error('User must be logged in');
      
      const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .insert({ 
          name: nameToCreate,
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
          title: mediaType === 'movie' ? title : undefined,
          name: mediaType === 'tv' ? title : undefined,
          overview,
          vote_average: voteAverage,
          release_date: releaseDate,
          first_air_date: firstAirDate
        });

      if (itemError) throw itemError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: "Created and added to new collection" });
      setSearchQuery('');
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      const { error } = await supabase
        .from('collection_items')
        .insert({
          collection_id: collectionId,
          media_id: mediaId,
          media_type: mediaType,
          poster_path: posterPath,
          title: mediaType === 'movie' ? title : undefined,
          name: mediaType === 'tv' ? title : undefined,
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
    onError: (error: Error) => {
      toast({
        title: "Error adding to collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const exactMatch = collections?.find(c => c.name.toLowerCase() === searchQuery.toLowerCase());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-background/50 backdrop-blur-sm border-border hover:bg-accent text-foreground transition-all duration-300">
          <FolderPlus className="w-4 h-4 text-primary" />
          Add to Collection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-border bg-card text-card-foreground shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
            Add to Collection
          </DialogTitle>
        </DialogHeader>

        <Command className="bg-transparent" shouldFilter={true}>
          <CommandInput 
            placeholder="Search or create collections..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12 bg-transparent outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 border-none placeholder:text-muted-foreground text-foreground px-4"
            containerClassName="px-6 border-none focus-within:ring-0"
          />
          
          <CommandList className="max-h-[300px] overflow-visible pb-2">
            <ScrollArea className="h-[300px] px-2">
              <CommandEmpty className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
                  <Search className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-6">No collections found.</p>
                {searchQuery && (
                  <Button 
                    size="sm" 
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 transition-all active:scale-95"
                    onClick={() => createCollection.mutate(searchQuery)}
                    disabled={createCollection.isPending}
                  >
                    <Plus className="w-4 h-4" />
                    Create "{searchQuery}"
                  </Button>
                )}
              </CommandEmpty>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground animate-pulse">Scanning collections...</p>
                </div>
              ) : (
                <>
                  {collections && collections.length > 0 && (
                    <CommandGroup heading="Existing" className="px-2">
                      <div className="space-y-1">
                        {collections.map((collection) => {
                          const isAlreadyAdded = collection.collection_items?.some(
                            (item: { media_id: number; media_type: string }) => item.media_id === mediaId && item.media_type === mediaType
                          );

                          return (
                            <CommandItem
                              key={collection.id}
                              value={collection.name}
                              onSelect={() => !isAlreadyAdded && addToCollection.mutate(collection.id)}
                              disabled={isAlreadyAdded || addToCollection.isPending}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group mb-1",
                                isAlreadyAdded 
                                  ? "opacity-50 cursor-default bg-transparent" 
                                  : "hover:bg-accent aria-selected:bg-accent"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-200",
                                  isAlreadyAdded 
                                    ? "bg-muted border-border" 
                                    : "bg-muted border-border group-hover:border-primary/40 group-hover:bg-primary/10"
                                )}>
                                  <Folder className={cn(
                                    "w-5 h-5 transition-colors",
                                    isAlreadyAdded ? "text-muted-foreground/40" : "text-muted-foreground group-hover:text-primary"
                                  )} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className={cn(
                                    "text-sm font-semibold transition-colors",
                                    isAlreadyAdded ? "text-muted-foreground" : "text-foreground group-hover:text-primary"
                                  )}>
                                    {collection.name}
                                  </span>
                                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                                    {collection.collection_items?.length || 0} items
                                  </span>
                                </div>
                              </div>
                              
                              {isAlreadyAdded && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">In Collection</span>
                                </div>
                              )}
                            </CommandItem>
                          );
                        })}
                      </div>
                    </CommandGroup>
                  )}

                  {searchQuery && !exactMatch && (
                    <CommandGroup heading="Actions" className="px-2 mt-2">
                      <CommandItem
                        value={searchQuery}
                        onSelect={() => createCollection.mutate(searchQuery)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/10 group cursor-pointer transition-all duration-200 border border-transparent hover:border-primary/20"
                      >
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20">
                          <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary">New Collection</span>
                          <span className="text-xs text-muted-foreground italic">"{searchQuery}"</span>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </>
              )}
            </ScrollArea>
          </CommandList>
        </Command>

        <div className="mt-auto">
          <div className="px-6 py-4 border-t border-border bg-muted/40 backdrop-blur-md flex items-center gap-4">
            <div className="w-14 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border shadow-md">
              {posterPath ? (
                <img 
                  src={`https://image.tmdb.org/t/p/w92${posterPath}`} 
                  alt={title || name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Currently Adding</span>
              <span className="text-sm font-bold text-foreground truncate leading-tight">{title || name}</span>
              <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
                {overview || "No description available"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


