'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../MobileLayout';
import { PosterCard } from '../PosterCard';
import { GridSkeleton } from '../Skeletons';
import { EmptyWatchlist } from '../EmptyState';
import { LoadError } from '../ErrorState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Grid, List, Trash2 } from 'lucide-react';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { useMobileAuth } from '@/hooks/useMobileAuth';
import { cn } from '@/lib/utils';
import { useQueries } from '@tanstack/react-query';
import { getMovieDetails, getTVDetails } from '@/services/tmdb';

interface WatchlistItem {
  id: string;
  title: string;
  poster: string;
  rating?: number;
  year?: string;
  type: 'movie' | 'tv';
  addedAt: string;
  isInWatchlist: boolean;
}

type SortOption = 'added_date' | 'title' | 'rating' | 'release_date';
type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'movies' | 'tv';

const sortOptions = [
  { value: 'added_date', label: 'Terbaru Ditambah' },
  { value: 'title', label: 'Judul' },
  { value: 'rating', label: 'Rating' },
  { value: 'release_date', label: 'Tahun Rilis' },
];

export const MobileWatchlist: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useMobileAuth();
  const { watchlist, isLoading, error, bulkRemoveFromWatchlist, getWatchlistStats } = useMobileWatchlist();

  const [sortBy, setSortBy] = useState<SortOption>('added_date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Fetch details for all watchlist entries in parallel from TMDB
  const tmdbQueries = useQueries({
    queries: watchlist.map((item) => ({
      queryKey: ['tmdb-detail', item.media_type, item.tmdb_id],
      queryFn: () => item.media_type === 'movie' 
        ? getMovieDetails(item.tmdb_id!)
        : getTVDetails(item.tmdb_id!),
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!item.tmdb_id,
    }))
  });

  const isLoadingDetails = tmdbQueries.some(q => q.isLoading);
  const isPreparing = isLoading || isLoadingDetails;

  // Combine watchlist entries with their TMDB details
  const enrichedWatchlist = watchlist.map((item, index) => {
    const tmdbData = tmdbQueries[index]?.data;
    return {
      ...item,
      title: tmdbData?.title || tmdbData?.name || 'Unknown',
      poster_path: tmdbData?.poster_path,
      vote_average: tmdbData?.vote_average || 0,
      release_date: tmdbData?.release_date || tmdbData?.first_air_date || '',
    };
  });

  // Transform Supabase data to mobile format
  const transformWatchlistItem = (item: any) => ({
    id: item.tmdb_id,
    title: item.title,
    poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
    rating: item.vote_average,
    year: item.release_date ? new Date(item.release_date).getFullYear().toString() : '',
    type: item.media_type,
    addedAt: item.created_at,
    isInWatchlist: true,
  });

  const items = enrichedWatchlist.map(transformWatchlistItem);

  const filteredItems = items.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'movies') return item.type === 'movie';
    if (activeTab === 'tv') return item.type === 'tv';
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'added_date':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'release_date':
        return (b.year || '').localeCompare(a.year || '');
      default:
        return 0;
    }
  });

  const handleItemClick = (item: WatchlistItem) => {
    if (isSelectionMode) {
      toggleItemSelection(item.id);
    } else {
      navigate(`/${item.type}/${item.id}`);
    }
  };

  const handleWatchlistToggle = (id: string) => {
    // Remove from watchlist
    bulkRemoveFromWatchlist([id]);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleBulkRemove = () => {
    bulkRemoveFromWatchlist(selectedItems);
    setSelectedItems([]);
    setIsSelectionMode(false);
  };

  const handleExplore = () => {
    navigate('/explore');
  };

  if (error) {
    return (
      <PageLayout title="Watchlist">
        <LoadError onRetry={() => window.location.reload()} resource="watchlist" />
      </PageLayout>
    );
  }

  if (!isPreparing && items.length === 0) {
    return (
      <PageLayout title="Watchlist">
        <EmptyWatchlist onExplore={handleExplore} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Watchlist"
      showBackButton={false}
      actions={
        <div className="flex items-center gap-1">
          {isSelectionMode ? (
            <>
              <span className="text-sm text-muted-foreground mr-2">
                {selectedItems.length} dipilih
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkRemove}
                disabled={selectedItems.length === 0}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsSelectionMode(false);
                  setSelectedItems([]);
                }}
              >
                Batal
              </Button>
            </>
          ) : (
            <>
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
                className="h-9 w-9 rounded-full"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-card/50">
              <div className="text-2xl font-bold text-primary">{getWatchlistStats().total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-card/50">
              <div className="text-2xl font-bold text-blue-500">
                {getWatchlistStats().movies}
              </div>
              <div className="text-xs text-muted-foreground">Film</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-card/50">
              <div className="text-2xl font-bold text-purple-500">
                {getWatchlistStats().tvShows}
              </div>
              <div className="text-xs text-muted-foreground">Serial</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FilterTab)}>
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="movies">Film</TabsTrigger>
              <TabsTrigger value="tv">Serial</TabsTrigger>
            </TabsList>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="px-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Urutkan:</span>
                  <div className="flex gap-1">
                    {sortOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy(option.value as SortOption)}
                        className="h-8 text-xs"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSelectionMode(!isSelectionMode)}
                  className="text-xs"
                >
                  {isSelectionMode ? 'Batal Pilih' : 'Pilih Item'}
                </Button>
              </div>
            </div>
          )}

          <TabsContent value="all" className="mt-4">
            <WatchlistContent
              items={sortedItems}
              isLoading={isPreparing}
              viewMode={viewMode}
              isSelectionMode={isSelectionMode}
              selectedItems={selectedItems}
              onItemClick={handleItemClick}
              onWatchlistToggle={handleWatchlistToggle}
            />
          </TabsContent>

          <TabsContent value="movies" className="mt-4">
            <WatchlistContent
              items={sortedItems}
              isLoading={isPreparing}
              viewMode={viewMode}
              isSelectionMode={isSelectionMode}
              selectedItems={selectedItems}
              onItemClick={handleItemClick}
              onWatchlistToggle={handleWatchlistToggle}
            />
          </TabsContent>

          <TabsContent value="tv" className="mt-4">
            <WatchlistContent
              items={sortedItems}
              isLoading={isPreparing}
              viewMode={viewMode}
              isSelectionMode={isSelectionMode}
              selectedItems={selectedItems}
              onItemClick={handleItemClick}
              onWatchlistToggle={handleWatchlistToggle}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

// Separate component for watchlist content
const WatchlistContent: React.FC<{
  items: WatchlistItem[];
  isLoading: boolean;
  viewMode: ViewMode;
  isSelectionMode: boolean;
  selectedItems: string[];
  onItemClick: (item: WatchlistItem) => void;
  onWatchlistToggle: (id: string) => void;
}> = ({
  items,
  isLoading,
  viewMode,
  isSelectionMode,
  selectedItems,
  onItemClick,
  onWatchlistToggle,
}) => {
  if (isLoading) {
    return <GridSkeleton itemCount={6} columns={viewMode === 'grid' ? 2 : 3} />;
  }

  return (
    <div className={cn(
      "px-4",
      viewMode === 'grid' 
        ? "grid grid-cols-2 gap-4" 
        : "space-y-4"
    )}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "relative",
            isSelectionMode && selectedItems.includes(item.id) && "ring-2 ring-primary rounded-xl"
          )}
        >
          <PosterCard
            id={item.id}
            title={item.title}
            poster={item.poster}
            rating={item.rating}
            year={item.year}
            type={item.type}
            isInWatchlist={item.isInWatchlist}
            size={viewMode === 'grid' ? 'md' : 'sm'}
            showOverlay={!isSelectionMode}
            onClick={() => onItemClick(item)}
            onWatchlistToggle={onWatchlistToggle}
          />
          
          {isSelectionMode && (
            <div className="absolute top-2 left-2 z-10">
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                selectedItems.includes(item.id)
                  ? "bg-primary border-primary text-white"
                  : "bg-black/60 border-white/60"
              )}>
                {selectedItems.includes(item.id) && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
