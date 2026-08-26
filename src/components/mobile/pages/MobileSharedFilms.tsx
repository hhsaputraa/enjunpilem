import React, { useState, useMemo } from 'react';
import { PageLayout } from '../MobileLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getImageUrl } from '@/services/tmdb';
import { Search, Users, TrendingUp, Clock, Eye, Heart, MessageCircle, Share2, Film as FilmIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileCollectionDetails } from './MobileCollectionDetails';

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

export const MobileSharedFilms: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<SharedCollection | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  // Reset limit when search changes
  React.useEffect(() => {
    setVisibleCount(6);
  }, [searchQuery]);

  // Scroll to top when opening a collection
  React.useEffect(() => {
    if (selected) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            description={selected.description}
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
        <div className="relative pt-20 px-6 pb-12 overflow-hidden bg-zinc-950">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 via-zinc-950 to-zinc-950 z-10" />
            <div className="absolute top-0 inset-x-0 h-[300px] flex gap-2 opacity-10 blur-sm scale-110">
              {collections?.slice(0, 4).map((c, i) => (
                <img 
                  key={i}
                  src={getImageUrl(c.collection_items[0]?.poster_path || '', 'w185')} 
                  className="w-1/3 object-cover rounded-xl"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>

          <div className="relative z-20 text-center space-y-4">
            <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-bold uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              Komunitas
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Cari & Temukan<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 italic">Bersama-sama</span>
            </h1>
            
            <div className="relative max-w-full">
              <div className="absolute inset-0 bg-teal-500/10 blur-xl -z-10 rounded-full" />
              <div className="relative flex items-center p-1.5 rounded-full bg-zinc-900 border border-white/10 focus-within:border-teal-500/50">
                <Search className="w-4 h-4 text-zinc-400 ml-3 shrink-0" />
                <Input
                  placeholder="Cari koleksi dunia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-zinc-500 h-10 text-sm pl-2"
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
              <div key={i} className="h-[280px] rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[40vh]">
            <Search className="w-12 h-12 text-white/10 mb-4" />
            <h3 className="text-white font-bold mb-2">Koleksi tidak ditemukan</h3>
            <p className="text-sm text-zinc-500">
              Jadilah yang pertama untuk membagikan koleksi publik!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {visibleCollections.map((collection) => {
              const ownerName = collection.profiles?.username || 'User';
              const ownerAvatar = collection.profiles?.avatar_url || undefined;
              return (
                <div
                  key={collection.id}
                  className="flex flex-col rounded-3xl border border-white/5 bg-zinc-900/40 overflow-hidden active:scale-[0.98] transition-transform"
                >
                  {/* Container area */}
                  <div className="p-4" onClick={() => setSelected(collection)}>
                    {/* Header: User Profile */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={ownerAvatar} />
                        <AvatarFallback>{ownerName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-white text-base leading-tight truncate max-w-[200px]">
                          {collection.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
                            @{ownerName}
                          </span>
                          <div className="w-1 h-1 bg-white/20 rounded-full" />
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
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
                               className="absolute h-full aspect-[2/3] rounded-2xl overflow-hidden border border-white/10"
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
                                 <div className="w-full h-full bg-zinc-800" />
                               )}
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="w-full h-full rounded-2xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-2">
                            <FilmIcon className="w-6 h-6 text-white/10" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-500/40">Kosong</span>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Footer Social Actions */}
                  <div className="px-5 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-zinc-500">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs font-bold">12</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-zinc-500">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs font-bold">3</span>
                      </button>
                    </div>
                    <button className="p-2 rounded-full bg-white/5 text-zinc-400">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {visibleCount < filtered.length && (
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="w-full py-3 mt-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-teal-400 transition-all"
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
