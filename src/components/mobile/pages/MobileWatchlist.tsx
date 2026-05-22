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
import { Filter, Grid, List, Trash2, Star, Plus, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { useMobileAuth } from '@/hooks/useMobileAuth';
import { cn } from '@/lib/utils';
import { useQueries } from '@tanstack/react-query';
import { getMovieDetails, getTVDetails } from '@/services/tmdb';
import { MobileCollections } from './MobileCollections';
import { MobileCollectionDetails } from './MobileCollectionDetails';

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
type LibraryTab = 'watchlist' | 'collections';

const sortOptions = [
  { value: 'added_date', label: 'Terbaru Ditambah' },
  { value: 'title', label: 'Judul' },
  { value: 'rating', label: 'Rating' },
  { value: 'release_date', label: 'Tahun Rilis' },
];

const ITEMS_PER_PAGE = 6;

export const MobileWatchlist: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useMobileAuth();
  const { watchlist, isLoading, error, bulkRemoveFromWatchlist, getWatchlistStats } = useMobileWatchlist();

  // Unified Pustaka states
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('watchlist');
  const [selectedCollection, setSelectedCollection] = useState<{ id: string; name: string; description: string | null } | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Watchlist specific states
  const [sortBy, setSortBy] = useState<SortOption>('added_date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Scroll to top on page change
  React.useEffect(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  if (loading) {
    return (
      <PageLayout title="Pustaka" showBackButton={false}>
        <div className="px-4 py-8">
          <GridSkeleton />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout title="Pustaka" showBackButton={false}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-teal-500/20 to-teal-500/5 flex items-center justify-center border border-teal-500/20 shadow-lg shadow-teal-500/5">
            <Lock className="w-8 h-8 text-teal-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-white">Akses Pustaka Terkunci</h3>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mx-auto">
              Silakan masuk ke akun Anda untuk menyinkronkan watchlist dan mengelola koleksi film pribadi Anda.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full max-w-[200px] h-12 bg-primary hover:bg-primary/80 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Login Sekarang
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Fetch details for all watchlist entries in parallel from TMDB
  const tmdbQueries = useQueries({
    queries: watchlist.map((item) => ({
      queryKey: ['tmdb-detail', item.media_type, item.tmdb_id],
      queryFn: () => item.media_type === 'movie' 
        ? getMovieDetails(item.tmdb_id!)
        : getTVDetails(item.tmdb_id!),
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!item.tmdb_id && libraryTab === 'watchlist',
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

  // Pagination calculation
  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE) || 1;
  const activePage = Math.min(currentPage, totalPages);
  
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = sortedItems.slice(startIndex, endIndex);

  const handleItemClick = (item: WatchlistItem) => {
    if (isSelectionMode) {
      toggleItemSelection(item.id);
    } else {
      navigate(`/${item.type}/${item.id}`);
    }
  };

  const handleWatchlistToggle = (id: string) => {
    bulkRemoveFromWatchlist([id]);
    // Adjust page if removing final item on a page
    if (paginatedItems.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
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
    
    // Auto-adjust page index
    const remainingCount = sortedItems.length - selectedItems.length;
    const newTotalPages = Math.ceil(remainingCount / ITEMS_PER_PAGE) || 1;
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  const handleExplore = () => {
    navigate('/explore');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as FilterTab);
    setCurrentPage(1); // Reset page on tab change
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setCurrentPage(1); // Reset page on sort change
  };

  if (error) {
    return (
      <PageLayout title="Pustaka">
        <LoadError onRetry={() => window.location.reload()} resource="watchlist" />
      </PageLayout>
    );
  }

  // If a collection details view is active, render it inline
  if (selectedCollection) {
    return (
      <PageLayout 
        title={selectedCollection.name}
        showBackButton={true}
        actions={
          <div className="w-9 h-9" /> // spacer to balance layout
        }
      >
        <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
          <MobileCollectionDetails
            collectionId={selectedCollection.id}
            collectionName={selectedCollection.name}
            description={selectedCollection.description}
            onBack={() => setSelectedCollection(null)}
          />
        </div>
      </PageLayout>
    );
  }

  // Define actions based on the active tab
  const getHeaderActions = () => {
    if (libraryTab === 'watchlist') {
      if (items.length === 0) return null;
      return (
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
      );
    } else {
      // Collections Tab Header Actions
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreateDrawerOpen(true)}
          className="text-teal-400 hover:bg-white/10 hover:text-teal-300 rounded-full h-9 w-9"
        >
          <Plus className="h-5.5 w-5.5" />
        </Button>
      );
    }
  };

  return (
    <PageLayout
      title="Pustaka"
      showBackButton={false}
      actions={getHeaderActions()}
    >
      <div className="space-y-4">
        {/* Dynamic Segmented Tab Switcher (Glassmorphic) */}
        <div className="px-4 pt-4">
          <div className="flex p-1 rounded-xl bg-card/40 border border-border/30 backdrop-blur-md relative overflow-hidden">
            <button
              onClick={() => setLibraryTab('watchlist')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 relative z-10 uppercase tracking-wider",
                libraryTab === 'watchlist' ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Watchlist
            </button>
            <button
              onClick={() => setLibraryTab('collections')}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 relative z-10 uppercase tracking-wider",
                libraryTab === 'collections' ? "text-primary-foreground" : "text-muted-foreground"
              )}
            >
              Koleksi
            </button>
            
            {/* Sliding Indicator */}
            <div 
              className={cn(
                "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-primary rounded-lg transition-all duration-300 ease-out shadow-sm shadow-primary/20",
                libraryTab === 'collections' ? "translate-x-full" : "translate-x-0"
              )}
            />
          </div>
        </div>

        {/* Tab Contents */}
        {libraryTab === 'watchlist' ? (
          <div className="space-y-4">
            {/* Watchlist Stats */}
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

            {/* Watchlist Filter & Sort Controls */}
            {!isPreparing && items.length === 0 ? (
              <EmptyWatchlist onExplore={handleExplore} />
            ) : (
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <div className="px-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">Semua</TabsTrigger>
                    <TabsTrigger value="movies">Film</TabsTrigger>
                    <TabsTrigger value="tv">Serial</TabsTrigger>
                  </TabsList>
                </div>

                {showFilters && (
                  <div className="px-4 py-2 mt-3 space-y-3 bg-muted/20 border-y border-border/30">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Urutkan:</span>
                      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                        {sortOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={sortBy === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSortChange(option.value as SortOption)}
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
                    items={paginatedItems}
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
                    items={paginatedItems}
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
                    items={paginatedItems}
                    isLoading={isPreparing}
                    viewMode={viewMode}
                    isSelectionMode={isSelectionMode}
                    selectedItems={selectedItems}
                    onItemClick={handleItemClick}
                    onWatchlistToggle={handleWatchlistToggle}
                  />
                </TabsContent>
              </Tabs>
            )}

            {/* Pagination Controls */}
            {!isPreparing && sortedItems.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 mt-2 pb-28">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={activePage === 1}
                  className="h-9 w-9 rounded-xl border-border/40 bg-card/40 text-foreground hover:bg-white/10 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </Button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Only show current page, first, last, and immediate neighbors to avoid overflow
                  if (
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    Math.abs(pageNum - activePage) <= 1
                  ) {
                    return (
                      <Button
                        key={pageNum}
                        variant={activePage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={cn(
                          "h-9 min-w-9 rounded-xl font-black transition-all duration-300",
                          activePage === pageNum
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                            : "border-border/40 bg-card/40 text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                  
                  // Render ellipses
                  if (
                    pageNum === 2 || 
                    pageNum === totalPages - 1
                  ) {
                    return (
                      <span key={pageNum} className="text-zinc-600 px-1 font-bold text-xs select-none">
                        •••
                      </span>
                    );
                  }
                  
                  return null;
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={activePage === totalPages}
                  className="h-9 w-9 rounded-xl border-border/40 bg-card/40 text-foreground hover:bg-white/10 disabled:opacity-20 transition-all"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Nested Collections Content */
          <MobileCollections 
            isNested={true} 
            isCreateDrawerOpen={isCreateDrawerOpen}
            setIsCreateDrawerOpen={setIsCreateDrawerOpen}
            onCollectionSelect={setSelectedCollection}
          />
        )}
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
