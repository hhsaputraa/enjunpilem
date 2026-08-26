import React, { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Film,
  Zap,
  Smile,
  Flame,
  Ghost,
  Heart,
  Rocket,
  Palette,
  Wand2,
  Compass,
  ShieldAlert,
  Tv,
  Swords,
  BookOpen,
  Users,
  Baby,
  Search,
  Newspaper,
  Video,
  Sparkles,
  MessageSquare,
  Mic,
  Landmark,
  Sun
} from 'lucide-react';

interface Genre {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface GenreChipsProps {
  genres: Genre[];
  selectedGenres: string[];
  onGenreToggle: (genreId: string) => void;
  className?: string;
  multiSelect?: boolean;
}

const popularGenres: Genre[] = [
  { id: 'all', name: 'Semua', icon: Film },
  { id: '28', name: 'Action', icon: Zap },
  { id: '35', name: 'Comedy', icon: Smile },
  { id: '18', name: 'Drama', icon: Film },
  { id: '27', name: 'Horror', icon: Ghost },
  { id: '10749', name: 'Romance', icon: Heart },
  { id: '878', name: 'Sci-Fi', icon: Rocket },
  { id: '53', name: 'Thriller', icon: Flame },
  { id: '16', name: 'Animation', icon: Palette },
  { id: '14', name: 'Fantasy', icon: Wand2 },
  { id: '12', name: 'Adventure', icon: Compass },
  { id: '80', name: 'Crime', icon: ShieldAlert },
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
          const IconComponent = genre.icon;
          
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
                  "px-4 py-2 text-sm font-medium flex items-center gap-1.5",
                  "border transition-all duration-200",
                  "whitespace-nowrap",
                  selected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary hover:border-primary/50"
                )}
              >
                {IconComponent && (
                  <IconComponent className="w-3.5 h-3.5" />
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
    { id: 'all', name: 'Semua', icon: Tv },
    { id: '10759', name: 'Action & Adventure', icon: Swords },
    { id: '16', name: 'Animation', icon: Palette },
    { id: '35', name: 'Comedy', icon: Smile },
    { id: '80', name: 'Crime', icon: ShieldAlert },
    { id: '99', name: 'Documentary', icon: BookOpen },
    { id: '18', name: 'Drama', icon: Film },
    { id: '10751', name: 'Family', icon: Users },
    { id: '10762', name: 'Kids', icon: Baby },
    { id: '9648', name: 'Mystery', icon: Search },
    { id: '10763', name: 'News', icon: Newspaper },
    { id: '10764', name: 'Reality', icon: Video },
    { id: '10765', name: 'Sci-Fi & Fantasy', icon: Sparkles },
    { id: '10766', name: 'Soap', icon: MessageSquare },
    { id: '10767', name: 'Talk', icon: Mic },
    { id: '10768', name: 'War & Politics', icon: Landmark },
    { id: '37', name: 'Western', icon: Sun },
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
