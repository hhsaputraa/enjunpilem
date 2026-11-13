import { useState, useEffect, useMemo, useDeferredValue } from 'react';
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
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Search, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  Globe, 
  Lock, 
  Combine, 
  Film, 
  Play, 
  MoreVertical,
  Layers
} from 'lucide-react';
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
  DropdownMenuSeparator,
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
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<{ id: string; name: string; description: string | null; is_shared: boolean } | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);
  
  // UI/UX States
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Reset pagination when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery, sortBy]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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
          created_at,
          collection_items (
            id,
            poster_path
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredAndSortedCollections = useMemo(() => {
    if (!collections) return [];
    
    const query = deferredSearchQuery.trim().toLowerCase();
    const result = query 
      ? collections.filter(collection => 
          (collection.name || '').toLowerCase().includes(query) ||
          (collection.description || '').toLowerCase().includes(query)
        )
      : [...collections];

    switch (sortBy) {
      case 'alphabetical':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'items':
        result.sort((a, b) => (b.collection_items?.length || 0) - (a.collection_items?.length || 0));
        break;
      case 'newest':
      default:
        break;
    }

    return result;
  }, [collections, deferredSearchQuery, sortBy]);

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
    onError: (error: Error) => {
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
    onError: (error: Error) => {
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
    onError: (error: Error) => {
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
    onError: (error: Error) => {
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

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-48 bg-muted rounded-xl"></div>
          <div className="h-4 w-64 bg-muted/70 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
            <Layers className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Collections</h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Please sign in to organize and manage your custom movie and TV collections.
          </p>
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
      <div className="min-h-screen p-6 md:p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                    My Collections
                  </h1>
                  {collections && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {collections.length}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 text-sm font-medium">
                  Curate, organize, and share your favorite films and shows
                </p>
              </div>

              <div className="flex items-center gap-3">
                {user?.id === import.meta.env.VITE_ALLOWED_ADMIN_ID && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/import-collection")}
                        className="border-border hover:bg-accent text-foreground font-semibold h-10 px-4 rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2 text-xs"
                      >
                        <Combine className="w-4 h-4 text-primary" />
                        Import Letterboxd
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border-border text-primary font-bold text-[10px] uppercase tracking-widest">
                      Sync collection items from Letterboxd
                    </TooltipContent>
                  </Tooltip>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-5 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 text-xs">
                      <Plus className="w-4 h-4" />
                      New Collection
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="border-border bg-card text-card-foreground p-6 sm:rounded-2xl shadow-xl max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Create Collection</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCollection} className="space-y-4 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Collection Name</label>
                        <Input
                          placeholder="e.g. Masterpieces of Cinema"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          className="bg-muted/40 border-input h-11 rounded-xl focus:ring-primary text-foreground text-sm"
                          autoFocus
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                        <Textarea
                          placeholder="What's the theme or story of this collection?"
                          value={newCollectionDescription}
                          onChange={(e) => setNewCollectionDescription(e.target.value)}
                          className="bg-muted/40 border-input rounded-xl focus-visible:ring-primary min-h-[85px] resize-none text-foreground text-sm leading-relaxed"
                          maxLength={500}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
                        <div className="flex items-center gap-3">
                          {newCollectionShared ? (
                            <Globe className="w-4 h-4 text-primary shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {newCollectionShared ? 'Public Collection' : 'Private Collection'}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {newCollectionShared
                                ? 'Visible on Shared Films for other members.'
                                : 'Only you can view this collection.'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={newCollectionShared}
                          onCheckedChange={setNewCollectionShared}
                          className="data-[state=checked]:bg-primary"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm" 
                        disabled={!newCollectionName.trim() || createCollection.isPending}
                      >
                        {createCollection.isPending ? "Creating..." : "Create Collection"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filter, Search & View Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-card/60 p-2.5 rounded-2xl border border-border/70 shadow-xs">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-transparent border-none focus-visible:ring-0 h-10 placeholder:text-muted-foreground text-sm text-foreground"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 gap-2 text-xs font-semibold hover:bg-accent text-muted-foreground hover:text-foreground rounded-xl">
                      <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                      <span>Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'alphabetical' ? 'A - Z' : 'Item Count'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-popover border-border text-popover-foreground rounded-xl p-1 shadow-md">
                    <DropdownMenuItem onClick={() => setSortBy('newest')} className="rounded-lg text-xs font-medium cursor-pointer">Newest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('alphabetical')} className="rounded-lg text-xs font-medium cursor-pointer">Alphabetical (A - Z)</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('items')} className="rounded-lg text-xs font-medium cursor-pointer">Most Items</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex bg-muted/70 rounded-xl p-1 border border-border">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setViewMode('grid')}
                        className={cn("h-7 w-7 rounded-lg transition-all", viewMode === 'grid' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] font-semibold">Grid View</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setViewMode('compact')}
                        className={cn("h-7 w-7 rounded-lg transition-all", viewMode === 'compact' ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground")}
                      >
                        <List className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[10px] font-semibold">List View</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Collection Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="border-border bg-card text-card-foreground p-6 sm:rounded-2xl shadow-xl max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Edit Collection</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateCollection} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Collection Name</label>
                  <Input
                    placeholder="Collection name"
                    value={editingCollection?.name || ''}
                    onChange={(e) => setEditingCollection(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="bg-muted/40 border-input h-11 rounded-xl focus:ring-primary text-foreground text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                  <Textarea
                    placeholder="What's the theme of this collection?"
                    value={editingCollection?.description || ''}
                    onChange={(e) => setEditingCollection(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="bg-muted/40 border-input rounded-xl focus-visible:ring-primary min-h-[85px] resize-none text-foreground text-sm leading-relaxed"
                    maxLength={500}
                  />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    {editingCollection?.is_shared ? (
                      <Globe className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {editingCollection?.is_shared ? 'Public Collection' : 'Private Collection'}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {editingCollection?.is_shared
                          ? 'Visible on Shared Films for other members.'
                          : 'Only you can view this collection.'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={!!editingCollection?.is_shared}
                    onCheckedChange={(checked) => setEditingCollection(prev => prev ? { ...prev, is_shared: checked } : null)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm" 
                  disabled={!editingCollection?.name.trim() || updateCollection.isPending}
                >
                  {updateCollection.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Collections Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[16/11] rounded-2xl bg-muted/40 border border-border/40 animate-pulse" />
              ))}
            </div>
          ) : filteredAndSortedCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border/70 rounded-3xl bg-card/20">
              <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center border border-border mb-4">
                <Film className="w-8 h-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {searchQuery ? "No collections match your search" : "No collections yet"}
              </h3>
              <p className="text-muted-foreground text-xs max-w-sm mb-6 leading-relaxed">
                {searchQuery 
                  ? `We couldn't find anything matching "${searchQuery}".` 
                  : "Create your first curated collection to organize movies and TV shows you love."}
              </p>
              {searchQuery ? (
                <Button onClick={() => setSearchQuery('')} variant="outline" size="sm" className="rounded-xl text-xs">
                  Clear Search
                </Button>
              ) : (
                <Button onClick={() => setIsDialogOpen(true)} size="sm" className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground">
                  <Plus className="w-3.5 h-3.5" />
                  Create First Collection
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Option B: Cinematic Backdrop Hero + Mini Thumbs Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedCollections.map((collection) => {
                const items = collection.collection_items || [];
                const heroPoster = items[0]?.poster_path;
                const thumbItems = items.slice(0, 4);

                return (
                  <div
                    key={collection.id}
                    onClick={() => setSelectedCollection({ id: collection.id, name: collection.name, description: collection.description })}
                    className="group relative flex flex-col rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 overflow-hidden shadow-xs hover:shadow-lg cursor-pointer transform-gpu hover:-translate-y-1"
                  >
                    {/* Hero Visual Banner (Aspect 16:9) */}
                    <div className="relative w-full aspect-[16/9] bg-muted/80 overflow-hidden shrink-0">
                      {heroPoster ? (
                        <>
                          <img
                            src={getImageUrl(heroPoster, 'w500')}
                            alt={collection.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 will-change-transform"
                            loading="lazy"
                            decoding="async"
                          />
                          {/* Smooth cinematic bottom gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-card/60 to-muted/40 gap-2 text-muted-foreground/50">
                          <Film className="w-10 h-10 stroke-[1.5]" />
                          <span className="text-[11px] font-medium tracking-wide">Empty Collection</span>
                        </div>
                      )}

                      {/* Top Bar Badges (Visibility & Quick Menu) */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                        {/* Visibility Pill */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md",
                            collection.is_shared
                              ? "bg-primary/90 text-primary-foreground border-primary/30"
                              : "bg-black/60 text-zinc-200 border-white/10"
                          )}
                        >
                          {collection.is_shared ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {collection.is_shared ? 'Public' : 'Private'}
                        </span>

                        {/* Actions Menu (Dropdown) */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 backdrop-blur-md transition-all"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 bg-popover border-border text-popover-foreground rounded-xl p-1 shadow-lg">
                              <DropdownMenuItem
                                onClick={() => toggleShareMutation.mutate({ id: collection.id, is_shared: !collection.is_shared })}
                                className="rounded-lg text-xs font-medium cursor-pointer gap-2"
                              >
                                {collection.is_shared ? <Lock className="w-3.5 h-3.5 text-muted-foreground" /> : <Globe className="w-3.5 h-3.5 text-primary" />}
                                {collection.is_shared ? 'Make Private' : 'Make Public'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingCollection({
                                    id: collection.id,
                                    name: collection.name,
                                    description: collection.description,
                                    is_shared: !!collection.is_shared,
                                  });
                                  setIsEditDialogOpen(true);
                                }}
                                className="rounded-lg text-xs font-medium cursor-pointer gap-2"
                              >
                                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                                Edit Info
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setCollectionToDelete({ id: collection.id, name: collection.name });
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="rounded-lg text-xs font-medium cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Collection
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Subtle Center Hover Icon */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="w-11 h-11 rounded-full bg-background/85 text-foreground flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Card Body with Mini Thumbnails Overlap */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 relative z-10">
                      {/* Mini Poster Thumbnails Strip */}
                      {items.length > 0 && (
                        <div className="flex items-center gap-1.5 -mt-8 relative z-20">
                          {thumbItems.map((item, idx) => {
                            const isLastWithMore = idx === 3 && items.length > 4;
                            const extraCount = items.length - 3;

                            return (
                              <div
                                key={item.id || idx}
                                className="relative w-11 h-16 rounded-md overflow-hidden border-2 border-card bg-muted shadow-sm shrink-0"
                              >
                                {item.poster_path ? (
                                  <img
                                    src={getImageUrl(item.poster_path, 'w185')}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Film className="w-3 h-3 text-muted-foreground/40" />
                                  </div>
                                )}

                                {isLastWithMore && (
                                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-[10px] font-bold text-white tracking-wider">
                                    +{extraCount}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Text Details */}
                      <div>
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug truncate capitalize">
                          {collection.name}
                        </h3>
                        {collection.description ? (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mt-1">
                            {collection.description}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground/60 italic mt-1">
                            No description added
                          </p>
                        )}
                      </div>

                      {/* Meta Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground font-medium">
                        <span>{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
                        <span className="text-primary font-semibold group-hover:underline">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List/Compact Mode Layout */
            <div className="flex flex-col gap-3">
              {paginatedCollections.map((collection) => {
                const items = collection.collection_items || [];
                const heroPoster = items[0]?.poster_path;

                return (
                  <div
                    key={collection.id}
                    onClick={() => setSelectedCollection({ id: collection.id, name: collection.name, description: collection.description })}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-2xl border border-border/80 bg-card hover:bg-card/95 hover:border-primary/40 text-card-foreground transition-all cursor-pointer shadow-xs gap-3"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Thumbnail */}
                      <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-muted border border-border/60 shrink-0 relative">
                        {heroPoster ? (
                          <img
                            src={getImageUrl(heroPoster, 'w185')}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/75 text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                          {items.length}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
                            {collection.name}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                              collection.is_shared
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            {collection.is_shared ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                            {collection.is_shared ? 'Public' : 'Private'}
                          </span>
                        </div>
                        {collection.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed">
                            {collection.description}
                          </p>
                        )}
                        <span className="text-[11px] text-muted-foreground mt-1">
                          {items.length} {items.length === 1 ? 'Item' : 'Items in collection'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                            onClick={() => toggleShareMutation.mutate({ id: collection.id, is_shared: !collection.is_shared })}
                          >
                            {collection.is_shared ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px] font-semibold">
                          {collection.is_shared ? 'Make Private' : 'Make Public'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                            onClick={() => {
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
                        <TooltipContent className="text-[10px] font-semibold">Edit Info</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setCollectionToDelete({ id: collection.id, name: collection.name });
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px] font-semibold text-destructive">Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 pb-8">
              <Pagination>
                <PaginationContent className="bg-card border border-border p-1 rounded-xl shadow-xs">
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={cn(
                        "rounded-lg hover:bg-accent text-foreground transition-colors cursor-pointer text-xs",
                        currentPage === 1 && "pointer-events-none opacity-40"
                      )}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
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
                              "rounded-lg cursor-pointer text-xs transition-all",
                              currentPage === page 
                                ? "bg-primary text-primary-foreground font-bold shadow-xs hover:bg-primary/90 hover:text-primary-foreground" 
                                : "hover:bg-accent text-muted-foreground hover:text-foreground font-medium"
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
                          <PaginationEllipsis className="text-muted-foreground/40" />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={cn(
                        "rounded-lg hover:bg-accent text-foreground transition-colors cursor-pointer text-xs",
                        currentPage === totalPages && "pointer-events-none opacity-40"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Delete Confirmation Alert Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent className="rounded-2xl max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold">Delete Collection?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Are you sure you want to delete <span className="font-semibold text-foreground">"{collectionToDelete?.name}"</span>? The movies in this collection will not be removed from your general database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel className="rounded-xl text-xs font-semibold">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl text-xs font-bold"
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
