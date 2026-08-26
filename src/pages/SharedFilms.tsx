import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
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

const SharedFilms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<SharedCollection | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Scroll to top on page change or when opening a collection
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      const filteredData = (data || []).filter(c => c.collection_items && c.collection_items.length > 0);
      return filteredData as unknown as SharedCollection[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!collections) return [];
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.profiles?.username || '').toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

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
            description={selected.description}
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
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-background to-background z-10" />
            <div className="flex gap-4 opacity-10 blur-sm scale-110 transition-opacity">
                {collections?.slice(0, 8).map((c, i) => (
                  <img 
                    key={i}
                    src={getImageUrl(c.collection_items[0]?.poster_path || '', 'w300')} 
                    className="w-48 h-72 object-cover rounded-2xl grayscale"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ))}
            </div>
          </div>

          <div className="relative z-20 max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0AC4E0]/10 border border-[#0AC4E0]/20 text-[#0AC4E0] text-xs font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <TrendingUp className="w-3.5 h-3.5" />
              Community Hub
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Discover <span className="bg-gradient-to-r from-[#0AC4E0] to-blue-500 bg-clip-text text-transparent italic">Together</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
              Explore curated film collections shared by cinephiles around the globe. Like, save, and get inspired.
            </p>

            <div className="relative max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
               <div className="absolute inset-0 bg-[#0AC4E0]/20 blur-xl -z-10 rounded-full" />
               <div className="relative flex items-center p-2 rounded-2xl bg-zinc-900/80 backdrop-blur-md border border-white/10 group focus-within:border-[#0AC4E0]/50 transition-all shadow-2xl">
                  <Search className="w-5 h-5 text-muted-foreground ml-4 group-focus-within:text-[#0AC4E0] transition-colors" />
                  <Input
                    placeholder="Search collections or creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-muted-foreground h-12 text-lg"
                  />
                  <div className="hidden sm:flex items-center gap-2 px-4 border-l border-white/10 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Users className="w-4 h-4 text-[#0AC4E0]" />
                    {filtered.length}
                  </div>
               </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-1.5 h-8 bg-[#0AC4E0] rounded-full shadow-[0_0_15px_#0AC4E0]" />
            Trending Collections
          </h2>
          <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
             <span>LATEST ARRIVALS</span>
             <div className="w-8 h-[1px] bg-white/10" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/5 mb-6">
              <LibraryBig className="w-8 h-8 text-white/10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No shared collections yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mb-8">
              {searchQuery
                ? "We couldn't find any shared collection matching your search."
                : 'Be the first to share a collection from the My Collections page!'}
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {paginatedShared.map((collection) => {
                const ownerName = collection.profiles?.username || 'User';
                const ownerAvatar = collection.profiles?.avatar_url || undefined;
                return (
                  <div
                    key={collection.id}
                    className="group relative flex flex-col rounded-[2.5rem] border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all duration-500 overflow-hidden backdrop-blur-xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0AC4E0]/10 animate-in fade-in slide-in-from-bottom-4 duration-700"
                  >
                    {/* Content Container (Subtle blur on hover) */}
                    <div 
                      className="flex flex-col h-full p-6 transition-all duration-500 group-hover:opacity-70 cursor-pointer"
                      onClick={() => setSelected(collection)}
                    >
                      {collection.collection_items?.[0]?.poster_path && (
                        <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
                          <img
                            src={getImageUrl(collection.collection_items[0].poster_path, 'w300')}
                            alt=""
                            className="w-full h-full object-cover blur-2xl scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950/80" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-br from-[#0AC4E0]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      <div className="relative flex justify-between items-start mb-6 z-10">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10 border border-white/10 ring-2 ring-[#0AC4E0]/20 group-hover:ring-[#0AC4E0]/50 transition-all">
                              <AvatarImage src={ownerAvatar} />
                              <AvatarFallback>{ownerName?.[0] || 'U'}</AvatarFallback>
                           </Avatar>
                           <div className="flex flex-col">
                              <h3 className="text-xl font-bold text-white group-hover:text-[#0AC4E0] transition-colors leading-tight truncate pr-4 capitalize">
                                {collection.name}
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0AC4E0]">
                                  @{ownerName}
                                </span>
                                <div className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-[10px] text-white/40 flex items-center gap-1">
                                   <Clock className="w-3 h-3" />
                                   Recently Shared
                                </span>
                              </div>
                           </div>
                        </div>
                      </div>

                      <div className="relative h-48 mb-6 z-10 group/stack transition-all duration-500 group-hover:blur-md">
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
                                  opacity: 1 - idx * 0.15,
                                }}
                              >
                                {item.poster_path ? (
                                  <img
                                    src={getImageUrl(item.poster_path, 'w300')}
                                    alt=""
                                    className="w-full h-full object-cover group-hover/stack:scale-105 transition-transform duration-1000"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-zinc-800" />
                                )}
                                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-3xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-3">
                            <FilmIcon className="w-8 h-8 text-white/10" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0AC4E0]/40">Empty collection</span>
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                         <Search className="w-8 h-8 text-[#0AC4E0] mb-3 transition-transform duration-500 scale-50 group-hover:scale-100" />
                         <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0AC4E0] mb-4">
                            Browse Collection
                         </span>
                         {collection.description && (
                            <p className="text-sm text-white font-medium text-center line-clamp-3 italic drop-shadow-lg max-w-[200px]">
                              "{collection.description}"
                            </p>
                         )}
                      </div>
                    </div>

                    {/* Social Action Bar (New) */}
                    <div className="relative z-30 p-4 pt-0 mt-auto flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-4">
                           <button className="flex items-center gap-1.5 text-white/40 hover:text-red-500 transition-colors group/btn">
                              <Heart className="w-4 h-4 group-hover/btn:fill-red-500" />
                              <span className="text-xs font-bold">24</span>
                           </button>
                           <button className="flex items-center gap-1.5 text-white/40 hover:text-[#0AC4E0] transition-colors group/btn">
                              <MessageCircle className="w-4 h-4 group-hover/btn:fill-[#0AC4E0]/20" />
                              <span className="text-xs font-bold">8</span>
                           </button>
                        </div>
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-1 text-white/20">
                              <Eye className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold tracking-wider uppercase">1.2k</span>
                           </div>
                           <button className="p-2 rounded-xl bg-white/5 hover:bg-[#0AC4E0]/10 text-white/40 hover:text-[#0AC4E0] transition-all">
                              <Share2 className="w-4 h-4" />
                           </button>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>

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
          </>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default SharedFilms;
