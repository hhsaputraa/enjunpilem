'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../MobileLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { useExploreContent } from '@/hooks/useMobileApi';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { GridSkeleton } from '../Skeletons';
import { LoadError } from '../ErrorState';
import { cn } from '@/lib/utils';

// Interface untuk data yang sudah di-transform oleh formatContentForMobile
interface ExploreItem {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: string;
  type: 'movie' | 'tv';
  overview: string;
  isInWatchlist: boolean;
}

export const MobileExplore: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Umum');
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const { toggleWatchlist, isInWatchlist } = useMobileWatchlist();

  // Use real TMDB data (sudah di-transform oleh formatContentForMobile)
  const { data: items = [], isLoading, error } = useExploreContent('all', undefined, 'popularity', 1);

  // Categories untuk tab navigation
  const categories = ['Umum', 'Premium', 'Berjuang', 'Isekai', 'Fantasi', 'Aksi'];

  const handleItemClick = (item: ExploreItem) => {
    navigate(`/${item.type}/${item.id}`);
  };

  const handleWatchlistToggle = (item: ExploreItem) => {
    toggleWatchlist(item);
  };

  // Get first item for hero background
  const heroItem = items[0];
// GANTI useEffect LAMA ANDA DENGAN YANG INI
React.useEffect(() => {
  const sentinel = sentinelRef.current;
  if (!sentinel) return;

  const options = {
    root: null,
    threshold: 0,
    rootMargin: '-56px 0px 0px 0px' 
  };

  const observer = new IntersectionObserver(([entry]) => {
    // TAMBAHKAN BARIS DEBUG PERTAMA DI SINI
    console.log('OBSERVER FIRED!', { isIntersecting: entry.isIntersecting });
    
    setIsTabsSticky(!entry.isIntersecting);
  }, options);

  observer.observe(sentinel);

  return () => {
    if (sentinel) {
      observer.unobserve(sentinel);
    }
  };
}, []);

// TAMBAHKAN BARIS DEBUG KEDUA DI SINI, SEBELUM RETURN
console.log('COMPONENT RENDERED', { isTabsSticky });


  return (
    <PageLayout
      title=""
      showBackButton={false}
      className="pb-0"
    >
      <div className="relative -mx-4 -mt-4">
        {/* Hero Section dengan Background Dinamis */}
        <div className="relative h-64 bg-gradient-to-br from-teal-500 to-teal-600 overflow-hidden">
          {/* Background Image - Dinamis dari item pertama */}
          {heroItem && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-50"
              style={{
                backgroundImage: `url('${heroItem.backdrop || heroItem.poster}')`
              }}
            />
          )}

          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-white px-4">
            <div className="text-4xl font-bold mb-2">Jelajahi </div>
            <div className="text-lg font-medium mb-4">
              Film & TV Series
            </div>
            
          </div>
        </div>

        {/* Category Tabs - Sticky */}
        <div
  // Placeholder & Pemicu
  ref={sentinelRef}
  style={{ height: '53px' }}
>
  <div
    className={cn(
      "w-full bg-background transition-all duration-300",
      isTabsSticky
        ? "fixed top-[0px] -left-4 right-0 z-20 shadow-md"
        : "relative"
    )}
  >
    {/* BARU: BAGIAN HEADER (Hanya muncul saat sticky) */}
    {isTabsSticky && (
      <div className="relative flex h-14 items-center px-2">
        {/* Tombol Kembali di Kiri */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10  shrink-0 rounded-full"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <ArrowLeft className="h-5 w-5 ml-7" />
        </Button>

        {/* Judul di Tengah */}
        <div className="flex-1 text-center text-lg font-semibold">
          Jelajahi
        </div>

        {/* Elemen Kosong di Kanan (untuk menyeimbangkan tombol kembali agar judul pas di tengah) */}
        <div className="h-10 w-10 shrink-0" />
      </div>
    )}

    {/* BAGIAN TAB KATEGORI */}
    <div
      className={cn(
        "flex overflow-x-auto scrollbar-hide border-b px-4 py-3",
        // Saat sticky, tambahkan garis pemisah di atasnya
        isTabsSticky && "border-t"
      )}
    >
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={cn(
            "flex-shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
            activeCategory === category
              ? "text-foreground border-primary"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
</div>
      
      {/* Content List */}
      <div className="px-4 py-4 space-y-4">
        {error ? (
          <LoadError onRetry={() => window.location.reload()} resource="konten" />
        ) : isLoading ? (
          <GridSkeleton itemCount={6} columns={2} />
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              {/* Poster */}
              <div className="flex-shrink-0 w-16 h-20 rounded-md overflow-hidden bg-muted">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-poster.jpg';
                  }}
                />
              </div>

              {/* Content Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {item.title}
                </h3>

                {/* Rating and Year */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs px-2 py-0.5 h-auto">
                    ⭐ {item.rating.toFixed(1)}
                  </Badge>
                  {item.year && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 h-auto">
                      {item.year}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs px-2 py-0.5 h-auto">
                    {item.type === 'tv' ? 'TV Series' : 'Movie'}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {item.overview}
                </p>
              </div>

              {/* Bookmark Button */}
              <div className="flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWatchlistToggle(item);
                  }}
                >
                  {isInWatchlist(item.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </PageLayout>
  );
};
