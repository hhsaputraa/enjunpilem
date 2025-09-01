'use client';

import React, { ReactNode } from 'react';
import { ArrowLeft, Cast, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title?: string;
  showBackButton?: boolean;
  actions?: ReactNode;
  className?: string;
  transparent?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  showBackButton = false,
  actions,
  className,
  transparent = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full",
      "flex items-center justify-between",
      "h-14 px-4 pt-safe-top",
      transparent 
        ? "bg-transparent" 
        : "bg-background/80 backdrop-blur-xl border-b border-border/50",
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-2 flex-1">
        {showBackButton ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-10 w-10 rounded-full"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              EnjunPilem
            </span>
          </div>
        )}
        
        {title && (
          <h1 className="font-semibold text-lg truncate ml-2">
            {title}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1">
        {actions || (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full"
              aria-label="Cast"
            >
              <Cast className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full relative"
              aria-label="Notifikasi"
            >
              <Bell className="h-5 w-5" />
              <div className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></div>
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

// Header variants
export const TransparentHeader: React.FC<Omit<MobileHeaderProps, 'transparent'>> = (props) => (
  <MobileHeader {...props} transparent />
);

export const SearchHeader: React.FC<{ onSearchFocus?: () => void }> = ({ onSearchFocus }) => (
  <MobileHeader
    actions={
      <Button
        variant="ghost"
        size="sm"
        onClick={onSearchFocus}
        className="text-muted-foreground"
      >
        Cari film...
      </Button>
    }
  />
);
