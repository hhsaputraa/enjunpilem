'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeLayout } from '../MobileLayout';
import { HeroSlider } from '../HeroSlider';
import {
  TrendingCarousel,
  NewReleasesCarousel,
  TopRatedCarousel,
  RecommendedCarousel,
  ContinueWatchingCarousel
} from '../CarouselRow';
import { HeroSkeleton, CarouselRowSkeleton } from '../Skeletons';
import { NetworkError } from '../ErrorState';
import { Button } from '@/components/ui/button';
import { Search, Bell } from 'lucide-react';
import { useMixedContent, transformTMDBData } from '@/hooks/useMobileApi';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';

// Real TMDB data will be loaded from API

export const MobileHome: React.FC = () => {
  const navigate = useNavigate();
  const { toggleWatchlist } = useMobileWatchlist();

  // Use real TMDB data
  const {
    trending,
    popularMovies,
    popularTV,
    topRatedMovies,
    nowPlaying,
    isLoading
  } = useMixedContent();

  // Transform data for mobile components
  const heroItems = trending.data ? transformTMDBData(trending.data.slice(0, 5)) : [];
  const trendingItems = trending.data ? transformTMDBData(trending.data.slice(0, 20)) : [];
  const newReleases = nowPlaying.data ? transformTMDBData(nowPlaying.data.slice(0, 20)) : [];
  const topRated = topRatedMovies.data ? transformTMDBData(topRatedMovies.data.slice(0, 20)) : [];
  const recommended = popularTV.data ? transformTMDBData(popularTV.data.slice(0, 20)) : [];
  const continueWatching: any[] = []; // Will be loaded from user's watch history

  // Check for errors
  const hasError = trending.error || popularMovies.error || popularTV.error || topRatedMovies.error;

  const handleItemClick = (item: any) => {
    navigate(`/${item.type}/${item.id}`);
  };

  const handleWatchlistToggle = (item: any) => {
    toggleWatchlist(item);
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handleViewAll = (category: string) => {
    navigate(`/explore?category=${category}`);
  };

  if (hasError) {
    return (
      <HomeLayout>
        <NetworkError onRetry={() => window.location.reload()} />
      </HomeLayout>
    );
  }

  return (
    <HomeLayout>
      <div className="space-y-6 pb-6">
        {/* Custom Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 pt-safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                EnjunPilem
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearch}
                className="h-10 w-10 rounded-full"
                aria-label="Cari"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-4">
          {isLoading ? (
            <HeroSkeleton />
          ) : (
            <HeroSlider
              items={heroItems}
              onItemClick={handleItemClick}
              onWatchlistToggle={handleWatchlistToggle}
            />
          )}
        </section>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <ContinueWatchingCarousel
            items={continueWatching}
            isLoading={isLoading}
            onItemClick={handleItemClick}
            onWatchlistToggle={handleWatchlistToggle}
          />
        )}

        {/* Trending */}
        <TrendingCarousel
          items={trendingItems}
          isLoading={isLoading}
          onItemClick={handleItemClick}
          onWatchlistToggle={handleWatchlistToggle}
          onViewAll={() => handleViewAll('trending')}
        />

        {/* New Releases */}
        <NewReleasesCarousel
          items={newReleases}
          isLoading={isLoading}
          onItemClick={handleItemClick}
          onWatchlistToggle={handleWatchlistToggle}
          onViewAll={() => handleViewAll('new')}
        />

        {/* Top Rated */}
        <TopRatedCarousel
          items={topRated}
          isLoading={isLoading}
          onItemClick={handleItemClick}
          onWatchlistToggle={handleWatchlistToggle}
          onViewAll={() => handleViewAll('top-rated')}
        />

        {/* Recommended */}
        {recommended.length > 0 && (
          <RecommendedCarousel
            items={recommended}
            isLoading={isLoading}
            onItemClick={handleItemClick}
            onWatchlistToggle={handleWatchlistToggle}
            onViewAll={() => handleViewAll('recommended')}
          />
        )}

        {/* Quick Actions */}
        <section className="px-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/explore')}
              className="h-14 flex flex-col gap-1 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20 hover:bg-primary/10"
            >
              <span className="text-lg">🎭</span>
              <span className="text-sm font-medium">Jelajahi</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/watchlist')}
              className="h-14 flex flex-col gap-1 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/20 hover:bg-blue-500/10"
            >
              <span className="text-lg">📚</span>
              <span className="text-sm font-medium">Watchlist</span>
            </Button>
          </div>
        </section>
      </div>
    </HomeLayout>
  );
};
