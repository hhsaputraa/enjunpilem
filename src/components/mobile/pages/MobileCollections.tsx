import React, { useState, useMemo, useDeferredValue, memo, useCallback } from 'react';
import { PageLayout } from '../MobileLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMobileAuth } from '@/hooks/useMobileAuth';
import { MobileCollectionDetails } from './MobileCollectionDetails';
import { getImageUrl } from '@/services/tmdb';
import {
  parseCollectionDescription,
  formatCollectionDescription,
  resolveCollectionHeroPoster,
} from '@/services/collectionUtils';
import { Plus, Globe, Lock, FolderHeart, Edit3, Trash2, ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToastHelpers } from '../Toast';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface CollectionRecord {
  id: string;
  name: string;
  description: string | null;
  is_shared: boolean;
  collection_items?: Array<{
    id: string;
    poster_path: string | null;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEMOIZED MOBILE COLLECTION CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface MobileCollectionCardProps {
  collection: CollectionRecord;
  isSwiped: boolean;
  onSelect: (collection: CollectionRecord) => void;
  onStartEdit: (collection: CollectionRecord) => void;
  onPromptDelete: (collection: CollectionRecord) => void;
  onToggleShare: (id: string, is_shared: boolean) => void;
  isTogglePending: boolean;
  onSwipeChange: (id: string | null) => void;
}

const MobileCollectionCard = memo(({
  collection,
  isSwiped,
  onSelect,
  onStartEdit,
  onPromptDelete,
  onToggleShare,
  isTogglePending,
  onSwipeChange,
}: MobileCollectionCardProps) => {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const items = collection.collection_items || [];
  const { description: cleanDesc, customCoverPath } = useMemo(
    () => parseCollectionDescription(collection.description),
    [collection.description]
  );

  const heroPoster = useMemo(
    () => resolveCollectionHeroPoster(items, customCoverPath),
    [items, customCoverPath]
  );

  // Touch Gesture Handlers (Vertical Scroll aware to prevent GC thrashing & false triggers)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;

    // If movement is predominantly vertical (scrolling page), ignore swipe
    if (Math.abs(diffY) > Math.abs(diffX)) return;

    if (diffX < -45) {
      onSwipeChange(collection.id);
    } else if (diffX > 45) {
      onSwipeChange(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: '92px' }}
      className="relative overflow-hidden rounded-2xl select-none animate-fade-in"
    >
      {/* Swipe Action Buttons (Revealed on Swipe Left) */}
      <div 
        className={cn(
          "absolute top-0 bottom-0 right-0 flex items-center gap-2 px-3 z-0 transition-all duration-300 ease-out",
          isSwiped ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-90 translate-x-4 pointer-events-none"
        )}
      >
        <Button
          size="icon"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit(collection);
          }}
          className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95 transition-all flex items-center justify-center border border-amber-400/20"
          title="Edit Koleksi"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
        
        <Button
          size="icon"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleShare(collection.id, !collection.is_shared);
          }}
          disabled={isTogglePending}
          className={cn(
            "w-10 h-10 rounded-full text-white shadow-md active:scale-95 transition-all flex items-center justify-center border",
            collection.is_shared 
              ? "bg-teal-500 hover:bg-teal-600 border-teal-400/20" 
              : "bg-slate-600 hover:bg-slate-700 border-slate-500/20"
          )}
          title={collection.is_shared ? "Ubah ke Pribadi" : "Ubah ke Publik"}
        >
          {collection.is_shared ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
        </Button>

        <Button
          size="icon"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPromptDelete(collection);
          }}
          className="w-10 h-10 rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95 transition-all flex items-center justify-center border border-rose-400/20"
          title="Hapus Koleksi"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if (isSwiped) {
            e.stopPropagation();
            onSwipeChange(null);
          } else {
            onSelect(collection);
          }
        }}
        className={cn(
          "flex items-center gap-4 bg-card/40 border border-border/40 hover:bg-card/60 rounded-2xl p-3 cursor-pointer active:scale-[0.98] transition-all duration-300 ease-out z-10 relative",
          isSwiped ? "-translate-x-[154px] shadow-lg shadow-black/10" : "translate-x-0"
        )}
      >
        {/* Stacked Poster Collage Cover */}
        <div className="w-16 h-20 shrink-0 relative mr-2 select-none">
          {items.length > 0 ? (
            <>
              {/* 3rd Layer (Far back) */}
              {items.length >= 3 && items[2]?.poster_path && (
                <div className="absolute inset-0 translate-x-2 -translate-y-2 rounded-xl overflow-hidden border border-border/40 bg-muted -z-20 shadow-2xs">
                  <img 
                    src={getImageUrl(items[2].poster_path, 'w92')}
                    className="w-full h-full object-cover opacity-40 brightness-75"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              
              {/* 2nd Layer (Middle back) */}
              {items.length >= 2 && items[1]?.poster_path && (
                <div className="absolute inset-0 translate-x-1 -translate-y-1 rounded-xl overflow-hidden border border-border/40 bg-muted -z-10 shadow-xs">
                  <img 
                    src={getImageUrl(items[1].poster_path, 'w92')}
                    className="w-full h-full object-cover opacity-75 brightness-90"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              
              {/* 1st Layer (Main Front Card) - Displays resolved heroPoster */}
              <div className="w-full h-full rounded-xl overflow-hidden border border-border/40 bg-muted relative z-10 shadow-md">
                {heroPoster ? (
                  <img 
                    src={getImageUrl(heroPoster, 'w185')}
                    className="w-full h-full object-cover"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <FolderHeart className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Empty Collection Placeholder */
            <div className="w-full h-full rounded-xl border border-dashed border-border/60 bg-gradient-to-br from-card/30 to-card/10 flex items-center justify-center z-10 relative shadow-inner">
              <Plus className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
          
          {/* Item count badge float overlay */}
          <div className="absolute -bottom-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-lg border border-black/40 shadow-lg z-20">
            {items.length}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-foreground truncate">{collection.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
            {cleanDesc || 'Koleksi Film tanpa deskripsi.'}
          </p>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                  collection.is_shared
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border/50"
                )}
              >
                {collection.is_shared ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                {collection.is_shared ? 'Publik' : 'Pribadi'}
              </span>
            </div>
            
            {/* Swiped Indicator Hint */}
            {!isSwiped && (
              <span className="text-[10px] text-muted-foreground/30 flex items-center gap-0.5 animate-pulse">
                <span>Geser</span>
                <ChevronLeft className="w-3 h-3 text-muted-foreground/40" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
MobileCollectionCard.displayName = 'MobileCollectionCard';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MOBILE COLLECTIONS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface MobileCollectionsProps {
  isNested?: boolean;
  isCreateDrawerOpen?: boolean;
  setIsCreateDrawerOpen?: (open: boolean) => void;
  onCollectionSelect?: (collection: { id: string; name: string; description: string | null } | null) => void;
}

export const MobileCollections: React.FC<MobileCollectionsProps> = ({
  isNested = false,
  isCreateDrawerOpen = false,
  setIsCreateDrawerOpen,
  onCollectionSelect,
}) => {
  const { user } = useMobileAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastHelpers();
  
  const [localSelectedCollection, setLocalSelectedCollection] = useState<{ id: string; name: string; description: string | null } | null>(null);
  
  // Drawer state for non-nested mode
  const [localIsCreateDrawerOpen, setLocalIsCreateDrawerOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionShared, setNewCollectionShared] = useState(false);

  const openDrawer = isNested ? isCreateDrawerOpen : localIsCreateDrawerOpen;
  const setOpenDrawer = isNested ? setIsCreateDrawerOpen : setLocalIsCreateDrawerOpen;

  // Swipe gesture state
  const [swipedId, setSwipedId] = useState<string | null>(null);

  // Edit Collection state
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedEditCollection, setSelectedEditCollection] = useState<{ id: string; name: string; description: string; is_shared: boolean; customCoverPath: string | null } | null>(null);
  const [editCollectionName, setEditCollectionName] = useState('');
  const [editCollectionDescription, setEditCollectionDescription] = useState('');
  const [editCollectionShared, setEditCollectionShared] = useState(false);

  // Delete Collection state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);

  // Search feature state
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections', user?.id],
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
            poster_path
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as CollectionRecord[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const createCollection = useMutation({
    mutationFn: async ({ name, description, is_shared }: { name: string; description: string; is_shared: boolean }) => {
      if (!user) throw new Error('Anda harus login');
      
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
      showSuccess("Koleksi Dibuat!");
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionShared(false);
      if (setOpenDrawer) setOpenDrawer(false);
    },
    onError: (error: Error) => {
      showError("Gagal membuat", error.message);
    },
  });

  // Toggle Visibility mutation
  const toggleShared = useMutation({
    mutationFn: async ({ id, is_shared }: { id: string; is_shared: boolean }) => {
      const { data, error } = await supabase
        .from('collections')
        .update({ is_shared })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      showSuccess(`Koleksi diubah menjadi ${data.is_shared ? 'Publik' : 'Pribadi'}!`);
      setSwipedId(null);
    },
    onError: (error: Error) => {
      showError("Gagal mengubah visibilitas", error.message);
    }
  });

  // Delete Collection mutation
  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      showSuccess("Koleksi berhasil dihapus!");
      setSwipedId(null);
      setIsDeleteDialogOpen(false);
      setCollectionToDelete(null);
    },
    onError: (error: Error) => {
      showError("Gagal menghapus koleksi", error.message);
    }
  });

  // Edit Collection mutation
  const updateCollection = useMutation({
    mutationFn: async ({ id, name, description, is_shared }: { id: string; name: string; description: string; is_shared: boolean }) => {
      const { data, error } = await supabase
        .from('collections')
        .update({
          name,
          description: description || null,
          is_shared
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      showSuccess("Koleksi berhasil diperbarui!");
      setSwipedId(null);
      setIsEditDrawerOpen(false);
      setSelectedEditCollection(null);
    },
    onError: (error: Error) => {
      showError("Gagal memperbarui koleksi", error.message);
    }
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
    if (selectedEditCollection && editCollectionName.trim()) {
      const finalDescription = formatCollectionDescription(
        editCollectionDescription.trim(),
        selectedEditCollection.customCoverPath
      );
      updateCollection.mutate({
        id: selectedEditCollection.id,
        name: editCollectionName.trim(),
        description: finalDescription,
        is_shared: editCollectionShared
      });
    }
  };

  const handleSelectCollection = useCallback((collection: CollectionRecord) => {
    const { description: cleanDesc } = parseCollectionDescription(collection.description);
    const itemToSelect = {
      id: collection.id,
      name: collection.name,
      description: cleanDesc,
    };
    if (isNested && onCollectionSelect) {
      onCollectionSelect(itemToSelect);
    } else {
      setLocalSelectedCollection(itemToSelect);
    }
  }, [isNested, onCollectionSelect]);

  const handleBack = useCallback(() => {
    if (isNested && onCollectionSelect) {
      onCollectionSelect(null);
    } else {
      setLocalSelectedCollection(null);
    }
  }, [isNested, onCollectionSelect]);

  const handleStartEdit = useCallback((collection: CollectionRecord) => {
    const { description: cleanDesc, customCoverPath } = parseCollectionDescription(collection.description);
    setEditCollectionName(collection.name);
    setEditCollectionDescription(cleanDesc);
    setEditCollectionShared(collection.is_shared);
    setSelectedEditCollection({
      id: collection.id,
      name: collection.name,
      description: cleanDesc,
      is_shared: collection.is_shared,
      customCoverPath,
    });
    setIsEditDrawerOpen(true);
  }, []);

  const handlePromptDelete = useCallback((collection: CollectionRecord) => {
    setCollectionToDelete({ id: collection.id, name: collection.name });
    setIsDeleteDialogOpen(true);
  }, []);

  const handleToggleShare = useCallback((id: string, is_shared: boolean) => {
    toggleShared.mutate({ id, is_shared });
  }, [toggleShared]);

  const handleSwipeChange = useCallback((id: string | null) => {
    setSwipedId(id);
  }, []);

  const activeSelected = isNested ? null : localSelectedCollection;

  // Filter collections by search query (without matching invisible comment tags)
  const filteredCollections = useMemo(() => {
    if (!collections) return [];
    const query = deferredSearchQuery.trim().toLowerCase();
    if (!query) return collections;
    return collections.filter((collection) => {
      const nameMatch = collection.name.toLowerCase().includes(query);
      const { description: cleanDesc } = parseCollectionDescription(collection.description);
      const descMatch = cleanDesc.toLowerCase().includes(query);
      return nameMatch || descMatch;
    });
  }, [collections, deferredSearchQuery]);

  // If in non-nested mode and collection is selected, render details inline
  if (!isNested && activeSelected) {
    return (
      <PageLayout title={activeSelected.name}>
        <div className="flex-1 overflow-y-auto pb-24">
          <MobileCollectionDetails
            collectionId={activeSelected.id}
            collectionName={activeSelected.name}
            description={activeSelected.description}
            onBack={handleBack}
          />
        </div>
      </PageLayout>
    );
  }

  const listContent = (
    <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4 pt-4">
      {/* Premium Search Input (rendered if user has collections) */}
      {collections && collections.length > 0 && (
        <div className="relative w-full mb-2 group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
          </span>
          <Input
            type="text"
            placeholder="Cari nama atau deskripsi koleksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 h-11 bg-card/30 border-border/40 focus-visible:ring-primary rounded-xl text-sm font-medium transition-all"
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-card/40 border border-border/40 animate-pulse" />
          ))}
        </div>
      ) : collections?.length === 0 ? (
        <div className="flex col-span-full flex-col items-center justify-center p-12 text-center h-[50vh]">
          <div className="w-16 h-16 rounded-full bg-card/40 flex items-center justify-center mb-4 border border-border/50">
            <FolderHeart className="w-8 h-8 text-primary/40 animate-float" />
          </div>
          <h3 className="font-bold text-lg mb-2">Belum ada koleksi</h3>
          <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
            Buat koleksi pertamamu dengan menekan tombol tambah (+) di pojok atas.
          </p>
        </div>
      ) : filteredCollections?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[40vh] animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-card/30 flex items-center justify-center mb-4 border border-border/40">
            <Search className="w-5 h-5 text-muted-foreground/50 animate-pulse" />
          </div>
          <h4 className="font-bold text-sm mb-1 text-foreground">Tidak ada hasil ditemukan</h4>
          <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
            Tidak ada koleksi yang cocok dengan "{searchQuery}".
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredCollections.map((collection) => (
            <MobileCollectionCard
              key={collection.id}
              collection={collection}
              isSwiped={swipedId === collection.id}
              onSelect={handleSelectCollection}
              onStartEdit={handleStartEdit}
              onPromptDelete={handlePromptDelete}
              onToggleShare={handleToggleShare}
              isTogglePending={toggleShared.isPending}
              onSwipeChange={handleSwipeChange}
            />
          ))}
        </div>
      )}

      {/* Reusable Drawer for creation */}
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        {!isNested && (
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full h-9 w-9">
              <Plus className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
        )}
        <DrawerContent className="bg-background/95 backdrop-blur-xl border-border/50 text-foreground">
          <DrawerHeader className="border-b border-border/30">
            <DrawerTitle className="text-lg font-bold text-center">Koleksi Baru</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleCreateCollection} className="space-y-4 px-4 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Nama Koleksi</label>
              <Input
                placeholder="Contoh: Film Sci-Fi Terbaik"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="bg-card/50 border-border/50 h-12 rounded-xl focus:ring-primary text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Deskripsi</label>
              <Textarea
                placeholder="Isi koleksi ini tentang apa?"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                className="bg-card/50 border-border/50 rounded-xl focus-visible:ring-primary min-h-[90px] resize-none text-sm leading-relaxed"
                maxLength={500}
              />
            </div>
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-card/30 border border-border/40">
              <div className="flex items-start gap-3">
                {newCollectionShared ? (
                  <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {newCollectionShared ? 'Publik' : 'Pribadi'}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                    {newCollectionShared
                      ? 'Fitur Shared Films bisa melihat koleksimu.'
                      : 'Hanya kamu yang bisa melihat koleksinya.'}
                  </p>
                </div>
              </div>
              <Switch
                checked={newCollectionShared}
                onCheckedChange={setNewCollectionShared}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <DrawerFooter className="px-0 pb-2 pt-4">
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20" disabled={!newCollectionName.trim() || createCollection.isPending}>
                {createCollection.isPending ? "Menyimpan..." : "Buat Koleksi"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Reusable Drawer for editing */}
      <Drawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen}>
        <DrawerContent className="bg-background/95 backdrop-blur-xl border-border/50 text-foreground">
          <DrawerHeader className="border-b border-border/30">
            <DrawerTitle className="text-lg font-bold text-center">Edit Koleksi</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleUpdateCollection} className="space-y-4 px-4 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Nama Koleksi</label>
              <Input
                placeholder="Contoh: Film Sci-Fi Terbaik"
                value={editCollectionName}
                onChange={(e) => setEditCollectionName(e.target.value)}
                className="bg-card/50 border-border/50 h-12 rounded-xl focus:ring-primary text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Deskripsi</label>
              <Textarea
                placeholder="Isi koleksi ini tentang apa?"
                value={editCollectionDescription}
                onChange={(e) => setEditCollectionDescription(e.target.value)}
                className="bg-card/50 border-border/50 rounded-xl focus-visible:ring-primary min-h-[90px] resize-none text-sm leading-relaxed"
                maxLength={500}
              />
            </div>
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-card/30 border border-border/40">
              <div className="flex items-start gap-3">
                {editCollectionShared ? (
                  <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {editCollectionShared ? 'Publik' : 'Pribadi'}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                    {editCollectionShared
                      ? 'Fitur Shared Films bisa melihat koleksimu.'
                      : 'Hanya kamu yang bisa melihat koleksinya.'}
                  </p>
                </div>
              </div>
              <Switch
                checked={editCollectionShared}
                onCheckedChange={setEditCollectionShared}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <DrawerFooter className="px-0 pb-2 pt-4">
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20" disabled={!editCollectionName.trim() || updateCollection.isPending}>
                {updateCollection.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* Reusable Dialog for delete confirmation */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl w-[90%] max-w-sm mx-auto text-foreground p-6">
          <DialogHeader className="space-y-3 text-center sm:text-center animate-scale-up">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <Trash2 className="w-6 h-6 text-rose-500 animate-pulse" />
            </div>
            <DialogTitle className="text-lg font-bold text-center">Hapus Koleksi?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed">
              Apakah Anda yakin ingin menghapus koleksi <span className="text-foreground font-semibold">"{collectionToDelete?.name}"</span>? Film-film di dalamnya tidak akan dihapus dari database.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCollectionToDelete(null);
              }}
              className="flex-1 h-11 border-border/60 hover:bg-white/5 rounded-xl font-semibold text-sm transition-all"
            >
              Batal
            </Button>
            <Button
              onClick={() => {
                if (collectionToDelete) {
                  deleteCollection.mutate(collectionToDelete.id);
                }
              }}
              disabled={deleteCollection.isPending}
              className="flex-1 h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-rose-500/15 transition-all"
            >
              {deleteCollection.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isNested) {
    return listContent;
  }

  return (
    <PageLayout title="Koleksi">
      {listContent}
    </PageLayout>
  );
};
