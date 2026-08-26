/* eslint-disable react-refresh/only-export-components */
'use client';

import React, { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Genre {
  id: string;
  name: string;
  emoji?: string;
}

interface GenreChipsProps {
  genres: Genre[];
  selectedGenres: string[];
  onGenreToggle: (genreId: string) => void;
  className?: string;
  multiSelect?: boolean;
}

const popularGenres: Genre[] = [
  { id: 'all', name: 'Semua', emoji: '🎬' },
  { id: '28', name: 'Action', emoji: '💥' },
  { id: '35', name: 'Comedy', emoji: '😂' },
  { id: '18', name: 'Drama', emoji: '🎭' },
  { id: '27', name: 'Horror', emoji: '👻' },
  { id: '10749', name: 'Romance', emoji: '💕' },
  { id: '878', name: 'Sci-Fi', emoji: '🚀' },
  { id: '53', name: 'Thriller', emoji: '🔥' },
  { id: '16', name: 'Animation', emoji: '🎨' },
  { id: '14', name: 'Fantasy', emoji: '🧙' },
  { id: '12', name: 'Adventure', emoji: '🗺️' },
  { id: '80', name: 'Crime', emoji: '🕵️' },
];

export const GenreChips: React.FC<GenreChipsProps> = ({
  genres = popularGenres,
  selectedGenres,
  onGenreToggle,
  className,
  multiSelect = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleGenreClick = (genreId: string) => {
    if (!multiSelect && genreId !== 'all') {
      // Single select mode - clear others first
      onGenreToggle('all');
    }
    onGenreToggle(genreId);
  };

  const isSelected = (genreId: string) => {
    return selectedGenres.includes(genreId);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Scrollable chips container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-2 overflow-x-auto scrollbar-hide",
          "scroll-smooth snap-x snap-mandatory",
          "px-4 pb-1"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {genres.map((genre) => {
          const selected = isSelected(genre.id);
          
          return (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className={cn(
                "flex-shrink-0 snap-start",
                "transition-all duration-200 ease-out",
                "hover:scale-105 active:scale-95",
                "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
              )}
            >
              <Badge
                variant={selected ? "default" : "secondary"}
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  "border transition-all duration-200",
                  "whitespace-nowrap",
                  selected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary hover:border-primary/50"
                )}
              >
                {genre.emoji && (
                  <span className="mr-1.5">{genre.emoji}</span>
                )}
                {genre.name}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Selected count indicator */}
      {multiSelect && selectedGenres.length > 1 && (
        <div className="px-4">
          <p className="text-xs text-muted-foreground">
            {selectedGenres.length} genre dipilih
          </p>
        </div>
      )}
    </div>
  );
};

// Preset configurations
export const MovieGenreChips: React.FC<Omit<GenreChipsProps, 'genres'>> = (props) => (
  <GenreChips genres={popularGenres} {...props} />
);

export const TVGenreChips: React.FC<Omit<GenreChipsProps, 'genres'>> = (props) => {
  const tvGenres: Genre[] = [
    { id: 'all', name: 'Semua', emoji: '📺' },
    { id: '10759', name: 'Action & Adventure', emoji: '⚔️' },
    { id: '16', name: 'Animation', emoji: '🎨' },
    { id: '35', name: 'Comedy', emoji: '😂' },
    { id: '80', name: 'Crime', emoji: '🕵️' },
    { id: '99', name: 'Documentary', emoji: '📖' },
    { id: '18', name: 'Drama', emoji: '🎭' },
    { id: '10751', name: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { id: '10762', name: 'Kids', emoji: '🧸' },
    { id: '9648', name: 'Mystery', emoji: '🔍' },
    { id: '10763', name: 'News', emoji: '📰' },
    { id: '10764', name: 'Reality', emoji: '📹' },
    { id: '10765', name: 'Sci-Fi & Fantasy', emoji: '🌟' },
    { id: '10766', name: 'Soap', emoji: '💭' },
    { id: '10767', name: 'Talk', emoji: '🎤' },
    { id: '10768', name: 'War & Politics', emoji: '🏛️' },
    { id: '37', name: 'Western', emoji: '🤠' },
  ];
  
  return <GenreChips genres={tvGenres} {...props} />;
};

// Hook for managing genre state
export const useGenreFilter = (initialGenres: string[] = ['all']) => {
  const [selectedGenres, setSelectedGenres] = React.useState<string[]>(initialGenres);

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => {
      if (genreId === 'all') {
        return ['all'];
      }
      
      const withoutAll = prev.filter(id => id !== 'all');
      
      if (withoutAll.includes(genreId)) {
        const filtered = withoutAll.filter(id => id !== genreId);
        return filtered.length === 0 ? ['all'] : filtered;
      } else {
        return [...withoutAll, genreId];
      }
    });
  };

  const clearGenres = () => {
    setSelectedGenres(['all']);
  };

  const hasActiveFilters = () => {
    return !selectedGenres.includes('all') && selectedGenres.length > 0;
  };

  return {
    selectedGenres,
    toggleGenre,
    clearGenres,
    hasActiveFilters: hasActiveFilters(),
  };
};
