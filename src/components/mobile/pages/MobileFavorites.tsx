import React from 'react';
import { PageLayout } from '../MobileLayout';
import { useMobileFavorites } from '@/hooks/useMobileWatchlist';
import { useQueries } from '@tanstack/react-query';
import { getMovieDetails, getTVDetails } from '@/services/tmdb';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '@/services/tmdb';
import { Heart, Search, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MobileFavorites: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, isLoading: isLoadingFavorites } = useMobileFavorites();

  // Fetch details for all favorites
  const tmdbQueries = useQueries({
    queries: favorites.map((fav) => ({
      queryKey: ['tmdb-detail', fav.media_type, fav.tmdb_id],
      queryFn: () => fav.media_type === 'movie' 
        ? getMovieDetails(fav.tmdb_id!)
        : getTVDetails(fav.tmdb_id!),
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!fav.tmdb_id,
    }))
  });

  const isLoadingDetails = tmdbQueries.some(q => q.isLoading);
  const isPreparing = isLoadingFavorites || isLoadingDetails;

  // Combine favorite entries with their TMDB details
  const enrichedFavorites = favorites.map((fav, index) => {
    const tmdbData = tmdbQueries[index].data;
    return {
      ...fav,
      title: tmdbData?.title || tmdbData?.name || 'Unknown',
      poster_path: tmdbData?.poster_path,
    };
  }).filter(fav => fav.poster_path); // Optionally filter ones that couldn't load

  return (
    <PageLayout title="Favorit">
      <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {isPreparing ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : enrichedFavorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh]">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
              <div className="relative w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Heart className="w-10 h-10 text-white/20" />
              </div>
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Belum ada Favorit</h3>
            <p className="text-sm text-zinc-400 max-w-[250px] mb-8">
              Kumpulkan memori film dan serial yang paling berkesan di hati Anda.
            </p>
            <Button
               onClick={() => navigate('/explore')}
               className="bg-red-500 hover:bg-red-600 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Cari Sesuatu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {enrichedFavorites.map((fav) => (
              <div
                key={fav.id}
                onClick={() => navigate(`/${fav.media_type}/${fav.tmdb_id}`)}
                className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer active:scale-[0.98] transition-transform"
              >
                {fav.poster_path ? (
                  <img
                    src={getImageUrl(fav.poster_path, 'w300')}
                    alt={fav.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <Film className="w-6 h-6 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 text-[9px] font-bold text-white line-clamp-2 uppercase tracking-wide">
                  {fav.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};
