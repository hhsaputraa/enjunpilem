import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LibraryBig, Users, Film as FilmIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getImageUrl } from '@/services/tmdb';
import { CollectionDetails } from '@/components/CollectionDetails';

interface SharedCollection {
  id: string;
  name: string;
  description: string | null;
  user_id: string | null;
  created_at: string;
  collection_items: Array<{
    id: string;
    poster_path: string | null;
  }>;
}

interface ProfileMap {
  [userId: string]: { username: string | null };
}

const SharedFilms = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<SharedCollection | null>(null);

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
          collection_items ( id, poster_path )
        `)
        .eq('is_shared', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const filteredData = (data || []).filter(c => c.collection_items && c.collection_items.length > 0);
      return filteredData as SharedCollection[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['shared-collection-profiles', collections?.map((c) => c.user_id).join(',')],
    enabled: !!collections && collections.length > 0,
    queryFn: async () => {
      const ids = Array.from(
        new Set(
          (collections || [])
            .map((c) => c.user_id)
            .filter((id): id is string => !!id)
        )
      );
      if (ids.length === 0) return {} as ProfileMap;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', ids);
      if (error) throw error;
      const map: ProfileMap = {};
      (data || []).forEach((p) => {
        map[p.id] = { username: p.username };
      });
      return map;
    },
  });

  const filtered = useMemo(() => {
    if (!collections) return [];
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (profiles?.[c.user_id || '']?.username || '').toLowerCase().includes(q)
    );
  }, [collections, searchQuery, profiles]);

  if (selected) {
    const ownerName = profiles?.[selected.user_id || '']?.username || null;
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <CollectionDetails
            collectionId={selected.id}
            collectionName={selected.name}
            description={selected.description}
            ownerName={ownerName}
            readOnly
            onBack={() => setSelected(null)}
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0AC4E0]/10 border border-[#0AC4E0]/30 flex items-center justify-center">
                <LibraryBig className="w-6 h-6 text-[#0AC4E0]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent tracking-tight">
                  Shared Films
                </h1>
                <p className="text-muted-foreground mt-1 text-sm font-medium">
                  Discover film collections shared by the community
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <Input
                placeholder="Find a shared collection..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-transparent border-none focus:ring-0 h-11 placeholder:text-white/20 text-sm font-medium"
              />
            </div>
            <div className="flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-[#0AC4E0]" />
              {filtered.length} {filtered.length === 1 ? 'collection' : 'collections'}
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((collection) => {
              const ownerName = profiles?.[collection.user_id || '']?.username;
              return (
                <div
                  key={collection.id}
                  onClick={() => setSelected(collection)}
                  className="group relative flex flex-col rounded-[2.5rem] border border-white/5 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all duration-500 overflow-hidden backdrop-blur-xl cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#0AC4E0]/10"
                >
                  {/* Content Container (Subtle blur on hover) */}
                  <div className="flex flex-col h-full p-6 transition-all duration-500 group-hover:blur-[2px] group-hover:opacity-70">
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

                    <div className="relative flex justify-between items-start mb-6 z-10">
                      <div className="flex flex-col">
                        <h3 className="text-2xl font-bold text-white group-hover:text-[#0AC4E0] transition-colors leading-tight truncate pr-4 capitalize">
                          {collection.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                            FROM
                          </span>
                          {ownerName && (
                            <>
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0AC4E0]/80">
                                @{ownerName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="relative h-48 mb-2 z-10 group/stack">
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
                  </div>

                  {/* Hover Overlay - More subtle */}
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-zinc-950/60 backdrop-blur-[2px] p-6 text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-12 h-12 rounded-full bg-[#0AC4E0] text-black flex items-center justify-center mb-4 transition-transform duration-500 shadow-xl shadow-[#0AC4E0]/20">
                          <Search className="w-6 h-6" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 border-white/10 text-[#0AC4E0] font-bold text-[10px] uppercase tracking-widest">
                        Browse this collection
                      </TooltipContent>
                    </Tooltip>
                    
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0AC4E0] mb-3">
                      Browse Collection
                    </span>

                    {collection.description && (
                      <p className="text-sm text-white/80 line-clamp-3 italic max-w-[200px]">
                        "{collection.description}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default SharedFilms;
