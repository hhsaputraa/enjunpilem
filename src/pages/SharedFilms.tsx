import { useState, useMemo, useDeferredValue, useEffect, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Search, 
  LibraryBig, 
  Users, 
  Film as FilmIcon, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Eye,
  Clock
} from 'lucide-react';
import { getImageUrl } from '@/services/tmdb';
import { CollectionDetails } from '@/components/CollectionDetails';
import { parseCollectionDescription } from '@/services/collectionUtils';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SharedCollection {
  id: string;
  name: string;
  description: string | null;
  user_id: string | null;
  created_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  collection_items: Array<{
    id: string;
    poster_path: string | null;
  }>;
}

// ─── MEMOIZED CARD COMPONENT (GPU-Optimized for Low-End Devices) ─────────────
const SharedCollectionCard = memo(({ 
  collection, 
  onSelect 
}: { 
  collection: SharedCollection; 
  onSelect: (c: SharedCollection) => void;
}) => {
  const ownerName = collection.profiles?.username || 'User';
  const ownerAvatar = collection.profiles?.avatar_url || undefined;

  return (
    <div
      className="group relative flex flex-col rounded-[2rem] border border-border/80 bg-card hover:bg-card/95 transition-all duration-300 overflow-hidden transform-gpu hover:-translate-y-1.5 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 text-card-foreground"
    >
      {/* Content Container */}
      <div 
        className="flex flex-col h-full p-6 transition-opacity duration-300 group-hover:opacity-75 cursor-pointer"
        onClick={() => onSelect(collection)}
      >
        {collection.collection_items?.[0]?.poster_path && (
          <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 transition-opacity duration-500 pointer-events-none">
            <img
              src={getImageUrl(collection.collection_items[0].poster_path, 'w92')}
              alt=""
              className="w-full h-full object-cover blur-xl scale-105"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-card/90 via-card/75 to-card/95" />
          </div>
        )}

        <div className="relative flex justify-between items-start mb-6 z-10">
          <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10 border border-border ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                <AvatarImage src={ownerAvatar} />
                <AvatarFallback>{ownerName?.[0] || 'U'}</AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight truncate pr-4 capitalize">
                  {collection.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                    @{ownerName}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                     <Clock className="w-3 h-3" />
                     Recently Shared
                  </span>
                </div>
             </div>
          </div>
        </div>

        <div className="relative h-48 mb-6 z-10 group/stack transition-all duration-300">
          {collection.collection_items && collection.collection_items.length > 0 ? (
            <div className="relative w-full h-full flex items-center justify-center translate-y-2">
              {collection.collection_items.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  className="absolute h-[110%] aspect-[2/3] rounded-2xl overflow-hidden shadow-md transition-transform duration-500 border border-border/60 transform-gpu will-change-transform"
                  style={{
                    left: '50%',
                    zIndex: 10 - idx,
                    transform: `translateX(-50%) translateX(${(idx - 1) * 35}px) rotate(${(idx - 1) * 6}deg) scale(${1 - idx * 0.08}) translateY(${idx * 8}px)`,
                    opacity: 1 - idx * 0.15,
                  }}
                >
                  {item.poster_path ? (
                    <img
                      src={getImageUrl(item.poster_path, 'w300')}
                      alt=""
                      className="w-full h-full object-cover group-hover/stack:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full rounded-2xl bg-muted/40 border border-dashed border-border flex flex-col items-center justify-center gap-3">
              <FilmIcon className="w-8 h-8 text-muted-foreground/30" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Empty collection</span>
            </div>
          )}
        </div>

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 dark:bg-background/85 pointer-events-none rounded-[2rem]">
           <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-3 shadow-md shadow-primary/25">
             <Search className="w-6 h-6" />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Browse Collection
           </span>
           {(() => {
             const cleanDesc = parseCollectionDescription(collection.description).description;
             if (!cleanDesc) return null;
             return (
               <p className="text-sm text-muted-foreground font-medium text-center line-clamp-3 italic max-w-[200px]">
                 "{cleanDesc}"
               </p>
             );
           })()}
        </div>
      </div>

      {/* Social Action Bar */}
      <div className="relative z-30 p-4 pt-3 mt-auto flex items-center justify-between border-t border-border/60 bg-muted/20">
          <div className="flex items-center gap-4">
             <button className="flex items-center gap-1.5 text-muted-foreground hover:text-rose-500 transition-colors group/btn">
                <Heart className="w-4 h-4 group-hover/btn:fill-rose-500" />
                <span className="text-xs font-bold">24</span>
             </button>
             <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group/btn">
                <MessageCircle className="w-4 h-4 group-hover/btn:fill-primary/20" />
                <span className="text-xs font-bold">8</span>
             </button>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1 text-muted-foreground/50">
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold tracking-wider uppercase">1.2k</span>
             </div>
             <button className="p-2 rounded-xl bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary border border-border transition-all">
                <Share2 className="w-4 h-4" />
             </button>
          </div>
      </div>
    </div>
  );
});
SharedCollectionCard.displayName = 'SharedCollectionCard';

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const SharedFilms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selected, setSelected] = useState<SharedCollection | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery]);

  // Scroll to top on page change with rAF to prevent jank
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frameId);
  }, [currentPage, selected]);

  const { data: collections, isLoading } = useQuery({
    queryKey: ['shared-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          description,
          user_id,
          created_at,
          profiles:user_id ( username, avatar_url ),
          collection_items ( id, poster_path )
        `)
        .eq('is_shared', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      const filteredData = (data || []).filter(c => c.collection_items && c.collection_items.length > 0);
      return filteredData as unknown as SharedCollection[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!collections) return [];
    const query = deferredSearchQuery.trim().toLowerCase();
    if (!query) return collections;
    return collections.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(query);
      const { description: cleanDesc } = parseCollectionDescription(c.description);
      const descMatch = cleanDesc.toLowerCase().includes(query);
      const userMatch = (c.profiles?.username || '').toLowerCase().includes(query);
      return nameMatch || descMatch || userMatch;
    });
  }, [collections, deferredSearchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedShared = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (selected) {
    const ownerName = selected.profiles?.username || null;
    const ownerAvatarUrl = selected.profiles?.avatar_url || null;
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <CollectionDetails
            collectionId={selected.id}
            collectionName={selected.name}
            description={parseCollectionDescription(selected.description).description}
            ownerName={ownerName}
            ownerAvatarUrl={ownerAvatarUrl}
            readOnly
            onBack={() => setSelected(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Animated Hero Section */}
        <div className="relative h-[450px] overflow-hidden flex items-center justify-center pt-20">
          {/* Background Posters */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background to-background z-10" />
            <div className="flex gap-4 opacity-10 scale-105 pointer-events-none">
                {collections?.slice(0, 8).map((c, i) => (
                  <img 
                    key={i}
                    src={getImageUrl(c.collection_items[0]?.poster_path || '', 'w185')} 
                    className="w-48 h-72 object-cover rounded-2xl grayscale"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ))}
            </div>
          </div>

          <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <TrendingUp className="w-3.5 h-3.5" />
              Community Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-6">
              Discover <span className="bg-gradient-to-r from-primary to-sky-600 dark:from-[#0AC4E0] dark:to-blue-500 bg-clip-text text-transparent italic">Together</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Explore curated film collections shared by cinephiles around the globe. Like, save, and get inspired.
            </p>

            <div className="relative max-w-xl mx-auto">
               <div className="relative flex items-center p-2 rounded-2xl bg-card border border-border group focus-within:border-primary/50 transition-all shadow-lg">
                  <Search className="w-5 h-5 text-muted-foreground ml-4 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search collections or creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground h-12 text-lg"
                  />
                  <div className="hidden sm:flex items-center gap-2 px-4 border-l border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    {filtered.length}
                  </div>
               </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full" />
            Trending Collections
          </h2>
          <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
             <span>LATEST ARRIVALS</span>
             <div className="w-8 h-[1px] bg-border" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted/50 border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted/40 flex items-center justify-center border border-border mb-6">
              <LibraryBig className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No shared collections yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              {searchQuery
                ? "We couldn't find any shared collection matching your search."
                : 'Be the first to share a collection from the My Collections page!'}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline" className="rounded-xl border-border hover:bg-accent text-foreground">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {paginatedShared.map((collection) => (
                <SharedCollectionCard
                  key={collection.id}
                  collection={collection}
                  onSelect={setSelected}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 pb-12">
                <Pagination>
                  <PaginationContent className="bg-card border border-border p-1.5 rounded-2xl shadow-xs">
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={cn(
                          "rounded-xl hover:bg-accent text-foreground transition-colors cursor-pointer",
                          currentPage === 1 && "pointer-events-none opacity-50"
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
                                "rounded-xl cursor-pointer transition-all",
                                currentPage === page 
                                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:bg-primary/90 hover:text-primary-foreground" 
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
                            <PaginationEllipsis className="text-muted-foreground/50" />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={cn(
                          "rounded-xl hover:bg-accent text-foreground transition-colors cursor-pointer",
                          currentPage === totalPages && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default SharedFilms;
