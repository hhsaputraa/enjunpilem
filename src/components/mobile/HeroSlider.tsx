'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Star } from 'lucide-react';
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
  const [isUserInteracting, setIsUserInteracting] = useState(false);


  const [dragPx, setDragPx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);

  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const currentItem = items[currentIndex];

  const width = containerRef.current?.clientWidth ?? 0;
  const dragPct = width > 0 ? (dragPx / width) * 100 : 0;

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  const goToSlide = (index: number) => {
    if (index < 0 || index >= items.length) return;
    setCurrentIndex(index);
    setDragPx(0);
  };


  useEffect(() => {
    const onVisibility = () => setIsUserInteracting(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    clearTimer();
    if (!autoPlay || items.length <= 1 || isUserInteracting) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % items.length);
    }, autoPlayInterval);
    return () => clearTimer();
  }, [autoPlay, autoPlayInterval, items.length, isUserInteracting, currentIndex]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (items.length <= 1) return;
    isDragging.current = true;
    setIsUserInteracting(true);
    clearTimer();
    dragStartX.current = e.clientX;


    if (e.pointerType !== 'touch') {
      try {
        containerRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    setDragPx(e.clientX - dragStartX.current);
  };

  const finalizeSwipe = (pointerId?: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (pointerId !== undefined) {
      try {
        containerRef.current?.releasePointerCapture(pointerId);
      } catch {
        /* ignore */
      }
    }

    const thresholdPct = 12;
    const canPrev = currentIndex > 0;
    const canNext = currentIndex < items.length - 1;

    if (dragPct > thresholdPct && canPrev) goToSlide(currentIndex - 1);
    else if (dragPct < -thresholdPct && canNext) goToSlide(currentIndex + 1);
    else setDragPx(0);

    window.setTimeout(() => setIsUserInteracting(false), 250);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => finalizeSwipe(e.pointerId);
  const handlePointerLeave = () => isDragging.current && finalizeSwipe();
  const handlePointerCancel = () => isDragging.current && finalizeSwipe();

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (items.length <= 1) return;
    isDragging.current = true;
    setIsUserInteracting(true);
    clearTimer();
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    setDragPx(e.touches[0].clientX - dragStartX.current);
  };

  const handleTouchEnd = () => finalizeSwipe();


  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') goToSlide(Math.max(0, currentIndex - 1));
    if (e.key === 'ArrowRight') goToSlide(Math.min(items.length - 1, currentIndex + 1));
  };

  if (!currentItem) return null;

  const prevItem = currentIndex > 0 ? items[currentIndex - 1] : null;
  const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-[400px] rounded-2xl overflow-hidden select-none', className)}
      // Gunakan pan-y: biar scroll vertikal tetap jalan, tapi kita handle swipe horizontal
      style={{ touchAction: 'pan-y' }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured titles"
      aria-live="polite"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      // Pointer
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      // Touch fallback
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images */}
      <div className="absolute inset-0 overflow-hidden">
        {prevItem && (
          <img
            src={prevItem.backdrop}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `translateX(${-100 + dragPct / 3}%)`,
              opacity: dragPct <= 0 ? 0 : Math.max(0.3, Math.min(1, dragPct / 100)),
              transition: isDragging.current ? 'none' : 'all 600ms cubic-bezier(0.22,1,0.36,1)',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        )}

        <img
          src={currentItem.backdrop}
          alt={currentItem.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: `translateX(${dragPct}%)`,
            transition: isDragging.current ? 'none' : 'transform 600ms cubic-bezier(0.22,1,0.36,1)',
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            opacity: isImageLoaded ? 1 : 0,
          }}
          draggable={false}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onLoad={() => setIsImageLoaded(true)}
        />

        {nextItem && (
          <img
            src={nextItem.backdrop}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: `translateX(${100 + dragPct / 3}%)`,
              opacity: dragPct >= 0 ? 0 : Math.max(0.3, Math.min(1, -dragPct / 100)),
              transition: isDragging.current ? 'none' : 'all 600ms cubic-bezier(0.22,1,0.36,1)',
              pointerEvents: 'none',
              willChange: 'transform, opacity',
            }}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        )}

        {/* Gradient Overlays (pastikan tidak menghalangi pointer) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 pointer-events-none">
        <div className="space-y-4 max-w-[720px] pointer-events-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={cn(
                'bg-black/60 backdrop-blur-sm border-white/20',
                currentItem.type === 'movie'
                  ? 'text-blue-300 border-blue-400/30'
                  : 'text-purple-300 border-purple-400/30'
              )}
            >
              {currentItem.type === 'movie' ? '🎬 Film' : '📺 Serial'}
            </Badge>

            {typeof currentItem.rating === 'number' && (
              <Badge
                variant="secondary"
                className="bg-black/60 backdrop-blur-sm text-yellow-400 border-yellow-400/30 flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                {currentItem.rating.toFixed(1)}
              </Badge>
            )}

            {currentItem.year && (
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-sm text-white border-white/30">
                {currentItem.year}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight line-clamp-2">
            {currentItem.title}
          </h1>

          <p className="text-gray-200 text-sm leading-relaxed line-clamp-3 max-w-xl">
            {currentItem.overview}
          </p>
        </div>
      </div>

      {/* Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsUserInteracting(true);
                goToSlide(index);
                window.setTimeout(() => setIsUserInteracting(false), 250);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
};
