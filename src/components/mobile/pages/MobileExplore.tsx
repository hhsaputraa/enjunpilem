'use client';

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout } from '../MobileLayout';
import { GenreChips, useGenreFilter } from '../GenreChips';
import { PosterCard } from '../PosterCard';
import { GridSkeleton } from '../Skeletons';
import { LoadError } from '../ErrorState';
import { NoSearchResults } from '../EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Grid, List } from 'lucide-react';
import { useExploreContent } from '@/hooks/useMobileApi';
import { cn } from '@/lib/utils';

interface ExploreItem {
  id: string;
  title: string;
  poster: string;
  rating?: number;
  year?: string;
  type: 'movie' | 'tv';
  isInWatchlist?: boolean;
}

type SortOption = 'popularity' | 'rating' | 'release_date' | 'title';
type ViewMode = 'grid' | 'list';

const sortOptions = [
  { value: 'popularity', label: 'Populer' },
  { value: 'rating', label: 'Rating' },
  { value: 'release_date', label: 'Terbaru' },
  { value: 'title', label: 'Judul' },
];

// Mock data
const mockItems: ExploreItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Movie Title ${i + 1}`,
  poster: `https://image.tmdb.org/t/p/w500/placeholder${i + 1}.jpg`,
  rating: 7.0 + Math.random() * 2,
  year: `${2020 + Math.floor(Math.random() * 4)}`,
  type: Math.random() > 0.5 ? 'movie' : 'tv',
  isInWatchlist: Math.random() > 0.7,
}));

export const MobileExplore: React.FC = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { selectedGenres, toggleGenre, hasActiveFilters, clearGenres } = useGenreFilter();

  // Use real TMDB data
  const { data: items = [], isLoading, error } = useExploreContent('all', undefined, sortBy, 1);

  const handleItemClick = (item: ExploreItem) => {
    navigate(`/${item.type}/${item.id}`);
  };

  const handleWatchlistToggle = (id: string) => {
    // TODO: Implement watchlist toggle with Supabase
    console.log('Toggle watchlist for:', id);
  };

  const handleLoadMore = () => {
    // TODO: Implement pagination
    console.log('Load more items');
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    clearGenres();
    setSortBy('popularity');
  };

  return (
    <PageLayout
      title="Jelajahi"
      showBackButton={false}
      actions={
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="h-9 w-9 rounded-full"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="h-9 w-9 rounded-full relative"
          >
            <Filter className="h-4 w-4" />
            {hasActiveFilters && (
              <div className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className={cn(
          "space-y-4 transition-all duration-300",
          showFilters ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        )}>
          {/* Genre Filter */}
          <GenreChips
            genres={[]}
            selectedGenres={selectedGenres}
            onGenreToggle={toggleGenre}
          />

          {/* Sort & Clear */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Urutkan:</span>
              <div className="flex gap-1">
                {sortOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSortChange(option.value as SortOption)}
                    className="h-8 text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground"
              >
                Hapus Filter
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="px-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Filter aktif:</span>
              <Badge variant="secondary" className="text-xs">
                {selectedGenres.length} genre
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {sortOptions.find(opt => opt.value === sortBy)?.label}
              </Badge>
            </div>
          </div>
        )}

        {/* Content */}
        {error ? (
          <LoadError onRetry={() => window.location.reload()} resource="konten" />
        ) : items.length === 0 && !isLoading ? (
          <NoSearchResults
            query="filter yang dipilih"
            onClear={handleClearFilters}
          />
        ) : (
          <>
            {/* Items Grid */}
            <div className={cn(
              "px-4",
              viewMode === 'grid' 
                ? "grid grid-cols-2 gap-4" 
                : "space-y-4"
            )}>
              {items.map((item) => (
                <PosterCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  poster={item.poster}
                  rating={item.rating}
                  year={item.year}
                  type={item.type}
                  isInWatchlist={item.isInWatchlist}
                  size={viewMode === 'grid' ? 'md' : 'sm'}
                  showOverlay={viewMode === 'grid'}
                  onClick={() => handleItemClick(item)}
                  onWatchlistToggle={handleWatchlistToggle}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              ))}
            </div>

            {/* Loading More */}
            {isLoading && (
              <GridSkeleton itemCount={6} columns={viewMode === 'grid' ? 2 : 2} />
            )}

            {/* Load More Button - TODO: Implement pagination */}
            {!isLoading && items.length > 0 && items.length >= 20 && (
              <div className="px-4 pt-4">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="w-full h-12"
                >
                  Muat Lebih Banyak
                </Button>
              </div>
            )}

            {/* End of Results */}
            {items.length > 0 && items.length < 20 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Menampilkan semua hasil
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};
