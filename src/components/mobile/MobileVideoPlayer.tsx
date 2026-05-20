'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  ArrowLeft,
  Settings,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState([100]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (!showControls) return;

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  // Generate VidSrc URL
  const getVideoUrl = () => {
    const baseUrl = 'https://vidsrc-embed.ru/embed';
    
    if (type === 'movie') {
      return `${baseUrl}/movie?tmdb=${movieId}`;
    } else {
      return `${baseUrl}/tv?tmdb=${movieId}&season=${season}&episode=${episode}`;
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // Note: We can't control iframe video directly, this is just for UI state
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        // Lock orientation to landscape on mobile
        if (screen.orientation && screen.orientation.lock) {
          try {
            await screen.orientation.lock('landscape');
          } catch (e) {
            console.log('Orientation lock not supported');
          }
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        // Unlock orientation
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      }
      setIsFullscreen(!isFullscreen);
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleSkip = (seconds: number) => {
    // This would require postMessage communication with iframe
    console.log(`Skip ${seconds} seconds`);
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={cn(
        "relative w-full h-full bg-black",
        isFullscreen ? "fixed inset-0 z-[9999]" : "aspect-video",
        className
      )}
      onClick={showControlsTemporarily}
    >
      {/* Video Player */}
      <iframe
        ref={videoRef}
        src={getVideoUrl()}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError('Failed to load video');
          setIsLoading(false);
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-white text-sm">Memuat video...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white space-y-4">
            <p className="text-lg font-semibold">Gagal memuat video</p>
            <p className="text-sm text-gray-300">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Coba Lagi
            </Button>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60",
          "transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <div className="flex-1 mx-4">
            <h3 className="text-white font-semibold text-lg truncate">
              {movieTitle}
            </h3>
            {type === 'tv' && (
              <p className="text-gray-300 text-sm">
                Season {season} • Episode {episode}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>

        {/* Center Play/Pause */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlayPause}
            className="w-16 h-16 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              className="w-full"
              onValueChange={(value) => setCurrentTime(value[0])}
            />
            <div className="flex justify-between text-xs text-gray-300">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSkip(-10)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSkip(10)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <RotateCw className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMute}
                className="text-white hover:bg-white/20 rounded-full"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="text-white hover:bg-white/20 rounded-full"
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
