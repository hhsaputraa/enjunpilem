'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// Base skeleton component
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse bg-muted rounded", className)} />
);

// Hero skeleton
export const HeroSkeleton: React.FC = () => (
  <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-muted animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <div className="absolute bottom-6 left-6 right-6 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-3 mt-4">
        <Skeleton className="h-12 w-32 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>
    </div>
  </div>
);

// Carousel row skeleton
export const CarouselRowSkeleton: React.FC<{ itemCount?: number }> = ({ 
  itemCount = 6 
}) => (
  <div className="space-y-3">
    {/* Title skeleton */}
    <div className="flex items-center justify-between px-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-5 w-20" />
    </div>
    
    {/* Items skeleton */}
    <div className="flex gap-3 px-4 overflow-hidden">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="flex-shrink-0">
          <Skeleton className="w-32 h-48 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

// Grid skeleton
export const GridSkeleton: React.FC<{ 
  itemCount?: number;
  columns?: 2 | 3;
}> = ({ 
  itemCount = 12,
  columns = 2
}) => (
  <div className={cn(
    "grid gap-4 px-4",
    columns === 2 ? "grid-cols-2" : "grid-cols-3"
  )}>
    {Array.from({ length: itemCount }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className={cn(
          "w-full rounded-xl",
          columns === 2 ? "h-60" : "h-48"
        )} />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    ))}
  </div>
);

// Search results skeleton
export const SearchResultsSkeleton: React.FC = () => (
  <div className="space-y-4 px-4">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="flex gap-3">
        <Skeleton className="w-16 h-24 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Detail page skeleton
export const DetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Hero section */}
    <div className="relative h-[500px] bg-muted animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full bg-white/20" />
          <Skeleton className="h-6 w-12 rounded-full bg-white/20" />
          <Skeleton className="h-6 w-14 rounded-full bg-white/20" />
        </div>
        <Skeleton className="h-10 w-4/5 bg-white/20" />
        <Skeleton className="h-4 w-full bg-white/20" />
        <Skeleton className="h-4 w-3/4 bg-white/20" />
        <div className="flex gap-3 mt-6">
          <Skeleton className="h-14 w-36 rounded-xl bg-white/20" />
          <Skeleton className="h-14 w-32 rounded-xl bg-white/20" />
        </div>
      </div>
    </div>

    {/* Content sections */}
    <div className="px-4 space-y-8">
      {/* Synopsis */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Cast */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 text-center space-y-2">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Similar movies */}
      <CarouselRowSkeleton />
    </div>
  </div>
);

// Profile skeleton
export const ProfileSkeleton: React.FC = () => (
  <div className="space-y-6 px-4">
    {/* Header */}
    <div className="text-center space-y-4 py-8">
      <Skeleton className="w-24 h-24 rounded-full mx-auto" />
      <Skeleton className="h-6 w-32 mx-auto" />
      <Skeleton className="h-4 w-48 mx-auto" />
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="text-center space-y-2 p-4 rounded-xl bg-muted/50">
          <Skeleton className="h-8 w-12 mx-auto" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      ))}
    </div>

    {/* Menu items */}
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="w-4 h-4 ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

// Loading spinner
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ 
  size = 'md',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-muted border-t-primary",
      sizeClasses[size],
      className
    )} />
  );
};

// Full page loading
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = "Memuat..." 
}) => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <LoadingSpinner size="lg" />
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);
