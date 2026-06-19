import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '../MobileLayout';
import { getWatchHistory, deleteFromWatchHistory } from '@/services/history';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Trash2, Film, Tv, Clock, LogIn } from 'lucide-react';
import { getImageUrl } from '@/services/tmdb';

export const MobileHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: getWatchHistory,
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFromWatchHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats-watched'] });
    },
  });

  const handleItemClick = (mediaId: number, mediaType: string) => {
    navigate(`/watch/${mediaType}/${mediaId}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  if (!user) {
    return (
      <PageLayout title="Riwayat Tontonan">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4 min-h-[50vh]">
          <Clock className="w-16 h-16 text-muted-foreground animate-pulse" />
          <h3 className="text-lg font-bold">Belum Login</h3>
          <p className="text-sm text-muted-foreground max-w-[280px]">
            Masuk untuk menyimpan dan menyinkronkan riwayat tontonan Anda di berbagai perangkat.
          </p>
          <Button onClick={() => navigate('/auth')} className="w-full max-w-[200px]">
            <LogIn className="w-4 h-4 mr-2" /> Login Sekarang
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Riwayat Tontonan">
      <div className="flex-1 p-4 space-y-4 pb-20">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 bg-card animate-pulse rounded-2xl border border-border/30" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
            <Film className="w-12 h-12 text-muted-foreground/60" />
            <h4 className="font-bold text-sm">Belum Ada Riwayat</h4>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Film dan serial TV yang Anda tonton akan otomatis muncul di sini.
            </p>
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              Mulai Menonton
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item.media_id, item.media_type)}
                className="flex gap-3 p-3 rounded-2xl bg-card border border-border/30 hover:border-border/60 transition-all cursor-pointer relative group active:scale-[0.99]"
              >
                {/* Poster */}
                <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={getImageUrl(item.poster_path || '', 'w185')}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm p-1 rounded-md">
                    {item.media_type === 'movie' ? (
                      <Film className="w-3 h-3 text-white" />
                    ) : (
                      <Tv className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-8 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm line-clamp-1 leading-snug">
                      {item.title}
                    </h4>
                    {item.release_year && (
                      <p className="text-2xs text-muted-foreground mt-0.5">
                        {item.release_year}
                      </p>
                    )}
                  </div>

                  {item.media_type === 'tv' && item.season_number && item.episode_number && (
                    <div className="bg-secondary/40 border border-secondary rounded-lg px-2.5 py-1 text-3xs font-medium text-muted-foreground w-fit max-w-full truncate mt-1">
                      Terakhir: S{item.season_number} • E{item.episode_number}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-3xs text-muted-foreground mt-2">
                    <Clock className="w-3 h-3 text-primary/70" />
                    <span>
                      {new Date(item.last_watched_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDelete(e, item.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};
