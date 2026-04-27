'use client';

import React, { ReactNode } from 'react';
import { MobileHeader } from './MobileHeader';
import { MiniPlayer } from './MiniPlayer';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
  showMiniPlayer?: boolean;
  headerTitle?: string;
  headerBackButton?: boolean;
  headerActions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showHeader = true,
  showBottomNav = true,
  showMiniPlayer = false,
  headerTitle,
  headerBackButton = false,
  headerActions,
  className,
  contentClassName,
}) => {
  return (
    <div className={cn(
      "min-h-dvh bg-background text-foreground",
      "flex flex-col relative",
      className
    )}>
      {/* Mobile Header */}
      {showHeader && (
        <MobileHeader
          title={headerTitle}
          showBackButton={headerBackButton}
          actions={headerActions}
        />
      )}

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 w-full flex flex-col",
        showHeader && "pt-14", // Prevent content from overlapping under fixed header
        showBottomNav && "pb-20", // Space for bottom nav
        showMiniPlayer && "pb-32", // Extra space for mini player
        contentClassName
      )}>
        <div className="pb-safe-bottom flex-1">
          {children}
        </div>
      </main>

      {/* Mini Player */}
      {showMiniPlayer && <MiniPlayer />}
    </div>
  );
};

// Layout variants for different pages
export const HomeLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <MobileLayout>
    {children}
  </MobileLayout>
);

export const PageLayout: React.FC<{ 
  children: ReactNode; 
  title: string;
  showBackButton?: boolean;
  actions?: ReactNode;
}> = ({ children, title, showBackButton = true, actions }) => (
  <MobileLayout
    headerTitle={title}
    headerBackButton={showBackButton}
    headerActions={actions}
  >
    {children}
  </MobileLayout>
);

export const DetailLayout: React.FC<{ 
  children: ReactNode;
  showMiniPlayer?: boolean;
}> = ({ children, showMiniPlayer = false }) => (
  <MobileLayout
    showHeader={false}
    showMiniPlayer={showMiniPlayer}
    contentClassName="pb-safe-bottom"
  >
    {children}
  </MobileLayout>
);
