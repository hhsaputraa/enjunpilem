'use client';

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, Search, Bookmark, User, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  protected?: boolean; // route yang butuh login
}

const baseNavItems: NavItem[] = [
  {
    id: 'home',
    label: 'Beranda',
    icon: Home,
    href: '/',
  },
  {
    id: 'explore',
    label: 'Jelajahi',
    icon: Compass,
    href: '/explore',
  },
  {
    id: 'search',
    label: 'Cari',
    icon: Search,
    href: '/search',
  },
  {
    id: 'watchlist',
    label: 'Pustaka',
    icon: Bookmark,
    href: '/watchlist',
    protected: true,
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: User,
    href: '/profile',
    // profile tidak di-protect agar bisa tampil "Belum Login" screen
  },
];

export const BottomNav: React.FC = () => {
  const { shouldShow } = useBottomNav();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!shouldShow) return null;

  // Buat navItems dinamis: icon Profil berubah jika belum login
  const navItems = baseNavItems.map(item => {
    if (item.id === 'profile' && !user) {
      return { ...item, label: 'Masuk', icon: LogIn };
    }
    return item;
  });

  const handleNavigation = (item: NavItem) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Redirect ke auth jika route protected dan belum login
    if (item.protected && !user) {
      navigate('/auth', { state: { redirectTo: item.href } });
      return;
    }

    navigate(item.href);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-background/95 backdrop-blur-xl",
      "border-t border-border/50",
      "pb-safe-bottom"
    )}>
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={cn(
                "flex flex-col items-center justify-center",
                "min-w-[44px] min-h-[44px]", // WCAG minimum touch target
                "flex-1 py-2 px-2",
                "transition-all duration-200 ease-out",
                "rounded-xl relative",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              
              {/* Icon container */}
              <div className={cn(
                "relative flex items-center justify-center",
                "w-6 h-6 mb-1",
                "transition-transform duration-200",
                active && "scale-110"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  active ? "stroke-2" : "stroke-1.5"
                )} />
                
                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <div className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-2xs font-medium rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-2xs font-medium leading-none",
                "transition-all duration-200",
                active ? "font-semibold" : "font-normal"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// Hook for managing bottom nav state
export const useBottomNav = () => {
  const location = useLocation();

  const shouldShowBottomNav = () => {
    const hiddenPaths = ['/auth', '/onboarding', '/watch/'];
    return !hiddenPaths.some(path => location.pathname.startsWith(path));
  };

  const getCurrentTab = () => {
    const currentItem = baseNavItems.find(item => {
      if (item.href === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(item.href);
    });

    return currentItem?.id || 'home';
  };

  return {
    shouldShow: shouldShowBottomNav(),
    currentTab: getCurrentTab(),
  };
};
