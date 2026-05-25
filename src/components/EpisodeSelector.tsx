
import React, { useRef, useEffect } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Calendar, ChevronRight } from 'lucide-react';
import { getResponsiveImageUrl } from '@/services/tmdb';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  episode_number: number;
  runtime?: number;
  vote_average?: number;
}

interface Season {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

interface EpisodeSelectorProps {
  seasons: Season[];
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
  episodes: Episode[];
  selectedEpisode: number;
  onEpisodeChange: (episode: number) => void;
  isLoading: boolean;
  coverImage?: string;
}

export const EpisodeSelector: React.FC<EpisodeSelectorProps> = ({
  seasons,
  selectedSeason,
  onSeasonChange,
  episodes,
  selectedEpisode,
  onEpisodeChange,
  isLoading,
}) => {
  const episodeListRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to selected episode when list changes or loads
  useEffect(() => {
    if (!isLoading && episodeListRef.current) {
        const selectedEl = episodeListRef.current.querySelector('[data-selected="true"]');
        if (selectedEl) {
            selectedEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }
  }, [isLoading, selectedEpisode, selectedSeason]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Seasons Navigation */}
      <div className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <h3 className="text-xl font-bold tracking-tight text-foreground/90">Seasons</h3>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {seasons.length} Seasons Available
          </span>
        </div>
        <ScrollArea className="w-full whitespace-nowrap pb-4">
          <div className="flex space-x-3 px-1">
            {seasons.map((season) => (
              <Button
                key={season.id}
                variant="ghost"
                className={cn(
                  "relative flex-shrink-0 h-auto rounded-xl px-6 py-3 transition-all duration-300 overflow-hidden group",
                  selectedSeason === season.season_number 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground" 
                    : "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50"
                )}
                onClick={() => onSeasonChange(season.season_number)}
              >
                <div className="flex flex-col items-start gap-1 z-10">
                  <span className={cn(
                    "text-sm font-bold uppercase tracking-wider",
                    selectedSeason === season.season_number ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                  )}>
                    Season {season.season_number}
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium",
                    selectedSeason === season.season_number ? "opacity-80" : "opacity-50"
                  )}>
                    {season.episode_count || '?'} Eps
                  </span>
                </div>
                {selectedSeason === season.season_number && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                )}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2.5" />
        </ScrollArea>
      </div>

      {/* Episodes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 border-b border-border/40 pb-4">
           <h3 className="text-xl font-bold tracking-tight">Episodes</h3>
           <Badge variant="outline" className="text-xs font-normal bg-background/50 backdrop-blur-sm">
              {episodes?.length || 0} Episodes
           </Badge>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <div className="space-y-2 px-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" ref={episodeListRef}>
            {episodes?.map((episode) => {
              const isSelected = selectedEpisode === episode.episode_number;
              return (
                <div 
                  key={episode.id} 
                  data-selected={isSelected}
                  className={cn(
                    "group relative flex flex-col gap-3 rounded-xl transition-all duration-300 cursor-pointer",
                    "hover:bg-accent/40 p-2 -m-2", // Expand clickable area slightly without breaking layout
                    isSelected ? "bg-accent/60" : ""
                  )}
                  onClick={() => onEpisodeChange(episode.episode_number)}
                >
                  {/* Thumbnail Container */}
                  <div className={cn(
                    "relative aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-sm",
                    "ring-offset-background transition-all duration-300",
                    isSelected ? "ring-2 ring-primary ring-offset-2 shadow-primary/20" : "group-hover:shadow-md"
                  )}>
                    {episode.still_path ? (
                      <img 
                        src={getResponsiveImageUrl(episode.still_path)} 
                        alt={episode.name}
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-500",
                          "group-hover:scale-110",
                          isSelected ? "scale-105" : ""
                        )}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                        <Play className="w-10 h-10 opacity-10" />
                      </div>
                    )}
                    
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Play Button Overlay */}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <div className={cn(
                        "rounded-full p-3 backdrop-blur-sm transition-all duration-300",
                        isSelected ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/40" : "bg-white/20 text-white hover:bg-primary hover:text-primary-foreground hover:scale-110"
                      )}>
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                    </div>

                    {/* Metadata Overlay (Duration/Episode Num) */}
                    <div className="absolute bottom-2 right-2 flex gap-2">
                       {episode.runtime && (
                         <div className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           <span>{episode.runtime}m</span>
                         </div>
                       )}
                       <div className="bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                         EP {episode.episode_number}
                       </div>
                    </div>
                    
                    {/* Now Playing Indicator */}
                    {isSelected && (
                       <div className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                          NOW PLAYING
                       </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-1.5 px-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className={cn(
                          "font-semibold text-sm leading-tight line-clamp-1 transition-colors",
                           isSelected ? "text-primary" : "group-hover:text-foreground/90"
                      )}>
                        {episode.episode_number}. {episode.name}
                      </h4>
                      {episode.vote_average && episode.vote_average > 0 && (
                        <div className="flex items-center text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded flex-shrink-0">
                           <span className="text-yellow-500 mr-1">★</span>
                           {episode.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed h-8">
                      {episode.overview || "No description available for this episode."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-1">
                       <div className="flex items-center text-[10px] text-muted-foreground/60">
                          <Calendar className="w-3 h-3 mr-1.5" />
                          {episode.air_date ? new Date(episode.air_date).toLocaleDateString(undefined, {
                             year: 'numeric',
                             month: 'short',
                             day: 'numeric'
                          }) : 'TBA'}
                       </div>
                       
                       <div className={cn(
                          "flex items-center text-[10px] font-medium transition-all duration-300",
                          isSelected ? "text-primary translate-x-0 opacity-100" : "text-muted-foreground -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                       )}>
                          Watch Now <ChevronRight className="w-3 h-3 ml-0.5" />
                       </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
