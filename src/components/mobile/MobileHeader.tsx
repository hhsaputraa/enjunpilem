'use client';

import React, { ReactNode } from 'react';
import { ArrowLeft, Cast, Bell, Search } from 'lucide-react';
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

    const handleSearch = () => {
    navigate('/search');
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 w-full",
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
                            onClick={handleSearch}
                            className="h-10 w-10 rounded-full"
                            aria-label="Cari"
                          >
                            <Search className="h-5 w-5" />
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
