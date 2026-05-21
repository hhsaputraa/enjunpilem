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
import { Filter, Grid, List, Trash2, Star } from 'lucide-react';
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
        <div className="flex items-center gap-1.5">
          {isSelectionMode ? (
            <>
              <span className="text-xs font-semibold text-primary mr-1 bg-primary/10 px-2.5 py-1 rounded-full animate-pulse">
                {selectedItems.length} Terpilih
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBulkRemove}
                disabled={selectedItems.length === 0}
                className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-full px-3 text-sm font-medium"
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
                onClick={() => setIsSelectionMode(true)}
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
                title="Pilih Banyak"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
              >
                {viewMode === 'grid' ? <List className="h-4.5 w-4.5" /> : <Grid className="h-4.5 w-4.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "h-9 w-9 rounded-full transition-colors",
                  showFilters ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Filter className="h-4.5 w-4.5" />
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="px-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3.5 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-md">
              <div className="text-xl font-black text-primary tracking-tight">{getWatchlistStats().total}</div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Total</div>
            </div>
            <div className="text-center p-3.5 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-md">
              <div className="text-xl font-black text-blue-400 tracking-tight">{getWatchlistStats().movies}</div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Film</div>
            </div>
            <div className="text-center p-3.5 rounded-2xl bg-card/30 border border-border/30 backdrop-blur-md">
              <div className="text-xl font-black text-purple-400 tracking-tight">{getWatchlistStats().tvShows}</div>
              <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">Serial</div>
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
            <div className="px-4 py-2 space-y-3 bg-muted/20 border-y border-border/30">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Urutkan:</span>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy(option.value as SortOption)}
                      className={cn(
                        "h-8 text-xs rounded-full px-4 flex-shrink-0 transition-all",
                        sortBy === option.value 
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105" 
                          : "text-muted-foreground bg-card/50 hover:bg-card border-border/40"
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
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
            "relative transition-all duration-200 active:scale-[0.99]",
            isSelectionMode && selectedItems.includes(item.id) && "ring-2 ring-primary rounded-xl"
          )}
        >
          {viewMode === 'grid' ? (
            <PosterCard
              id={item.id}
              title={item.title}
              poster={item.poster}
              rating={item.rating}
              year={item.year}
              type={item.type}
              isInWatchlist={item.isInWatchlist}
              size="responsive"
              showOverlay={false}
              onClick={() => onItemClick(item)}
              onWatchlistToggle={onWatchlistToggle}
            />
          ) : (
            /* Premium List Card Row Layout */
            <div 
              onClick={() => onItemClick(item)}
              className="flex gap-4 p-3 rounded-2xl bg-card/40 border border-border/40 hover:bg-card/60 transition-colors cursor-pointer"
            >
              {/* Poster Image */}
              <div className="w-20 aspect-[2/3] rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/20">
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500">
                    🎬
                  </div>
                )}
              </div>

              {/* Text Info Column */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                      item.type === 'movie' 
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                        : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    )}>
                      {item.type === 'movie' ? 'Film' : 'TV'}
                    </span>
                    {item.year && (
                      <span className="text-xs text-muted-foreground">{item.year}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  {item.rating && item.rating > 0 ? (
                    <div className="flex items-center gap-1 text-xs font-semibold text-yellow-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{item.rating.toFixed(1)}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Action Buttons on the Right */}
              {!isSelectionMode && (
                <div className="flex items-center justify-center pl-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWatchlistToggle(item.id);
                    }}
                    className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
          
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
