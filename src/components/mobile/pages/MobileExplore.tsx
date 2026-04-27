'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '../MobileLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';
import { useExploreContent } from '@/hooks/useMobileApi';
import { useMobileWatchlist } from '@/hooks/useMobileWatchlist';
import { GridSkeleton } from '../Skeletons';
import { LoadError } from '../ErrorState';
import { cn } from '@/lib/utils';
import { PosterCard } from '../PosterCard';

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
  // Categories bersumber TMDB Genres
  const categories = [
    { id: '', name: 'Semua' },
    { id: '28', name: 'Aksi' },
    { id: '35', name: 'Komedi' },
    { id: '27', name: 'Horor' },
    { id: '12', name: 'Petualangan' },
    { id: '16', name: 'Animasi' },
    { id: '10749', name: 'Romantis' },
    { id: '878', name: 'Sci-Fi' }
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const { toggleWatchlist, isInWatchlist } = useMobileWatchlist();

  // Use real TMDB API discovery
  const { data: items = [], isLoading, error } = useExploreContent(
    'all', 
    activeCategory.id, 
    'popularity', 
    1
  );

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
    rootMargin: '0px 0px 0px 0px' 
  };

  const observer = new IntersectionObserver(([entry]) => {
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
    <MobileLayout
      showHeader={false}
    >
      <div className="relative pb-0">
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
          key={category.id || category.name}
          onClick={() => setActiveCategory(category)}
          className={cn(
            "flex-shrink-0 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
            activeCategory.name === category.name
              ? "text-foreground border-primary"
              : "text-muted-foreground border-transparent hover:text-foreground"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  </div>
</div>
      
      {/* Content List Array (Grid Layout) */}
      <div className="px-4 py-4">
        {error ? (
          <LoadError onRetry={() => window.location.reload()} resource="konten" />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
             {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="aspect-[2/3] bg-muted/60 rounded-xl animate-pulse" />
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {items.map((item) => (
              <PosterCard
                key={item.id}
                id={item.id}
                title={item.title}
                poster={item.poster}
                type={item.type}
                rating={item.rating}
                size="responsive"
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </MobileLayout>
  );
};
