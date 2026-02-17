import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { 
  getMovieDetails, 
  getTVDetails, 
  getMovieRecommendations,
  getTVRecommendations,
  getTVSeasonDetails,
  getWatchedEpisodes,
  updateWatchedEpisode
  getWatchedEpisodes,
  updateWatchedEpisode
} from '@/services/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Clock, Heart, List, LogIn, Bookmark, CheckCircle } from 'lucide-react';
import { Star, Calendar, Clock, Heart, List, LogIn, Bookmark, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddToCollectionDialog } from '@/components/AddToCollectionDialog';
import { EpisodeSelector } from '@/components/EpisodeSelector';

const Watch = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [user, setUser] = useState<any>(null);
  
  const validType = type === 'movie' || type === 'tv' ? type : null;
  const mediaId = id ? parseInt(id) : null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthRedirect = () => {
    navigate('/auth', { 
      state: { 
        redirectTo: location.pathname,
        mediaType: validType,
        mediaId: mediaId 
      } 
    });
  };

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ['details', validType, mediaId],
    queryFn: () => validType === 'movie' ? getMovieDetails(id!) : getTVDetails(id!),
    enabled: !!validType && !!mediaId,
  });

  const { data: seasonDetails, isLoading: seasonLoading } = useQuery({
    queryKey: ['season', mediaId, selectedSeason],
    queryFn: () => getTVSeasonDetails(id!, selectedSeason),
    enabled: validType === 'tv' && !!mediaId,
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations', validType, mediaId],
    queryFn: () => validType === 'movie' ? getMovieRecommendations(id!) : getTVRecommendations(id!),
    enabled: !!validType && !!mediaId,
  });

  const { data: isFavorite } = useQuery({
    queryKey: ['favorite', validType, mediaId],
    queryFn: async () => {
      if (!user || !validType || !mediaId) return false;
      const { data } = await supabase
        .from('favorites')
        .select('*')
        .eq('media_id', mediaId)
        .eq('media_type', validType)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!validType && !!mediaId,
  });

  const { data: isInWatchlist } = useQuery({
    queryKey: ['watchlist', validType, mediaId],
    queryFn: async () => {
      if (!user || !validType || !mediaId) return false;
      const { data } = await supabase
        .from('watchlist')
        .select('*')
        .eq('media_id', mediaId)
        .eq('media_type', validType)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!validType && !!mediaId,
  });

  const { data: watchedEpisode, isLoading: watchedEpisodeLoading } = useQuery({
    queryKey: ['watchedEpisode', mediaId],
    queryFn: () => getWatchedEpisodes(id!),
    enabled: !!user && validType === 'tv' && !!mediaId,
  });

  useEffect(() => {
    if (watchedEpisode && !watchedEpisodeLoading && validType === 'tv') {
      setSelectedSeason(watchedEpisode.season_number);
      setSelectedEpisode(watchedEpisode.episode_number);
    }
  }, [watchedEpisode, watchedEpisodeLoading, validType]);

  const markAsWatched = useMutation({
    mutationFn: async () => {
      if (!user) {
        handleAuthRedirect();
        return;
      }
      if (validType === 'tv' && details) {
        return updateWatchedEpisode(
          id!, 
          selectedSeason, 
          selectedEpisode, 
          details.name
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedEpisode', mediaId] });
      toast({
        title: "Progress updated",
        description: `Marked S${selectedSeason}:E${selectedEpisode} as watched`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: watchedEpisode, isLoading: watchedEpisodeLoading } = useQuery({
    queryKey: ['watchedEpisode', mediaId],
    queryFn: () => getWatchedEpisodes(id!),
    enabled: !!user && validType === 'tv' && !!mediaId,
  });

  useEffect(() => {
    if (watchedEpisode && !watchedEpisodeLoading && validType === 'tv') {
      setSelectedSeason(watchedEpisode.season_number);
      setSelectedEpisode(watchedEpisode.episode_number);
    }
  }, [watchedEpisode, watchedEpisodeLoading, validType]);

  const markAsWatched = useMutation({
    mutationFn: async () => {
      if (!user) {
        handleAuthRedirect();
        return;
      }
      if (validType === 'tv' && details) {
        return updateWatchedEpisode(
          id!, 
          selectedSeason, 
          selectedEpisode, 
          details.name
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchedEpisode', mediaId] });
      toast({
        title: "Progress updated",
        description: `Marked S${selectedSeason}:E${selectedEpisode} as watched`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!user) {
        handleAuthRedirect();
        return;
      }
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('media_id', mediaId)
          .eq('media_type', validType);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            media_id: mediaId,
            media_type: validType,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', validType, mediaId] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating favorites",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleWatchlist = useMutation({
    mutationFn: async () => {
      if (!user) {
        handleAuthRedirect();
        return;
      }
      if (isInWatchlist) {
        const { error } = await supabase
          .from('watchlist')
          .delete()
          .eq('media_id', mediaId)
          .eq('media_type', validType);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('watchlist')
          .insert({
            user_id: user.id,
            media_id: mediaId,
            media_type: validType,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', validType, mediaId] });
      toast({
        title: isInWatchlist ? "Removed from watchlist" : "Added to watchlist",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating watchlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!validType || !mediaId) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid media type or ID</h2>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (detailsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="w-full aspect-video mb-6" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{details?.title || details?.name}</h1>
            <div className="flex gap-2">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleFavorite.mutate()}
                    className={isFavorite ? "bg-rose-500/20" : ""}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleWatchlist.mutate()}
                    className={isInWatchlist ? "bg-primary/20" : ""}
                  >
                    <List className={`h-4 w-4 ${isInWatchlist ? "fill-primary text-primary" : ""}`} />
                  </Button>
                  <AddToCollectionDialog
                    mediaId={mediaId!}
                    mediaType={validType as 'movie' | 'tv'}
                    posterPath={details?.poster_path}
                    title={validType === 'movie' ? details?.title : details?.name}
                    overview={details?.overview}
                    voteAverage={details?.vote_average}
                    releaseDate={validType === 'movie' ? details?.release_date : undefined}
                    firstAirDate={validType === 'tv' ? details?.first_air_date : undefined}
                  />
                </>
              ) : (
                <Button variant="outline" onClick={handleAuthRedirect} className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign in to save
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {details?.vote_average?.toFixed(1)}/10
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(details?.release_date || details?.first_air_date).getFullYear()}
            </Badge>
            {details?.runtime && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {details.runtime} min
              </Badge>
            )}
          </div>

          <div className="aspect-video w-full mb-6 rounded-lg overflow-hidden bg-black shadow-lg">
            <iframe
              src={type === 'movie' 
                ? `https://vidsrc.xyz/embed/movie/${id}`
                : `https://vidsrc.xyz/embed/tv/${id}/${selectedSeason}-${selectedEpisode}`
                ? `https://vidsrc.xyz/embed/movie/${id}`
                : `https://vidsrc.xyz/embed/tv/${id}/${selectedSeason}-${selectedEpisode}`
              }
              className="w-full h-full"
              allowFullScreen
              scrolling="no"
            />
          </div>

          <div className="flex flex-col gap-6 mb-8">
             <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-muted-foreground">{details?.overview}</p>
             </div>

             {type === 'tv' && (
                <div className="space-y-6">
                   {user && (
                     <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                           <Bookmark className="h-5 w-5 text-primary" />
                           <div className="flex flex-col">
                              <span className="font-medium">Track Progress</span>
                              {watchedEpisode && (
                                <span className="text-xs text-muted-foreground">
                                   Last watched: S{watchedEpisode.season_number} E{watchedEpisode.episode_number}
                                </span>
                              )}
                           </div>
                        </div>
                        <Button 
                          onClick={() => markAsWatched.mutate()}
                          size="sm"
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark S{selectedSeason}:E{selectedEpisode} Watched
                        </Button>
                     </div>
                   )}

                   <div className="bg-card/50 rounded-xl p-1">
                      <EpisodeSelector 
                        seasons={details?.seasons?.length > 0 ? details.seasons : Array.from({ length: details?.number_of_seasons || 0 }, (_, i) => ({
                            id: i,
                            name: `Season ${i + 1}`,
                            season_number: i + 1,
                            episode_count: 0,
                            poster_path: '',
                            overview: '',
                            air_date: '',
                            vote_average: 0
                        }))}
                        selectedSeason={selectedSeason}
                        onSeasonChange={setSelectedSeason}
                        episodes={seasonDetails?.episodes || []}
                        selectedEpisode={selectedEpisode}
                        onEpisodeChange={setSelectedEpisode}
                        isLoading={seasonLoading}
                      />
                   </div>
                </div>
             )}
          </div>

          {!recommendationsLoading && recommendations?.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">More Like This</h2>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex space-x-4">
                  {recommendations.map((item: any, index: number) => (
                    <div key={item.id} className="w-[200px] flex-shrink-0">
                      <MovieCard
                        id={item.id}
                        title={item.title || item.name}
                        posterPath={item.poster_path}
                        overview={item.overview}
                        mediaType={type as 'movie' | 'tv'}
                        voteAverage={item.vote_average}
                        releaseDate={item.release_date || item.first_air_date}
                        priority={index < 3} // Priority untuk 3 gambar pertama
                      />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watch;