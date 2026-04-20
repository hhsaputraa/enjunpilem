'use client';

import React, { useState } from 'react';
import { useNavigate, useParams,useLocation  } from 'react-router-dom';
// Using regular img tag instead of next/image
import { DetailLayout } from '../MobileLayout';
import { CarouselRow } from '../CarouselRow';
import { DetailSkeleton } from '../Skeletons';
import { NotFoundError, LoadError } from '../ErrorState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Plus,
  Check,
  Share,
  Download,
  Star,
  Calendar,
  Clock,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import { useContentDetails, useContentCredits, useContentRecommendations, formatContentForMobile } from '@/hooks/useMobileApi';
import { cn } from '@/lib/utils';

interface MovieDetail {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  overview: string;
  rating: number;
  year: string;
  runtime: number;
  genres: string[];
  type: 'movie' | 'tv';
  isInWatchlist: boolean;
  cast: Array<{
    id: string;
    name: string;
    character: string;
    profilePath?: string;
  }>;
  similar: Array<{
    id: string;
    title: string;
    poster: string;
    rating?: number;
    year?: string;
    type: 'movie' | 'tv';
  }>;
}


export const MobileMovieDetail: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const movieId = params.id as string;
  const movieType = location.pathname.startsWith('/tv/') ? 'tv' : 'movie';

  // Use real TMDB data
  const { data: movieDetails, isLoading, error } = useContentDetails(movieType, movieId);
  const { data: credits } = useContentCredits(movieType, movieId);
  const { data: recommendations } = useContentRecommendations(movieType, movieId);

  // Transform data for mobile
  const movie = movieDetails ? {
    ...formatContentForMobile(movieDetails),
    runtime: movieDetails.runtime || movieDetails.episode_run_time?.[0] || 0,
    genres: movieDetails.genres?.map((g: { name: string }) => g.name) || [],
    cast: credits?.cast?.slice(0, 10).map((actor: { id: number; name: string; character: string; profile_path?: string }) => ({
      id: actor.id.toString(),
      name: actor.name,
      character: actor.character,
      profilePath: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : undefined,
    })) || [],
    similar: recommendations ? recommendations.slice(0, 20).map(formatContentForMobile) : [],
  } : null;

  const handleWatchlistToggle = () => {
    // TODO: Implement watchlist toggle with Supabase
    console.log('Toggle watchlist for movie:', movieId);
  };

  const handlePlay = () => {
    // Navigate to watch page
    navigate(`/watch/${movieType}/${movieId}`);
  };

  const handleShare = () => {
    if (navigator.share && movie) {
      navigator.share({
        title: movie.title,
        text: movie.overview,
        url: window.location.href,
      });
    }
  };

  const handleSimilarItemClick = (item: { type: 'movie' | 'tv'; id: string }) => {
    navigate(`/${item.type}/${item.id}`);
  };

  if (isLoading) {
    return (
      <DetailLayout>
        <DetailSkeleton />
      </DetailLayout>
    );
  }

  if (error || !movie) {
    return (
      <DetailLayout>
        {error ? (
          <LoadError onRetry={() => window.location.reload()} resource="detail film" />
        ) : (
          <NotFoundError 
            resource="Film"
            onGoHome={() => navigate('/')}
          />
        )}
      </DetailLayout>
    );
  }

  return (
    <DetailLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <section className="relative h-[500px] -mx-4 -mt-4">
          <div className="absolute inset-0">
            <img
              src={movie.backdrop}
              alt={movie.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-700",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
          </div>

          {/* Header Controls */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 pt-safe-top">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            
          </div>

          {/* Movie Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-yellow-400 border-yellow-400/30">
                <Star className="w-3 h-3 fill-current mr-1" />
                {movie.rating.toFixed(1)}
              </Badge>
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-white border-white/30">
                <Calendar className="w-3 h-3 mr-1" />
                {movie.year}
              </Badge>
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-white border-white/30">
                <Clock className="w-3 h-3 mr-1" />
                {Math.floor(movie.runtime / 60)}j {movie.runtime % 60}m
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white leading-tight">
              {movie.title}
            </h1>

            {/* Genres */}
            <div className="flex items-center gap-2 flex-wrap">
              {movie.genres.map((genre: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-black/40 backdrop-blur-sm text-white border-white/30 text-xs"
                >
                  {genre}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handlePlay}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" fill="currentColor" />
                Tonton Sekarang
              </Button>
              
              <Button
                variant="outline"
                onClick={handleWatchlistToggle}
                className="h-12 px-4 bg-black/40 backdrop-blur-sm border-white/30 text-white hover:bg-white/10 rounded-xl"
              >
                {movie.isInWatchlist ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </Button>
              
              
            </div>
          </div>

          {/* Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </section>

        {/* Content Sections */}
        <div className="px-4 space-y-8">
          {/* Synopsis */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold">Sinopsis</h2>
            <div className="space-y-2">
              <p className={cn(
                "text-muted-foreground leading-relaxed",
                !showFullOverview && "line-clamp-3"
              )}>
                {movie.overview}
              </p>
              {movie.overview.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullOverview(!showFullOverview)}
                  className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                >
                  {showFullOverview ? 'Sembunyikan' : 'Selengkapnya'}
                </Button>
              )}
            </div>
          </section>

          {/* Cast */}
          {movie.cast.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold">Pemeran</h2>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {movie.cast.map((actor: { id: string; name: string; character: string; profilePath?: string }) => (
                  <div key={actor.id} className="flex-shrink-0 text-center space-y-2 w-20">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted mx-auto">
                      {actor.profilePath ? (
                        <img
                          src={actor.profilePath}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <span className="text-xs text-muted-foreground">
                            {actor.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium line-clamp-2 leading-tight">
                        {actor.name}
                      </p>
                      <p className="text-2xs text-muted-foreground line-clamp-2 leading-tight">
                        {actor.character}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Similar Movies */}
          {movie.similar.length > 0 && (
            <CarouselRow
              title="Film Serupa"
              items={movie.similar}
              onItemClick={(item) => handleSimilarItemClick(item as { type: 'movie' | 'tv'; id: string })}
              showViewAll={false}
            />
          )}
        </div>
      </div>
    </DetailLayout>
  );
};
