/* eslint-disable react-refresh/only-export-components */
'use client';

import React, { useState } from 'react';
import { Play, Pause, X, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// Using regular img tag instead of next/image

interface MiniPlayerProps {
  className?: string;
}

interface PlayingContent {
  id: string;
  title: string;
  subtitle?: string;
  poster: string;
  isPlaying: boolean;
  progress: number; // 0-100
}

// Mock data - replace with actual player state
const mockContent: PlayingContent = {
  id: '1',
  title: 'Spider-Man: No Way Home',
  subtitle: '2021 • Action',
  poster: 'https://image.tmdb.org/t/p/w200/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
  isPlaying: true,
  progress: 45,
};

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ className }) => {
  const [content] = useState<PlayingContent>(mockContent);
  const [isVisible, setIsVisible] = useState(true);

  const handlePlayPause = () => {
    // Toggle play/pause logic
    console.log('Toggle play/pause');
  };

  const handleClose = () => {
    setIsVisible(false);
    // Stop playback logic
  };

  const handleExpand = () => {
    // Navigate to full player
    console.log('Expand to full player');
  };

  if (!isVisible || !content) return null;

  return (
    <div className={cn(
      "fixed bottom-16 left-0 right-0 z-40",
      "bg-card/95 backdrop-blur-xl",
      "border-t border-border/50",
      "pb-safe-bottom",
      className
    )}>
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${content.progress}%` }}
        />
      </div>

      <div className="flex items-center gap-3 p-3">
        {/* Poster */}
        <button
          onClick={handleExpand}
          className="relative flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted"
        >
          <img
            src={content.poster}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </button>

        {/* Content Info */}
        <button
          onClick={handleExpand}
          className="flex-1 text-left min-w-0"
        >
          <h4 className="font-medium text-sm truncate">
            {content.title}
          </h4>
          {content.subtitle && (
            <p className="text-xs text-muted-foreground truncate">
              {content.subtitle}
            </p>
          )}
        </button>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            className="h-10 w-10 rounded-full"
            aria-label={content.isPlaying ? 'Pause' : 'Play'}
          >
            {content.isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleExpand}
            className="h-10 w-10 rounded-full"
            aria-label="Expand player"
          >
            <ChevronUp className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-10 w-10 rounded-full"
            aria-label="Close player"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Hook for managing mini player state
export const useMiniPlayer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<PlayingContent | null>(null);

  const showMiniPlayer = (newContent: PlayingContent) => {
    setContent(newContent);
    setIsVisible(true);
  };

  const hideMiniPlayer = () => {
    setIsVisible(false);
    setContent(null);
  };

  const updateProgress = (progress: number) => {
    if (content) {
      setContent({ ...content, progress });
    }
  };

  const togglePlayPause = () => {
    if (content) {
      setContent({ ...content, isPlaying: !content.isPlaying });
    }
  };

  return {
    isVisible,
    content,
    showMiniPlayer,
    hideMiniPlayer,
    updateProgress,
    togglePlayPause,
  };
};
