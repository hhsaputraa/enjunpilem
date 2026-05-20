import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HomeLayout } from '../MobileLayout';
import { HeroSlider } from '../HeroSlider';
import { CarouselRow } from '../CarouselRow';
import { MobileAutoCarouselRow } from '../MobileAutoCarouselRow';
import { HeroSkeleton, CarouselRowSkeleton } from '../Skeletons';
import { NetworkError } from '../ErrorState';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useMixedContent, transformTMDBData } from '@/hooks/useMobileApi';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { getEnjunTop } from '@/services/tmdb';
import { COLLECTIONS } from '@/config/collections';

export const MobileHome: React.FC = () => {
  const navigate = useNavigate();
  const { toggleWatchlist } = useMobileWatchlist();

  // Pisah: hero hanya butuh trending — jangan blok render karena popular/TV belum selesai
  const {
    trending,
    popularMovies,
    isLoading,
    isHeroLoading,
  } = useMixedContent();

  // Priority 2: Defer below-fold content until hero loads
  const { data: enjunTopData, isLoading: enjunTopLoading } = useQuery({
    queryKey: ['enjunTop'],
    queryFn: getEnjunTop,
    staleTime: 10 * 60 * 1000,
    enabled: !isHeroLoading, // Cukup tunggu hero, bukan semua content
  });

  // Transform data for mobile
  const heroItems = trending.data ? transformTMDBData(trending.data.slice(0, 5)) : [];
  const trendingItems = trending.data ? transformTMDBData(trending.data) : [];
  const popularItems = popularMovies.data ? transformTMDBData(popularMovies.data) : [];
  const enjunTopItems = enjunTopData ? transformTMDBData(enjunTopData) : [];

  const hasError = trending.error || popularMovies.error;

  const handleItemClick = (item: any) => {
    navigate(`/${item.type}/${item.id}`);
  };

  const handleWatchlistToggle = (item: any) => {
    toggleWatchlist(item);
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handleViewAllCollection = (collectionId: string) => {
    navigate(`/detail-list-collection?queryKey=${collectionId}`);
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
      <div className="space-y-6 pb-6 w-full">
        {/* Hero Section — ALWAYS render with fixed height to prevent layout shift and ensure LCP detection */}
        <section className="px-4">
          <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
            {isHeroLoading ? (
              <HeroSkeleton />
            ) : heroItems.length > 0 ? (
              <HeroSlider
                items={heroItems}
                onItemClick={handleItemClick}
                onWatchlistToggle={handleWatchlistToggle}
              />
            ) : (
              <HeroSkeleton />
            )}
          </div>
        </section>

        {/* Trending Now (ga pake lihat semua) */}
        <CarouselRow
          title="Trending Now"
          items={trendingItems}
          isLoading={isLoading}
          showViewAll={false}
          itemSize="md"
          onItemClick={handleItemClick}
          onWatchlistToggle={handleWatchlistToggle}
        />

        {/* Popular Movies (ga pake lihat semua) */}
        <CarouselRow
          title="Popular Movies"
          items={popularItems}
          isLoading={isLoading}
          showViewAll={false}
          itemSize="md"
          onItemClick={handleItemClick}
          onWatchlistToggle={handleWatchlistToggle}
        />

        {/* Top 4 Enjun */}
        <CarouselRow
          title="Top 4 Enjun"
          items={enjunTopItems}
          isLoading={enjunTopLoading}
          showViewAll={false}
          itemSize="md"
          onItemClick={handleItemClick}
          onWatchlistToggle={handleWatchlistToggle}
        />

        {/* Dynamic Collections dari config/collections.ts (pake lihat semua) */}
        {COLLECTIONS.map((collection) => (
          <MobileAutoCarouselRow
            key={collection.id}
            collection={collection}
            showViewAll={true}
            onViewAll={() => handleViewAllCollection(collection.id)}
            onItemClick={handleItemClick}
            onWatchlistToggle={handleWatchlistToggle}
          />
        ))}

        {/* Quick Actions (Keep these handy Mobile features) */}
        {/* min-h prevents layout shift — section always occupies same space */}
        <section className="px-4 pt-4 border-t border-white/5 mt-8 min-h-[90px]">
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
