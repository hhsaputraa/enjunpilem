
import { useRef, useEffect } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, Calendar } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold px-1">Seasons</h3>
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex space-x-2 p-1">
            {seasons.map((season) => (
              <Button
                key={season.id}
                variant={selectedSeason === season.season_number ? "default" : "outline"}
                className={cn(
                  "flex-shrink-0 min-w-[100px] h-auto flex flex-col items-center py-2 gap-1",
                  selectedSeason === season.season_number ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
                onClick={() => onSeasonChange(season.season_number)}
              >
                <span className="text-sm font-medium">Season {season.season_number}</span>
                <span className="text-xs opacity-70">{season.episode_count} Eps</span>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
           <h3 className="text-lg font-semibold">Episodes</h3>
           <span className="text-sm text-muted-foreground">{episodes?.length || 0} Episodes</span>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" ref={episodeListRef}>
            {episodes?.map((episode) => (
              <div 
                key={episode.id} 
                data-selected={selectedEpisode === episode.episode_number}
                className={cn(
                  "group relative rounded-lg overflow-hidden border bg-card transition-all duration-200 cursor-pointer hover:shadow-md",
                  selectedEpisode === episode.episode_number ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                )}
                onClick={() => onEpisodeChange(episode.episode_number)}
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {episode.still_path ? (
                    <img 
                      src={getResponsiveImageUrl(episode.still_path)} 
                      alt={episode.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                      <PlayCircle className="w-10 h-10 opacity-20" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white fill-white/20" />
                  </div>

                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                    {episode.runtime ? (
                       <>
                         <Clock className="w-3 h-3" />
                         <span>{episode.runtime}m</span>
                       </>
                    ) : (
                       <span>Ep {episode.episode_number}</span>
                    )}
                  </div>
                </div>
                
                <div className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={cn(
                        "font-medium leading-tight line-clamp-1",
                         selectedEpisode === episode.episode_number ? "text-primary" : ""
                    )}>
                      {selectedEpisode === episode.episode_number && <span className="mr-1.5 text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded">NOW</span>}
                      {episode.episode_number}. {episode.name}
                    </h4>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {episode.overview || "No description available."}
                  </p>
                  
                  <div className="flex items-center gap-2 pt-1">
                     <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        <Calendar className="w-3 h-3 mr-1" />
                        {episode.air_date ? new Date(episode.air_date).toLocaleDateString() : 'TBA'}
                     </Badge>
                     {episode.vote_average && (
                       <span className="text-[10px] text-muted-foreground">
                         ★ {episode.vote_average.toFixed(1)}
                       </span>
                     )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
