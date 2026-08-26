'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../MobileLayout';
import { SearchBar } from '../SearchBar';
import { PosterCard } from '../PosterCard';
import { SearchResultsSkeleton } from '../Skeletons';
import { SearchError } from '../ErrorState';
import { NoSearchResults } from '../EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, X, RefreshCw, Bookmark, Check, Film, Tv, Flame } from 'lucide-react';
import { useSearch as useSearchAPI, useTrending, transformTMDBData } from '@/hooks/useMobileApi';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { cn } from '@/lib/utils';
import { TMDBMediaItem } from '@/types/tmdb';
import { CarouselItem } from '../CarouselRow';

interface SearchResult {
  id: string;
  title: string;
  poster: string;
  rating?: number;
  year?: string;
  type: 'movie' | 'tv';
  overview: string;
  isInWatchlist?: boolean;
}

// Fallback trending searches (jika API gagal)
const fallbackTrendingSearches = [
  'Spider-Man',
  'The Batman',
  'Stranger Things',
  'Wednesday',
  'Avatar',
  'Top Gun',
  'Black Panther',
  'Dune',
];

// Mock search results
const mockResults: SearchResult[] = Array.from({ length: 15 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Search Result ${i + 1}`,
  poster: `https://image.tmdb.org/t/p/w500/placeholder${i + 1}.jpg`,
  rating: 7.0 + Math.random() * 2,
  year: `${2020 + Math.floor(Math.random() * 4)}`,
  type: Math.random() > 0.5 ? 'movie' : 'tv',
  overview: `This is the overview for search result ${i + 1}. It contains some description about the content.`,
  isInWatchlist: Math.random() > 0.7,
}));

export const MobileSearch: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Watchlist hook
  const { isInWatchlist, toggleWatchlist } = useMobileWatchlist();

  // Use real TMDB search API
  const { data: searchResults, isLoading, error } = useSearchAPI(query, query.length > 2);

  // Use trending data for dynamic trending searches
  const { data: trendingData, isLoading: trendingLoading } = useTrending();

  // Transform TMDB data for mobile
  const results = searchResults ? transformTMDBData(searchResults) : [];

  // Extract trending titles for search suggestions
  const trendingSearches = React.useMemo(() => {
    // useTrending() returns { items: [...], totalPages } so we grab .items
    const items = Array.isArray(trendingData) ? trendingData : (trendingData as { items?: TMDBMediaItem[] } | null)?.items;
    if (items && items.length > 0) {
      return items
        .slice(0, 8)
        .map((item: TMDBMediaItem) => ({
          title: item.title || item.name || '',
          type: item.media_type || (item.title ? 'movie' : 'tv'),
          isMovie: item.media_type === 'movie' || !!item.title,
          isTrending: false,
        }))
        .filter((item: { title: string }) => item.title);
    }
    return fallbackTrendingSearches.map(title => ({
      title,
      type: 'mixed',
      isMovie: false,
      isTrending: true,
    }));
  }, [trendingData]);

  // Also show "updated from TMDB" info correctly
  const trendingItems = Array.isArray(trendingData) ? trendingData : (trendingData as { items?: TMDBMediaItem[] } | null)?.items;

  useEffect(() => {
    if (query.trim() && query.length > 2) {
      setHasSearched(true);
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 9)]);
      }
    } else {
      setHasSearched(false);
    }
  }, [query, recentSearches]);

  const handleItemClick = (item: CarouselItem) => {
    navigate(`/${item.type || 'movie'}/${item.id}`);
  };

  const handleTrendingClick = (term: string) => {
    setQuery(term);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const clearSearch = () => {
    setQuery('');
    setHasSearched(false);
  };

  return (
    <PageLayout
      title=""
      showBackButton={false}
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="px-4 pt-2">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={setQuery}
            autoFocus
            recentSearches={recentSearches}
          />
        </div>

        {/* Content */}
        {!query.trim() ? (
          // Empty state - show trending and recent
          <div className="space-y-6">
            {/* Trending Searches */}
            <section className="px-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Sedang Tren
                  {trendingLoading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  disabled={trendingLoading}
                >
                  <RefreshCw className={cn("h-3 w-3", trendingLoading && "animate-spin")} />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {trendingLoading ? (
                    // Loading skeleton untuk trending searches
                    Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-8 bg-secondary/50 rounded-md animate-pulse"
                        style={{ width: `${60 + Math.random() * 40}px` }}
                      />
                    ))
                  ) : (
                    trendingSearches.map((item: { title: string; type: string; isMovie: boolean; isTrending: boolean }, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrendingClick(item.title)}
                        className="h-8 text-sm bg-secondary/50 hover:bg-secondary transition-colors flex items-center gap-1.5 px-3"
                      >
                        {item.isTrending ? (
                          <Flame className="h-3.5 w-3.5 text-orange-400" />
                        ) : item.isMovie ? (
                          <Film className="h-3.5 w-3.5 text-blue-400" />
                        ) : (
                          <Tv className="h-3.5 w-3.5 text-purple-400" />
                        )}
                        <span className="truncate max-w-[120px]">{item.title}</span>
                      </Button>
                    ))
                  )}
                </div>

                {/* Info update terakhir */}
                {!trendingLoading && trendingItems && (
                  <p className="text-xs text-muted-foreground">
                    Diperbarui berdasarkan trending TMDB hari ini
                  </p>
                )}
              </div>
            </section>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <section className="px-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Pencarian Terakhir
                </h3>
                <div className="space-y-2">
                  {recentSearches.slice(0, 8).map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <button
                        onClick={() => handleRecentClick(term)}
                        className="flex-1 text-left text-sm"
                      >
                        {term}
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          // Search results
          <div className="space-y-4">
            {/* Search Info */}
            <div className="px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {isLoading ? 'Mencari...' : `Hasil untuk "${query}"`}
                </span>
                {!isLoading && results.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {results.length} hasil
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="text-xs text-muted-foreground"
              >
                Hapus
              </Button>
            </div>

            {/* Results */}
            {error ? (
              <SearchError
                query={query}
                onRetry={() => window.location.reload()}
              />
            ) : isLoading ? (
              <SearchResultsSkeleton />
            ) : results.length === 0 && hasSearched ? (
              <NoSearchResults
                query={query}
                onClear={clearSearch}
              />
            ) : (
              <div className="space-y-3 px-4">
                {results.map((item) => {
                  const inWatchlist = isInWatchlist(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card/50 hover:bg-card transition-colors cursor-pointer"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex-shrink-0">
                        <PosterCard
                          id={item.id}
                          title={item.title}
                          poster={item.poster}
                          rating={item.rating}
                          year={item.year}
                          type={item.type}
                          size="sm"
                          showOverlay={false}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-2xs px-1.5 py-0.5 flex items-center justify-center",
                              item.type === 'movie'
                                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            )}
                          >
                            {item.type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                          </Badge>
                          
                          {item.year && (
                            <span className="text-2xs text-muted-foreground">
                              {item.year}
                            </span>
                          )}
                          
                          {item.rating && (
                            <div className="flex items-center gap-1 text-2xs text-yellow-400">
                              <span>⭐</span>
                              <span>{item.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-2xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.overview}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist({
                            id: item.id,
                            title: item.title,
                            poster: item.poster,
                            rating: item.rating,
                            year: item.year,
                            type: item.type,
                          });
                        }}
                        className="flex-shrink-0 h-9 w-9 rounded-full bg-secondary/50 hover:bg-secondary text-foreground"
                        aria-label="Toggle Watchlist"
                      >
                        {inWatchlist ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};
