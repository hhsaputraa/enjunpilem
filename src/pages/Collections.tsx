
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, Search, LayoutGrid, List, ArrowUpDown, Globe, Lock, Combine } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type ViewMode = 'grid' | 'compact';
type SortOption = 'newest' | 'alphabetical' | 'items';

const Collections = () => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionShared, setNewCollectionShared] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<{ id: string; name: string; description: string | null; is_shared: boolean } | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // New UI/UX States
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Reset pagination when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

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
          description,
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

  const filteredAndSortedCollections = useMemo(() => {
    if (!collections) return [];
    
    let result = collections.filter(collection => 
      collection.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'items':
        result.sort((a, b) => (b.collection_items?.length || 0) - (a.collection_items?.length || 0));
        break;
      case 'newest':
      default:
        // Already sorted by recently created if we assume DB order, but let's be safe
        // Result is already ordered by created_at desc from Supabase
        break;
    }

    return result;
  }, [collections, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedCollections.length / ITEMS_PER_PAGE);
  const paginatedCollections = filteredAndSortedCollections.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const createCollection = useMutation({
    mutationFn: async ({ name, description, is_shared }: { name: string; description: string; is_shared: boolean }) => {
      if (!user) throw new Error('You must be logged in to create a collection');
      
      const { data, error } = await supabase
        .from('collections')
        .insert({ 
          name,
          description: description || null,
          is_shared,
          user_id: user.id 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      toast({ title: "Collection created successfully" });
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionShared(false);
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
    mutationFn: async ({ id, name, description, is_shared }: { id: string; name: string; description: string; is_shared: boolean }) => {
      if (!user) throw new Error('You must be logged in to update a collection');
      
      const { error } = await supabase
        .from('collections')
        .update({ name, description: description || null, is_shared })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      toast({ title: "Collection updated successfully" });
      setIsEditDialogOpen(false);
      setEditingCollection(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleShareMutation = useMutation({
    mutationFn: async ({ id, is_shared }: { id: string; is_shared: boolean }) => {
      if (!user) throw new Error('You must be logged in');
      const { error } = await supabase
        .from('collections')
        .update({ is_shared })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      toast({
        title: variables.is_shared ? 'Collection is now Public' : 'Collection is now Private',
        description: variables.is_shared
          ? 'Visible on the Shared Films page.'
          : 'Only you can see this collection.',
      });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update sharing', description: error.message, variant: 'destructive' });
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
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
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
      createCollection.mutate({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        is_shared: newCollectionShared,
      });
    }
  };

  const handleUpdateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCollection && editingCollection.name.trim()) {
      updateCollection.mutate({
        id: editingCollection.id,
        name: editingCollection.name.trim(),
        description: editingCollection.description || '',
        is_shared: editingCollection.is_shared,
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
            description={selectedCollection.description}
            onBack={() => setSelectedCollection(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8 mb-12">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent tracking-tight">
                My Collections
              </h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">
                Organize and manage your favorite Film
              </p>
            </div>
              <div className="flex items-center gap-3">
                {user?.id === import.meta.env.VITE_ALLOWED_ADMIN_ID && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/import-collection")}
                        className="border-white/10 hover:bg-white/5 text-white font-bold h-11 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Combine className="w-4 h-4 text-[#0AC4E0]" />
                        Import Items
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                      Sync collection items from Letterboxd
                    </TooltipContent>
                  </Tooltip>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button className="bg-[#0AC4E0] hover:bg-[#0AC4E0]/80 text-black font-bold h-11 px-6 rounded-xl shadow-lg shadow-[#0AC4E0]/20 transition-all active:scale-95 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        New Collection
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#0AC4E0] text-black font-bold text-[10px] uppercase tracking-widest border-none">
                    Create a new private or public library
                  </TooltipContent>
                </Tooltip>
              <DialogContent className="border-white/10 bg-zinc-950 p-6 sm:rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create Collection</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateCollection} className="space-y-5 mt-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#0AC4E0]">Name</label>
                    <Input
                      placeholder="e.g. Top 20 Favorite Film"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-[#0AC4E0]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#0AC4E0]">Description</label>
                    <Textarea
                      placeholder="What's this collection about?"
                      value={newCollectionDescription}
                      onChange={(e) => setNewCollectionDescription(e.target.value)}
                      className="bg-white/5 border-white/10 rounded-xl focus-visible:ring-[#0AC4E0] min-h-[90px] resize-none"
                      maxLength={500}
                    />
                  </div>
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start gap-3">
                      {newCollectionShared ? (
                        <Globe className="w-5 h-5 text-[#0AC4E0] mt-0.5 shrink-0" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">
                          {newCollectionShared ? 'Public' : 'Private'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {newCollectionShared
                            ? 'Anyone can see this on Shared Films.'
                            : 'Only you can see this collection.'}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={newCollectionShared}
                      onCheckedChange={setNewCollectionShared}
                      className="data-[state=checked]:bg-[#0AC4E0]"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-[#0AC4E0] hover:bg-[#0AC4E0]/80 text-black font-bold rounded-xl" disabled={!newCollectionName.trim()}>
                    Start Collection
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

          <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input
                placeholder="Find a collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-transparent border-none focus:ring-0 h-11 placeholder:text-white/20 text-sm font-medium"
              />
            </div>
            
            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2 pr-2">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 gap-2 text-xs font-bold uppercase tracking-wider hover:bg-white/10 rounded-xl">
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#0AC4E0]" />
                        Sort: {sortBy}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                    Change display order
                  </TooltipContent>
                </Tooltip>
                
                <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-white/10 rounded-xl overflow-hidden p-1">
                  <DropdownMenuItem onClick={() => setSortBy('newest')} className="rounded-lg gap-2 text-xs font-medium focus:bg-[#0AC4E0] focus:text-black cursor-pointer uppercase tracking-wide">Most Recent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('alphabetical')} className="rounded-lg gap-2 text-xs font-medium focus:bg-[#0AC4E0] focus:text-black cursor-pointer uppercase tracking-wide">A - Z</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('items')} className="rounded-lg gap-2 text-xs font-medium focus:bg-[#0AC4E0] focus:text-black cursor-pointer uppercase tracking-wide">Item Count</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex bg-zinc-900 rounded-xl p-1 border border-white/5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setViewMode('grid')}
                      className={cn("h-8 w-8 rounded-lg transition-all", viewMode === 'grid' ? "bg-[#0AC4E0] text-black shadow-lg shadow-[#0AC4E0]/20" : "text-white/40 hover:text-white hover:bg-white/5")}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                    Grid View
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setViewMode('compact')}
                      className={cn("h-8 w-8 rounded-lg transition-all", viewMode === 'compact' ? "bg-[#0AC4E0] text-black shadow-lg shadow-[#0AC4E0]/20" : "text-white/40 hover:text-white hover:bg-white/5")}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                    List View
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Collection Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="border-white/10 bg-zinc-950 p-6 sm:rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Edit Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateCollection} className="space-y-5 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0AC4E0]">Name</label>
                <Input
                  placeholder="Collection name"
                  value={editingCollection?.name || ''}
                  onChange={(e) => setEditingCollection(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="bg-white/5 border-white/10 h-12 rounded-xl focus:ring-[#0AC4E0]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#0AC4E0]">Description (optional)</label>
                <Textarea
                  placeholder="What's this collection about?"
                  value={editingCollection?.description || ''}
                  onChange={(e) => setEditingCollection(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="bg-white/5 border-white/10 rounded-xl focus-visible:ring-[#0AC4E0] min-h-[90px] resize-none"
                  maxLength={500}
                />
              </div>
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  {editingCollection?.is_shared ? (
                    <Globe className="w-5 h-5 text-[#0AC4E0] mt-0.5 shrink-0" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">
                      {editingCollection?.is_shared ? 'Public' : 'Private'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {editingCollection?.is_shared
                        ? 'Anyone can see this on Shared Films.'
                        : 'Only you can see this collection.'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={!!editingCollection?.is_shared}
                  onCheckedChange={(checked) => setEditingCollection(prev => prev ? { ...prev, is_shared: checked } : null)}
                  className="data-[state=checked]:bg-[#0AC4E0]"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-[#0AC4E0] hover:bg-[#0AC4E0]/80 text-black font-bold rounded-xl" disabled={!editingCollection?.name.trim()}>
                Update Collection
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredAndSortedCollections?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 mb-6">
              <Plus className="w-8 h-8 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No collections found</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              {searchQuery ? "We couldn't find any collection matching your search." : "You haven't created any collections yet. Start by creating your first one!"}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
                Clear search
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {paginatedCollections?.map((collection) => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection({ id: collection.id, name: collection.name, description: collection.description })}
                className="group relative flex flex-col rounded-[2.5rem] border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all duration-500 overflow-hidden backdrop-blur-xl cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0AC4E0]/10"
              >
                {/* Content Container (Subtle blur on hover) */}
                <div className="flex flex-col h-full p-6 transition-all duration-500 group-hover:blur-[2px] group-hover:opacity-70">
                  {/* Background Poster Blur */}
                  {collection.collection_items?.[0]?.poster_path && (
                    <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                      <img 
                        src={getImageUrl(collection.collection_items[0].poster_path, 'w300')} 
                        alt="" 
                        className="w-full h-full object-cover blur-2xl scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950/80" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0AC4E0]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="relative flex justify-between items-start mb-8 z-10">
                    <div className="flex flex-col min-w-0">
                      <h3 className="text-2xl font-bold text-white group-hover:text-[#0AC4E0] transition-colors leading-tight truncate pr-4 capitalize">
                        {collection.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0AC4E0]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                          {collection.collection_items?.length || 0} items
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border",
                            collection.is_shared
                              ? "bg-[#0AC4E0]/10 text-[#0AC4E0] border-[#0AC4E0]/30"
                              : "bg-white/5 text-white/50 border-white/10"
                          )}
                        >
                          {collection.is_shared ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          {collection.is_shared ? 'Public' : 'Private'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative h-60 mb-2 z-10 group/stack">
                    {collection.collection_items && collection.collection_items.length > 0 ? (
                      <div className="relative w-full h-full flex items-center justify-center translate-y-2">
                        {collection.collection_items.slice(0, 3).map((item, idx) => (
                          <div 
                            key={item.id} 
                            className="absolute h-[110%] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-all duration-700 border border-white/10"
                            style={{
                              left: '50%',
                              zIndex: 10 - idx,
                              transform: `translateX(-50%) translateX(${(idx - 1) * 35}px) rotate(${(idx - 1) * 6}deg) scale(${1 - idx * 0.08}) translateY(${idx * 8}px)`,
                              opacity: 1 - idx * 0.15
                            }}
                          >
                            <img
                              src={getImageUrl(item.poster_path!, 'w300')}
                              alt={item.title || item.name || ''}
                              className="w-full h-full object-cover group-hover/stack:scale-105 transition-transform duration-1000"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-3xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                          <Plus className="w-5 h-5 text-white/20" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0AC4E0]/40">No items yet</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Management Buttons (Always visible on hover) */}
                <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-30">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-white/10 text-white/40 hover:text-white backdrop-blur-md bg-black/40 border border-white/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleShareMutation.mutate({ id: collection.id, is_shared: !collection.is_shared });
                        }}
                      >
                        {collection.is_shared ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                      {collection.is_shared ? 'Make Private' : 'Make Public'}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-white/10 text-white/40 hover:text-white backdrop-blur-md bg-black/40 border border-white/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCollection({
                            id: collection.id,
                            name: collection.name,
                            description: collection.description,
                            is_shared: !!collection.is_shared,
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                      Edit Collection
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-white/40 hover:text-destructive backdrop-blur-md bg-black/40 border border-white/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCollectionToDelete({ id: collection.id, name: collection.name });
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-destructive/20 border-destructive/50 text-destructive font-bold text-[10px] uppercase tracking-widest">
                      Delete Collection
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Hover Overlay - More subtle */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-zinc-950/60 backdrop-blur-[2px] p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#0AC4E0] text-black flex items-center justify-center mb-4 transition-transform duration-500 shadow-xl shadow-[#0AC4E0]/20">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0AC4E0] mb-3">
                    View Library
                  </span>

                  {collection.description && (
                    <p className="text-sm text-white/80 line-clamp-3 italic max-w-[200px]">
                      "{collection.description}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginatedCollections?.map((collection) => (
              <div
                key={collection.id}
                className="group flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all cursor-pointer"
                onClick={() => setSelectedCollection({ id: collection.id, name: collection.name, description: collection.description })}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                    {collection.collection_items?.[0]?.poster_path && (
                      <img
                        src={getImageUrl(collection.collection_items[0].poster_path, 'w300')}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white group-hover:text-[#0AC4E0] transition-colors truncate">{collection.name}</h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded border",
                          collection.is_shared
                            ? "bg-[#0AC4E0]/10 text-[#0AC4E0] border-[#0AC4E0]/30"
                            : "bg-white/5 text-white/50 border-white/10"
                        )}
                      >
                        {collection.is_shared ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                        {collection.is_shared ? 'Public' : 'Private'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                      {collection.collection_items?.length || 0} ITEMS
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-white/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShareMutation.mutate({ id: collection.id, is_shared: !collection.is_shared });
                          }}
                        >
                          {collection.is_shared ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                        {collection.is_shared ? 'Make Private' : 'Make Public'}
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setEditingCollection({ id: collection.id, name: collection.name, description: collection.description, is_shared: !!collection.is_shared }); setIsEditDialogOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                        Edit Collection
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); setCollectionToDelete({ id: collection.id, name: collection.name }); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-destructive/20 border-destructive/50 text-destructive font-bold text-[10px] uppercase tracking-widest">
                        Delete Collection
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-[#0AC4E0] group-hover:border-transparent transition-all">
                    <ArrowUpDown className="w-3.5 h-3.5 text-white group-hover:text-black hover:rotate-180 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 pb-12">
            <Pagination>
              <PaginationContent className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-1 rounded-2xl">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={cn(
                      "rounded-xl hover:bg-white/10 transition-colors cursor-pointer",
                      currentPage === 1 && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className={cn(
                            "rounded-xl cursor-pointer transition-all",
                            currentPage === page 
                              ? "bg-[#0AC4E0] text-black font-bold shadow-lg shadow-[#0AC4E0]/20 hover:bg-[#0AC4E0]/90 hover:text-black" 
                              : "hover:bg-white/10 text-white/60 hover:text-white"
                          )}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis className="text-white/20" />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={cn(
                      "rounded-xl hover:bg-white/10 transition-colors cursor-pointer",
                      currentPage === totalPages && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                Make sure you want to delete the "{collectionToDelete?.name}" collection? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (collectionToDelete) {
                    deleteCollection.mutate(collectionToDelete.id);
                    setCollectionToDelete(null);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Collections;
