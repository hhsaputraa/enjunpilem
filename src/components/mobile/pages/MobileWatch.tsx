'use client';

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileVideoPlayer } from '../MobileVideoPlayer';
import { DetailSkeleton } from '../Skeletons';
import { NotFoundError, LoadError } from '../ErrorState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Download,
  Share,
  Plus,
  Check,
  Star,
  Calendar,
  Clock
} from 'lucide-react';
import { useContentDetails, formatContentForMobile } from '@/hooks/useMobileApi';
import { cn } from '@/lib/utils';

export const MobileWatch: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [showPlayer, setShowPlayer] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const movieId = params.id as string;
  const movieType = params.type as 'movie' | 'tv' || 'movie';

  // Use real TMDB data
  const { data: movieDetails, isLoading, error } = useContentDetails(movieType, movieId);

  // Transform data for mobile
  const movie = movieDetails ? formatContentForMobile(movieDetails) : null;

  const handleBack = () => {
    navigate(-1);
  };

  const handleWatchlistToggle = () => {
    // TODO: Implement watchlist toggle with Supabase
    console.log('Toggle watchlist for:', movieId);
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
      {/* Video Player */}
      {showPlayer && (
        <div className="relative">
          <MobileVideoPlayer
            movieId={movieId}
            movieTitle={movie.title}
            type={movieType}
            season={selectedSeason}
            episode={selectedEpisode}
            onClose={() => setShowPlayer(false)}
          />
        </div>
      )}

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
                className="rounded-full"
              >
                <Plus className="h-4 w-4" />
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
                {movieDetails.genres.map((genre: any, index: number) => (
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
              <p className="text-muted-foreground leading-relaxed">
                {movie.overview}
              </p>
            </div>
          )}

          {/* TV Show Episodes (if applicable) */}
          {movieType === 'tv' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Episode</h2>
              
              {/* Season Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: movieDetails.number_of_seasons || 1 }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={selectedSeason === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSeason(i + 1)}
                    className="flex-shrink-0"
                  >
                    Season {i + 1}
                  </Button>
                ))}
              </div>

              {/* Episode List */}
              <div className="space-y-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => {
                      setSelectedEpisode(i + 1);
                      setShowPlayer(true);
                    }}
                    className={cn(
                      "w-full p-3 rounded-lg border text-left transition-colors",
                      selectedEpisode === i + 1
                        ? "bg-primary/10 border-primary"
                        : "bg-card hover:bg-card/80 border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Episode {i + 1}</h3>
                        <p className="text-sm text-muted-foreground">
                          Episode Title {i + 1}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        45m
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowPlayer(true)}
              className="flex-1 h-12"
            >
              {showPlayer ? 'Lanjut Tonton' : 'Mulai Tonton'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleWatchlistToggle}
              className="h-12 w-12"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12"
            >
              <Download className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
