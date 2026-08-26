'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MobileVideoPlayer } from '../MobileVideoPlayer';
import { DetailSkeleton } from '../Skeletons';
import { NotFoundError, LoadError } from '../ErrorState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Share,
  Plus,
  Check,
  Star,
  Calendar,
  Clock
} from 'lucide-react';
import { useContentDetails, formatContentForMobile, useTVSeasonDetails } from '@/hooks/useMobileApi';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { getWatchedEpisodes, updateWatchedEpisode } from '@/services/tmdb';
import { addToWatchHistory } from '@/services/history';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { TMDBGenre, TMDBEpisode, TMDBSeason } from '@/types/tmdb';

export const MobileWatch: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const movieId = params.id as string;
  const movieType = params.type as 'movie' | 'tv' || 'movie';

  // Use real TMDB data
  const { data: movieDetails, isLoading, error } = useContentDetails(movieType, movieId);

  // Transform data for mobile
  const movie = movieDetails ? formatContentForMobile(movieDetails) : null;

  // Watchlist helpers
  const { toggleWatchlist, isInWatchlist } = useMobileWatchlist();
  const inWatchlist = isInWatchlist(movieId);

  // Fetch watched episode history for TV series
  const { data: watchedEpisode, isLoading: watchedEpisodeLoading } = useQuery({
    queryKey: ['watchedEpisode', movieId],
    queryFn: () => getWatchedEpisodes(movieId),
    enabled: !!user && movieType === 'tv' && !!movieId,
  });

  // Restore progress on load
  useEffect(() => {
    if (watchedEpisode && movieType === 'tv') {
      setSelectedSeason(watchedEpisode.season_number);
      setSelectedEpisode(watchedEpisode.episode_number);
    }
  }, [watchedEpisode, movieType]);

  // Fetch season episodes dynamically for TV shows
  const { data: seasonDetails, isLoading: isLoadingSeason } = useTVSeasonDetails(
    movieType === 'tv' ? movieId : '',
    selectedSeason
  );
  const episodes = React.useMemo(() => seasonDetails?.episodes || [], [seasonDetails?.episodes]);

  // Save movie or TV progress to watch history when played
  useEffect(() => {
    if (!user || !movie || !movieDetails) return;
    
    // For TV shows, wait until episodes are loaded if they exist
    if (movieType === 'tv' && isLoadingSeason) return;

    const currentEpisode = movieType === 'tv' ? episodes.find(e => e.episode_number === selectedEpisode) : null;
    
    addToWatchHistory({
      media_id: parseInt(movieId),
      media_type: movieType,
      title: movie.title,
      poster_path: movieDetails.poster_path || '',
      backdrop_path: movieDetails.backdrop_path || '',
      rating: movie.rating,
      release_year: movie.year,
      season_number: movieType === 'tv' ? selectedSeason : undefined,
      episode_number: movieType === 'tv' ? selectedEpisode : undefined,
      episode_name: movieType === 'tv' ? (currentEpisode?.name || `Episode ${selectedEpisode}`) : undefined,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats-watched'] });
    });
  }, [user, movie, movieType, movieId, movieDetails, selectedSeason, selectedEpisode, episodes, isLoadingSeason, queryClient]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleWatchlistToggle = async () => {
    if (!movie) return;
    await toggleWatchlist({
      id: movieId,
      title: movie.title,
      poster: movie.poster,
      backdrop: movie.backdrop,
      overview: movie.overview,
      year: movie.year,
      rating: movie.rating,
      type: movieType,
    });
  };

  const handleShare = () => {
    if (navigator.share && movie) {
      navigator.share({
        title: movie.title,
        text: `Tonton ${movie.title} di EnjunPilem`,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        {error ? (
          <LoadError onRetry={() => window.location.reload()} resource="video" />
        ) : (
          <NotFoundError 
            resource="Video"
            onGoHome={() => navigate('/')}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Always Visible Video Player */}
      <div className="relative">
        <MobileVideoPlayer
          movieId={movieId}
          movieTitle={movie.title}
          type={movieType}
          season={selectedSeason}
          episode={selectedEpisode}
        />
      </div>

      {/* Movie Info Section */}
      <div className="bg-background text-foreground">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="rounded-full"
              >
                <Share className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWatchlistToggle}
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                {inWatchlist ? (
                  <Check className="h-4 w-4 text-primary animate-scale-in" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Movie Details */}
        <div className="p-4 space-y-6">
          {/* Title and Info */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold leading-tight">
              {movie.title}
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              {movie.rating && movie.rating > 0 && (
                <Badge variant="secondary" className="text-yellow-400 border-yellow-400/30">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  {movie.rating.toFixed(1)}
                </Badge>
              )}
              <Badge variant="secondary" className="border-border/50">
                <Calendar className="w-3 h-3 mr-1" />
                {movie.year}
              </Badge>
              {movieDetails.runtime && (
                <Badge variant="secondary" className="border-border/50">
                  <Clock className="w-3 h-3 mr-1" />
                  {Math.floor(movieDetails.runtime / 60)}j {movieDetails.runtime % 60}m
                </Badge>
              )}
            </div>

            {/* Genres */}
            {movieDetails.genres && movieDetails.genres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {movieDetails.genres.map((genre: TMDBGenre, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Synopsis */}
          {movie.overview && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Sinopsis</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {movie.overview}
              </p>
            </div>
          )}

          {/* TV Show Episodes (if applicable) */}
          {movieType === 'tv' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Episode</h2>
              
              {/* Season Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {(movieDetails.seasons || []).map((season: TMDBSeason) => (
                  <Button
                    key={season.id}
                    variant={selectedSeason === season.season_number ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedSeason(season.season_number);
                      setSelectedEpisode(1);
                    }}
                    className="flex-shrink-0 rounded-full px-4"
                  >
                    {season.name}
                  </Button>
                ))}
              </div>

              {/* Episode List */}
              {isLoadingSeason ? (
                <div className="space-y-2 py-2">
                  <div className="h-14 bg-card animate-pulse rounded-xl border border-border/30"></div>
                  <div className="h-14 bg-card animate-pulse rounded-xl border border-border/30"></div>
                  <div className="h-14 bg-card animate-pulse rounded-xl border border-border/30"></div>
                </div>
              ) : episodes.length > 0 ? (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {episodes.map((episode: TMDBEpisode) => (
                    <button
                      key={episode.episode_number}
                      onClick={async () => {
                        setSelectedEpisode(episode.episode_number);
                        
                        // Automatically save watched progress to Supabase
                        if (user && movie) {
                          try {
                            await updateWatchedEpisode(
                              movieId,
                              selectedSeason,
                              episode.episode_number,
                              movie.title
                            );
                            queryClient.invalidateQueries({ queryKey: ['watchedEpisode', movieId] });
                          } catch (e) {
                            console.error('Error saving watched progress:', e);
                          }
                        }
                      }}
                      className={cn(
                        "w-full p-3.5 rounded-xl border text-left transition-all duration-200",
                        selectedEpisode === episode.episode_number
                          ? "bg-primary/10 border-primary shadow-sm"
                          : "bg-card hover:bg-card/80 border-border/50"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">
                            Eps {episode.episode_number}: {episode.name || `Episode ${episode.episode_number}`}
                          </h3>
                          {episode.overview && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {episode.overview}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0 bg-background/50 px-2 py-0.5 rounded-md border border-border/20">
                          {episode.runtime ? `${episode.runtime}m` : '45m'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Tidak ada episode untuk season ini.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
