'use client';

import React, { useState, useEffect, useRef } from 'react';
// Using regular img tag instead of next/image
import { Play, Plus, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HeroItem {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  rating?: number;
  year?: string;
  type: 'movie' | 'tv';
  overview: string;
  isInWatchlist?: boolean;
}

interface HeroSliderProps {
  items: HeroItem[];
  onItemClick?: (item: HeroItem) => void;
  onWatchlistToggle?: (id: string) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  items,
  onItemClick,
  onWatchlistToggle,
  autoPlay = true,
  autoPlayInterval = 5000,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const currentItem = items[currentIndex];

  useEffect(() => {
    if (autoPlay && items.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, items.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsImageLoaded(false);
    
    // Reset auto-play timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      if (autoPlay && items.length > 1) {
        intervalRef.current = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % items.length);
        }, autoPlayInterval);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && currentIndex < items.length - 1) {
        goToSlide(currentIndex + 1);
      } else if (deltaX < 0 && currentIndex > 0) {
        goToSlide(currentIndex - 1);
      }
    }
  };

  if (!currentItem) return null;

  return (
    <div 
      className={cn("relative w-full h-[400px] rounded-2xl overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentItem.backdrop}
          alt={currentItem.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            isImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="secondary" 
              className={cn(
                "bg-black/60 backdrop-blur-sm border-white/20",
                currentItem.type === 'movie' 
                  ? "text-blue-300 border-blue-400/30" 
                  : "text-purple-300 border-purple-400/30"
              )}
            >
              {currentItem.type === 'movie' ? '🎬 Film' : '📺 Serial'}
            </Badge>
            
            {currentItem.rating && (
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-yellow-400 border-yellow-400/30">
                <Star className="w-3 h-3 fill-current mr-1" />
                {currentItem.rating.toFixed(1)}
              </Badge>
            )}
            
            {currentItem.year && (
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-white border-white/30">
                {currentItem.year}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2">
            {currentItem.title}
          </h1>

          {/* Overview */}
          <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 max-w-md">
            {currentItem.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => onItemClick?.(currentItem)}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              Tonton
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onWatchlistToggle?.(currentItem.id)}
              className="px-4 py-2.5 bg-black/40 backdrop-blur-sm border-white/30 text-white hover:bg-white/10 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Watchlist
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onItemClick?.(currentItem)}
              className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-white/10"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Loading State */}
      {!isImageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
