'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileVideoPlayerProps {
  movieId: string;
  movieTitle: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onClose?: () => void;
  className?: string;
}

export const MobileVideoPlayer: React.FC<MobileVideoPlayerProps> = ({
  movieId,
  movieTitle,
  type,
  season = 1,
  episode = 1,
  onClose,
  className,
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate VidSrc URL
  const getVideoUrl = () => {
    const baseUrl = 'https://vidsrc-embed.ru/embed';
    
    if (type === 'movie') {
      return `${baseUrl}/movie?tmdb=${movieId}`;
    } else {
      return `${baseUrl}/tv?tmdb=${movieId}&season=${season}&episode=${episode}`;
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <div 
      className={cn(
        "relative w-full bg-black overflow-hidden rounded-2xl border border-border/10 aspect-video shadow-2xl",
        className
      )}
    >
      {/* Floating Back & Title Bar */}
      <div className="absolute top-3 left-3 right-3 z-50 pointer-events-none flex items-center gap-2.5">
        <Button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto active:scale-95 transition-all shadow-lg"
          size="icon"
          variant="ghost"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 bg-black/60 border border-white/10 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center justify-between pointer-events-auto shadow-lg max-w-[85%] sm:max-w-[50%]">
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="text-white text-xs font-bold truncate leading-tight">
              {movieTitle}
            </h4>
            {type === 'tv' && (
              <p className="text-[10px] text-gray-300 font-medium">
                S{season} • E{episode}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0 bg-primary/20 border border-primary/30 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Streaming</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-white/80 text-xs font-medium tracking-wide">Menghubungkan server video...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-20 p-4">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-white font-bold">Gagal memuat pemutar video</p>
            <p className="text-xs text-gray-400 leading-relaxed">{error}</p>
            <Button 
              onClick={() => {
                setError(null);
                setIsLoading(true);
              }}
              variant="outline"
              className="text-white border-white/20 hover:bg-white hover:text-black rounded-xl text-xs"
            >
              Coba Hubungkan Kembali
            </Button>
          </div>
        </div>
      )}

      {/* Video Player IFrame */}
      <iframe
        src={getVideoUrl()}
        className="w-full h-full border-0 z-10"
        allowFullScreen
        scrolling="no"
        allow="autoplay; encrypted-media; picture-in-picture"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
