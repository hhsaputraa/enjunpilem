import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookmarkPlus, FolderPlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToastHelpers } from '@/components/mobile/Toast';

interface MobileAddToSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  overview?: string;
  voteAverage?: number;
  releaseDate?: string;
  firstAirDate?: string;
}

export const MobileAddToSheet: React.FC<MobileAddToSheetProps> = ({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  title,
  posterPath,
  overview,
  voteAverage,
  releaseDate,
  firstAirDate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isInWatchlist, toggleWatchlist, isAddingToWatchlist, isRemovingFromWatchlist } = useMobileWatchlist();
  const { showSuccess, showError } = useToastHelpers();
  const queryClient = useQueryClient();
  const [showCollections, setShowCollections] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const inWatchlist = isInWatchlist(String(mediaId));

  // Fetch user's collections
  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['collections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('collections')
        .select(`*, collection_items!collection_items_collection_id_fkey(media_id, media_type)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isOpen,
  });

  const addToCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      const { error } = await supabase.from('collection_items').insert({
        collection_id: collectionId,
        media_id: mediaId,
        media_type: mediaType,
        poster_path: posterPath,
        title: mediaType === 'movie' ? title : undefined,
        name: mediaType === 'tv' ? title : undefined,
        overview,
        vote_average: voteAverage,
        release_date: releaseDate,
        first_air_date: firstAirDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      showSuccess('Berhasil!', `"${title}" ditambahkan ke koleksi`);
      handleClose();
    },
    onError: (err: Error) => showError('Gagal', err.message),
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User tidak terautentikasi');
      const { data: collection, error: colErr } = await supabase
        .from('collections')
        .insert({ name, user_id: user.id })
        .select()
        .single();
      if (colErr) throw colErr;
      const { error: itemErr } = await supabase.from('collection_items').insert({
        collection_id: collection.id,
        media_id: mediaId,
        media_type: mediaType,
        poster_path: posterPath,
        title: mediaType === 'movie' ? title : undefined,
        name: mediaType === 'tv' ? title : undefined,
        overview,
        vote_average: voteAverage,
        release_date: releaseDate,
        first_air_date: firstAirDate,
      });
      if (itemErr) throw itemErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      showSuccess('Koleksi dibuat!', `"${title}" ditambahkan ke koleksi baru`);
      handleClose();
    },
    onError: (err: Error) => showError('Gagal', err.message),
  });

  const handleClose = () => {
    setShowCollections(false);
    setSearchQuery('');
    onClose();
  };

  const handleWatchlistClick = () => {
    if (!user) {
      // Redirect to login and save current path to redirect back + show popup
      navigate('/auth', { state: { redirectTo: location.pathname, showAddSheet: true } });
      handleClose();
      return;
    }
    toggleWatchlist({ id: String(mediaId), title, type: mediaType });
    handleClose();
  };

  const handleCollectionClick = () => {
    if (!user) {
      navigate('/auth', { state: { redirectTo: location.pathname, showAddSheet: true } });
      handleClose();
      return;
    }
    setShowCollections(true);
  };

  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-[110]",
        "bg-background border-t border-border/50",
        "rounded-t-3xl shadow-2xl",
        "animate-slide-up",
        "pb-6 pb-safe-bottom"
      )}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Main Menu */}
        <div className={cn("px-4 pb-6 pt-2 transition-all duration-300", showCollections && "hidden")}>
          {/* Film Preview */}
          <div className="flex items-center gap-3 mb-5 p-3 rounded-2xl bg-secondary/30">
            {posterPath && (
              <img
                src={`https://image.tmdb.org/t/p/w92${posterPath}`}
                alt={title}
                className="w-12 h-18 rounded-lg object-cover flex-shrink-0"
                style={{ height: '72px' }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-0.5">
                {mediaType === 'movie' ? 'Film' : 'Serial TV'}
              </p>
              <p className="font-bold text-sm truncate text-foreground">{title}</p>
              {overview && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{overview}</p>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold mb-4">Simpan ke...</h3>

          <div className="space-y-3">
            {/* Watchlist Button */}
            <Button
              className={cn(
                "w-full h-14 justify-start gap-4 rounded-2xl text-base",
                inWatchlist
                  ? "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                  : "bg-secondary/50 hover:bg-secondary text-foreground"
              )}
              variant="ghost"
              onClick={handleWatchlistClick}
              disabled={isAddingToWatchlist || isRemovingFromWatchlist}
            >
              {(isAddingToWatchlist || isRemovingFromWatchlist) ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <BookmarkPlus className={cn("w-5 h-5", inWatchlist && "fill-primary")} />
              )}
              <div className="text-left">
                <p className="font-semibold leading-tight">
                  {inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
                </p>
                <p className="text-xs text-muted-foreground font-normal">
                  {inWatchlist ? 'Sudah ada di daftar tonton' : 'Simpan untuk ditonton nanti'}
                </p>
              </div>
            </Button>

            {/* Add to Collection Button */}
            <Button
              className="w-full h-14 justify-start gap-4 rounded-2xl text-base bg-secondary/50 hover:bg-secondary text-foreground"
              variant="ghost"
              onClick={handleCollectionClick}
            >
              <FolderPlus className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <p className="font-semibold leading-tight">Tambah ke Koleksi</p>
                <p className="text-xs text-muted-foreground font-normal">
                  Atur film ke dalam koleksi pilihan
                </p>
              </div>
            </Button>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full mt-3 text-muted-foreground hover:text-foreground"
          >
            Batal
          </Button>
        </div>

        {/* Collections List */}
        <div className={cn("px-4 pb-6 pt-2 transition-all duration-300", !showCollections && "hidden")}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setShowCollections(false)} className="text-muted-foreground hover:text-foreground">
              ← Kembali
            </button>
            <h3 className="font-bold text-base">Pilih Koleksi</h3>
            <button onClick={handleClose}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Search / Create */}
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari atau buat koleksi baru..."
            className="w-full mb-3 px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <div className="max-h-[300px] overflow-y-auto space-y-2 pb-4 pr-1 scrollbar-thin">
            {/* Create new collection option */}
            {searchQuery && !filteredCollections.some(c => c.name.toLowerCase() === searchQuery.toLowerCase()) && (
              <button
                onClick={() => createCollectionMutation.mutate(searchQuery)}
                disabled={createCollectionMutation.isPending}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-left"
              >
                <FolderPlus className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">Buat koleksi baru</p>
                  <p className="text-xs text-muted-foreground">"{searchQuery}"</p>
                </div>
                {createCollectionMutation.isPending && <Loader2 className="w-4 h-4 animate-spin ml-auto text-primary" />}
              </button>
            )}

            {collectionsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredCollections.length === 0 && !searchQuery ? (
              <p className="text-center text-muted-foreground text-sm py-6">
                Belum ada koleksi. Ketik nama untuk membuat baru!
              </p>
            ) : (
              filteredCollections.map(col => {
                const alreadyAdded = col.collection_items?.some(
                  (i: { media_id: number; media_type: string }) => i.media_id === mediaId && i.media_type === mediaType
                );
                return (
                  <button
                    key={col.id}
                    onClick={() => !alreadyAdded && addToCollectionMutation.mutate(col.id)}
                    disabled={alreadyAdded || addToCollectionMutation.isPending}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                      alreadyAdded
                        ? "bg-secondary/20 opacity-60 cursor-default"
                        : "bg-secondary/50 hover:bg-secondary active:scale-[0.98]"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border">
                      <FolderPlus className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{col.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {col.collection_items?.length || 0} item
                      </p>
                    </div>
                    {alreadyAdded && (
                      <span className="text-xs text-primary font-medium flex-shrink-0">✓ Sudah ada</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};
