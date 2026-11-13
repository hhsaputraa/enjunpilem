import React, { useState, useMemo } from 'react';
import { PageLayout } from '../MobileLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getImageUrl } from '@/services/tmdb';
import { Search, Users, TrendingUp, Clock, Eye, Heart, MessageCircle, Share2, Film as FilmIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileCollectionDetails } from './MobileCollectionDetails';
import { parseCollectionDescription } from '@/services/collectionUtils';

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

// ─── MEMOIZED MOBILE CARD (Low-End Hardware Optimized) ───────────────────────
const MobileSharedCollectionCard = React.memo(({
  collection,
  onSelect,
}: {
  collection: SharedCollection;
  onSelect: (c: SharedCollection) => void;
}) => {
  const ownerName = collection.profiles?.username || 'User';
  const ownerAvatar = collection.profiles?.avatar_url || undefined;

  return (
    <div
      className="flex flex-col rounded-3xl border border-border/60 bg-card hover:bg-card/90 overflow-hidden active:scale-[0.98] transition-transform text-card-foreground shadow-xs transform-gpu [content-visibility:auto] [contain-intrinsic-size:320px]"
    >
      {/* Container area */}
      <div className="p-4 cursor-pointer" onClick={() => onSelect(collection)}>
        {/* Header: User Profile */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={ownerAvatar} />
            <AvatarFallback>{ownerName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <h3 className="font-bold text-foreground text-base leading-tight truncate max-w-[200px]">
              {collection.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                @{ownerName}
              </span>
              <div className="w-1 h-1 bg-border rounded-full" />
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Baru saja
              </span>
            </div>
          </div>
        </div>

        {/* Posters Stack Preview */}
        <div className="relative h-40 mb-2">
           {collection.collection_items && collection.collection_items.length > 0 ? (
             <div className="relative w-full h-full flex items-center justify-center">
               {collection.collection_items.slice(0, 3).map((item, idx) => (
                 <div
                   key={item.id}
                   className="absolute h-full aspect-[2/3] rounded-2xl overflow-hidden border border-border/60 shadow-md transform-gpu"
                   style={{
                     zIndex: 10 - idx,
                     transform: `translateX(${(idx - 1) * 20}px) rotate(${(idx - 1) * 6}deg) scale(${1 - idx * 0.08}) translateY(${idx * 4}px)`,
                     opacity: 1 - idx * 0.15,
                   }}
                 >
                   {item.poster_path ? (
                     <img
                       src={getImageUrl(item.poster_path, 'w300')}
                       alt=""
                       loading="lazy"
                       decoding="async"
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full bg-muted" />
                   )}
                 </div>
               ))}
             </div>
           ) : (
             <div className="w-full h-full rounded-2xl bg-muted/40 border border-dashed border-border flex flex-col items-center justify-center gap-2">
                <FilmIcon className="w-6 h-6 text-muted-foreground/30" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Kosong</span>
             </div>
           )}
        </div>
      </div>

      {/* Footer Social Actions */}
      <div className="px-5 py-3 border-t border-border/40 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-rose-500 transition-colors">
            <Heart className="w-4 h-4" />
            <span className="text-xs font-bold">12</span>
          </button>
          <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs font-bold">3</span>
          </button>
        </div>
        <button className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
MobileSharedCollectionCard.displayName = 'MobileSharedCollectionCard';

export const MobileSharedFilms: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const [selected, setSelected] = useState<SharedCollection | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  // Reset limit when search changes
  React.useEffect(() => {
    setVisibleCount(6);
  }, [deferredSearchQuery]);

  // Scroll to top when opening a collection with rAF
  React.useEffect(() => {
    if (selected) {
      const frameId = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [selected]);

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

  const visibleCollections = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  if (selected) {
    const ownerName = selected.profiles?.username || null;
    const ownerAvatarUrl = selected.profiles?.avatar_url || null;
    return (
      <PageLayout title={selected.name}>
        <div className="flex-1 overflow-y-auto pb-24">
          <MobileCollectionDetails
            collectionId={selected.id}
            collectionName={selected.name}
            description={parseCollectionDescription(selected.description).description}
            ownerName={ownerName}
            ownerAvatarUrl={ownerAvatarUrl}
            readOnly
            onBack={() => setSelected(null)}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Film Bersama" showBackButton={false}>
      <div className="relative -mx-4 -mt-4 pb-0">
        {/* Mobile Hero Section */}
        <div className="relative pt-20 px-6 pb-12 overflow-hidden bg-card/60 border-b border-border/40">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background z-10" />
            <div className="absolute top-0 inset-x-0 h-[300px] flex gap-2 opacity-10 pointer-events-none">
              {collections?.slice(0, 4).map((c, i) => (
                <img 
                  key={i}
                  src={getImageUrl(c.collection_items[0]?.poster_path || '', 'w92')} 
                  className="w-1/3 object-cover rounded-xl"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>

          <div className="relative z-20 text-center space-y-4">
            <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              Komunitas
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Cari & Temukan<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-600 dark:from-teal-400 dark:to-blue-500 italic">Bersama-sama</span>
            </h1>
            
            <div className="relative max-w-full">
              <div className="relative flex items-center p-1.5 rounded-full bg-card border border-border focus-within:border-primary/50 shadow-sm">
                <Search className="w-4 h-4 text-muted-foreground ml-3 shrink-0" />
                <Input
                  placeholder="Cari koleksi dunia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground h-10 text-sm pl-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 pb-24 px-4 overflow-y-auto space-y-4 -mt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[280px] rounded-3xl bg-card/40 border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[40vh]">
            <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-foreground font-bold mb-2">Koleksi tidak ditemukan</h3>
            <p className="text-sm text-muted-foreground">
              Jadilah yang pertama untuk membagikan koleksi publik!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {visibleCollections.map((collection) => (
              <MobileSharedCollectionCard
                key={collection.id}
                collection={collection}
                onSelect={setSelected}
              />
            ))}

            {visibleCount < filtered.length && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="w-full py-3 mt-2 rounded-2xl bg-card hover:bg-accent border border-border text-xs font-bold text-primary transition-all shadow-xs"
              >
                Muat Lebih Banyak ({filtered.length - visibleCount} sisa)
              </button>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};
