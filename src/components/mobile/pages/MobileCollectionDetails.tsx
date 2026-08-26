'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trash2, Grid, List, Star, Search, ChevronUp, ChevronDown, Film } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/services/tmdb';
import { Link } from 'react-router-dom';
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
import { arrayMove } from '@dnd-kit/sortable';

interface MobileCollectionDetailsProps {
  collectionId: string;
  collectionName: string;
  onBack: () => void;
  readOnly?: boolean;
  description?: string | null;
  ownerName?: string | null;
  ownerAvatarUrl?: string | null;
}

interface CollectionItem {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  collection_id: string;
  sort_order: number;
  title: string | null;
  name: string | null;
  poster_path: string | null;
  overview: string | null;
  vote_average: number | null;
  release_date: string | null;
  first_air_date: string | null;
}

type ViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE = 8; // Multiple of 2 (perfect for 2-column mobile grids)

export const MobileCollectionDetails: React.FC<MobileCollectionDetailsProps> = ({
  collectionId,
  collectionName,
  onBack,
  readOnly = false,
  description,
  ownerName,
  ownerAvatarUrl,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [localItems, setLocalItems] = useState<CollectionItem[]>([]);
  const [itemToDelete, setItemToDelete] = useState<CollectionItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Automatically scroll to top when changing page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const { data: items, isLoading } = useQuery({
    queryKey: ['collection-items', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId)
        .order('sort_order', { ascending: true })
        .order('added_at', { ascending: true });

      if (error) throw error;
      return (data || []) as CollectionItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Sync server data to local state
  useEffect(() => {
    if (items) setLocalItems(items);
  }, [items]);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Scroll to top on page change
  useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return localItems;
    return localItems.filter(item => 
      (item.title || item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [localItems, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, totalPages);
  
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const isSearching = searchQuery.trim().length > 0;

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('collection_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-items', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: 'Berhasil dihapus dari koleksi' });

      // Auto-adjust page index
      if (paginatedItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) =>
        supabase.from('collection_items').update({ sort_order: index }).eq('id', id)
      );
      const results = await Promise.all(updates);
      const firstError = results.find((r) => r.error);
      if (firstError?.error) throw firstError.error;
    },
    onError: (error: Error) => {
      toast({
        title: 'Gagal menyimpan urutan',
        description: error.message,
        variant: 'destructive',
      });
      if (items) setLocalItems(items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-items', collectionId] });
    },
  });

  const handleMoveUp = (globalIdx: number) => {
    if (globalIdx === 0) return;
    const newOrder = arrayMove(localItems, globalIdx, globalIdx - 1);
    setLocalItems(newOrder); // optimistic
    reorderMutation.mutate(newOrder.map((i) => i.id));
  };

  const handleMoveDown = (globalIdx: number) => {
    if (globalIdx === localItems.length - 1) return;
    const newOrder = arrayMove(localItems, globalIdx, globalIdx + 1);
    setLocalItems(newOrder); // optimistic
    reorderMutation.mutate(newOrder.map((i) => i.id));
  };

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="p-0 hover:bg-white/10 rounded-full h-9 w-9 flex items-center justify-center border border-border/20 bg-card/40"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-foreground truncate">{collectionName}</h2>
              {localItems.length > 0 && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                  {localItems.length}
                </span>
              )}
            </div>
            {ownerName && (
              <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                {ownerAvatarUrl && (
                  <img
                    src={ownerAvatarUrl}
                    alt={ownerName}
                    className="w-4 h-4 rounded-full object-cover border border-white/10"
                  />
                )}
                <span>
                  Oleh <span className="text-primary font-bold">@{ownerName}</span>
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Search & Layout Toggle Row */}
        <div className="flex items-center gap-2 w-full mt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/40 border-border/40 h-9 rounded-xl focus-visible:ring-primary text-xs font-semibold"
            />
          </div>

          <div className="flex items-center gap-1 bg-card/40 p-1 rounded-xl border border-border/40">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={cn("h-7 w-7 rounded-lg transition-all", viewMode === 'grid' ? "bg-primary text-primary-foreground hover:bg-primary shadow-sm" : "text-muted-foreground hover:text-white")}
              aria-label="Grid view"
            >
              <Grid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={cn("h-7 w-7 rounded-lg transition-all", viewMode === 'list' ? "bg-primary text-primary-foreground hover:bg-primary shadow-sm" : "text-muted-foreground hover:text-white")}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {description && (
        <div className="p-3.5 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-md">
          <p className="text-xs text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}

      {!readOnly && localItems.length > 0 && !isSearching && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-bold">
          <ChevronUp className="h-3.5 w-3.5 text-primary animate-pulse" />
          Tip: Gunakan tombol ▲ / ▼ untuk mengurutkan daftar koleksi.
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl bg-card/30 animate-pulse border border-border/20" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center h-[30vh]">
          <Search className="w-10 h-10 text-white/10 mb-3" />
          <p className="text-xs text-muted-foreground font-medium">
            {localItems.length === 0 ? 'Koleksi ini masih kosong.' : 'Tidak menemukan film yang cocok.'}
          </p>
          {searchQuery && (
            <Button 
              variant="link" 
              onClick={() => setSearchQuery('')}
              className="text-primary mt-1 font-bold uppercase text-[10px]"
            >
              Reset Pencarian
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {paginatedItems.map((item) => {
                const title = item.title || item.name || 'Unknown';
                const rating = item.vote_average || 0;
                const year = item.release_date || item.first_air_date
                  ? new Date(item.release_date || item.first_air_date!).getFullYear().toString()
                  : '';
                
                return (
                  <div key={item.id} className="relative group rounded-2xl overflow-hidden bg-card/45 border border-border/40 shadow-sm flex flex-col">
                    {/* Poster Wrapper */}
                    <Link to={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.media_id}`} className="aspect-[2/3] w-full block overflow-hidden bg-zinc-900 relative">
                      {item.poster_path ? (
                        <img
                          src={getImageUrl(item.poster_path, 'w500')}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          <Film className="w-4 h-4 opacity-50" />
                        </div>
                      )}

                      {/* Rating Badge */}
                      {rating > 0 && (
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-black text-yellow-500">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{rating.toFixed(1)}</span>
                        </div>
                      )}
                    </Link>

                    {/* Metadata Card Footer */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className={cn(
                          "text-[8px] font-black px-1.5 py-0.25 rounded-md uppercase tracking-wider",
                          item.media_type === 'tv' 
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                          {item.media_type === 'tv' ? 'TV' : 'Film'}
                        </span>
                        <h3 className="font-bold text-[11px] text-foreground line-clamp-1 leading-snug mt-1">{title}</h3>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 mt-2 pt-1 border-t border-border/20">
                        <span className="text-[10px] text-muted-foreground">{year}</span>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.preventDefault();
                              setItemToDelete(item);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedItems.map((item, idx) => {
                const globalIdx = (activePage - 1) * ITEMS_PER_PAGE + idx;
                const title = item.title || item.name || 'Untitled';
                const date = item.release_date || item.first_air_date || '';
                const year = date ? new Date(date).getFullYear() : '';
                const detailPath = `/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.media_id}`;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm"
                  >
                    {/* Reordering Chevrons for Mobile (Touch-friendly reordering) */}
                    {!readOnly && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveUp(globalIdx)}
                          disabled={globalIdx === 0}
                          className="h-7 w-7 rounded-md hover:bg-white/10 text-muted-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="h-4.5 w-4.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveDown(globalIdx)}
                          disabled={globalIdx === localItems.length - 1}
                          className="h-7 w-7 rounded-md hover:bg-white/10 text-muted-foreground disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="h-4.5 w-4.5" />
                        </Button>
                      </div>
                    )}

                    <Link to={detailPath} className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-14 aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-border/20">
                        {item.poster_path ? (
                          <img
                            src={getImageUrl(item.poster_path, 'w300')}
                            alt={title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            <Film className="w-4 h-4 opacity-50" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-[8px] font-black px-1.5 py-0.25 rounded-md uppercase tracking-wider",
                            item.media_type === 'tv' 
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          )}>
                            {item.media_type === 'tv' ? 'TV' : 'Film'}
                          </span>
                          {year && <span className="text-[10px] text-muted-foreground">{year}</span>}
                        </div>
                        <h3 className="font-bold text-xs text-foreground truncate">{title}</h3>
                        {item.vote_average ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {item.vote_average.toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </Link>

                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-9 w-9"
                        onClick={() => {
                          setItemToDelete(item);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && filteredItems.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-center gap-2 mt-4 pb-12">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={activePage === 1}
            className="h-9 w-9 rounded-xl border-border/40 bg-card/45 text-foreground hover:bg-white/10 disabled:opacity-20 transition-all"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </Button>
          
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            if (
              pageNum === 1 || 
              pageNum === totalPages || 
              Math.abs(pageNum - activePage) <= 1
            ) {
              return (
                <Button
                  key={pageNum}
                  variant={activePage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "h-9 min-w-9 rounded-xl font-black transition-all duration-300",
                    activePage === pageNum
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                      : "border-border/40 bg-card/45 text-muted-foreground hover:bg-white/10"
                  )}
                >
                  {pageNum}
                </Button>
              );
            }
            
            if (pageNum === 2 || pageNum === totalPages - 1) {
              return (
                <span key={pageNum} className="text-zinc-600 px-1 font-bold text-xs select-none">
                  •••
                </span>
              );
            }
            
            return null;
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={activePage === totalPages}
            className="h-9 w-9 rounded-xl border-border/40 bg-card/45 text-foreground hover:bg-white/10 disabled:opacity-20 transition-all"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="border-border/50 bg-background/95 backdrop-blur-xl text-foreground max-w-[90%] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-center">Hapus dari Koleksi?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-center text-muted-foreground leading-relaxed mt-1">
              Apakah Anda yakin ingin menghapus <span className="text-foreground font-black">"{itemToDelete?.title || itemToDelete?.name}"</span> dari daftar koleksi ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 bg-card border-border/40 hover:bg-white/10 text-foreground rounded-xl h-12 mt-0">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/95 rounded-xl h-12 font-bold"
              onClick={() => {
                if (itemToDelete) {
                  deleteMutation.mutate(itemToDelete.id);
                  setItemToDelete(null);
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
