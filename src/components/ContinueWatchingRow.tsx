import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getContinueWatching, deleteFromWatchHistory, WatchHistoryRow } from '@/services/history';
import { Play, PlayCircle, Clock, X, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const ContinueWatchingRow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['continueWatching', user?.id],
    queryFn: getContinueWatching,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string; mediaId: number; title: string }) => {
      return deleteFromWatchHistory(id);
    },
    onSuccess: (_, variables) => {
      // Clear from localStorage backup as well
      try {
        const raw = localStorage.getItem('vidRockProgress');
        if (raw) {
          let list = JSON.parse(raw);
          if (Array.isArray(list)) {
            list = list.filter((x: any) => String(x.id) !== String(variables.mediaId));
            localStorage.setItem('vidRockProgress', JSON.stringify(list));
          }
        }
      } catch (e) {
        console.warn('Failed to clear vidRockProgress from localStorage:', e);
      }

      queryClient.invalidateQueries({ queryKey: ['continueWatching'] });
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
      
      toast({
        title: 'Dihapus dari Lanjutkan Menonton',
        description: `"${variables.title}" telah dihapus dari daftar.`,
      });
    },
  });

  if (!user || isLoading || !items || items.length === 0) {
    return null;
  }

  const handlePlay = (item: WatchHistoryRow) => {
    if (item.media_type === 'tv') {
      navigate(`/watch/tv/${item.media_id}`, {
        state: {
          season: item.season_number || 1,
          episode: item.episode_number || 1,
        },
      });
    } else {
      navigate(`/watch/movie/${item.media_id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent, item: WatchHistoryRow) => {
    e.stopPropagation();
    deleteMutation.mutate({
      id: item.id,
      mediaId: item.media_id,
      title: item.title,
    });
  };

  return (
    <section className="space-y-3 my-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <PlayCircle className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            Lanjutkan Menonton
          </h2>
          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
            {items.length}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide">
        {items.map((item) => {
          const posterUrl = item.poster_path
            ? item.poster_path.startsWith('http')
              ? item.poster_path
              : `https://image.tmdb.org/t/p/w300${item.poster_path}`
            : '/placeholder.svg';

          const progress = item.progress_percent || 0;

          return (
            <div
              key={item.id}
              className="flex-shrink-0 w-36 sm:w-44 group cursor-pointer relative flex flex-col space-y-2 transition-transform duration-200 hover:scale-105 transform-gpu will-change-transform"
              onClick={() => handlePlay(item)}
            >
              {/* Card Poster with Progress Overlay */}
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-card border border-border/40 shadow-lg">
                <img
                  src={posterUrl}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* TV Season/Episode Badge */}
                {item.media_type === 'tv' && item.season_number && (
                  <div className="absolute top-2 left-2">
                    <Badge className="text-[10px] bg-black/70 backdrop-blur-md text-white border-white/20 px-2 py-0.5">
                      S{item.season_number} E{item.episode_number || 1}
                    </Badge>
                  </div>
                )}

                {/* Delete Button (Top Right on Hover) */}
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Hapus dari lanjutkan menonton"
                  className="absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-black/75 hover:bg-destructive text-white opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md backdrop-blur-sm"
                  onClick={(e) => handleDelete(e, item)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-primary/90 text-primary-foreground shadow-xl transform scale-95 group-hover:scale-100 transition-transform"
                  >
                    <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                  </Button>
                </div>

                {/* Bottom Progress Info */}
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <div className="flex items-center justify-between text-[10px] text-gray-300 font-medium mb-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary" />
                      {progress}%
                    </span>
                    <span>{item.media_type === 'movie' ? 'Film' : 'Series'}</span>
                  </div>
                </div>

                {/* Red/Primary Progress Bar at bottom border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="px-1 min-w-0">
                <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                {item.media_type === 'tv' && item.episode_name && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.episode_name}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
