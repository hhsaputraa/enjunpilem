'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../MobileLayout';
import { ProfileSkeleton } from '../Skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Settings,
  Moon,
  Sun,
  Globe,
  Trash2,
  Info,
  LogOut,
  ChevronRight,
  Star,
  Heart,
  Clock,
  LogIn
} from 'lucide-react';
import { useMobileAuth } from '@/hooks/useMobileAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AvatarPicker } from '@/components/AvatarPicker';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToastHelpers } from '../Toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  stats: {
    watchlistCount: number;
    favoritesCount: number;
    watchedCount: number;
  };
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  badge?: string;
  destructive?: boolean;
  onClick?: () => void;
  onToggle?: (value: boolean) => void;
}

// Real user data will be loaded from Supabase

export const MobileProfile: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showInfo } = useToastHelpers();
  const { user: authUser, loading, signOut, getUserDisplayName, getUserInitials } = useMobileAuth();
  const { data: profile } = useUserProfile(authUser?.id);
  const avatarUrl = profile?.avatar_url || authUser?.avatar_url;
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState('id');
  const [notifications, setNotifications] = useState(true);

  // Stats riil dari Supabase
  const { data: watchlistCount = 0 } = useQuery({
    queryKey: ['profile-stats-watchlist', authUser?.id],
    queryFn: async () => {
      if (!authUser) return 0;
      const { count } = await supabase
        .from('watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);
      return count ?? 0;
    },
    enabled: !!authUser,
  });

  const { data: favoritesCount = 0 } = useQuery({
    queryKey: ['profile-stats-favorites', authUser?.id],
    queryFn: async () => {
      if (!authUser) return 0;
      const { count } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);
      return count ?? 0;
    },
    enabled: !!authUser,
  });

  const { data: watchedCount = 0 } = useQuery({
    queryKey: ['profile-stats-watched', authUser?.id],
    queryFn: async () => {
      if (!authUser) return 0;
      const { count } = await supabase
        .from('watch_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);
      return count ?? 0;
    },
    enabled: !!authUser,
  });

  const userStats = {
    watchlistCount,
    favoritesCount,
    watchedCount,
  };

  const settingItems: SettingItem[] = [
    {
      id: 'theme',
      label: 'Mode Gelap',
      description: 'Gunakan tema gelap untuk kenyamanan mata',
      icon: isDarkMode ? Moon : Sun,
      type: 'toggle',
      value: isDarkMode,
      onToggle: setIsDarkMode,
    },
    {
      id: 'language',
      label: 'Bahasa',
      description: language === 'id' ? 'Indonesia' : 'English',
      icon: Globe,
      type: 'navigation',
      onClick: () => {
        setLanguage(prev => prev === 'id' ? 'en' : 'id');
      },
    },
    {
      id: 'notifications',
      label: 'Notifikasi',
      description: 'Terima pemberitahuan konten baru',
      icon: Settings,
      type: 'toggle',
      value: notifications,
      onToggle: setNotifications,
    },
    {
      id: 'clear-cache',
      label: 'Hapus Cache',
      description: 'Bersihkan data sementara aplikasi',
      icon: Trash2,
      type: 'action',
      onClick: () => {
        queryClient.clear();
        showSuccess('Cache Dibersihkan', 'Data sementara aplikasi berhasil dibersihkan');
      },
    },
    {
      id: 'about',
      label: 'Tentang Aplikasi',
      description: 'Versi 2.0.0',
      icon: Info,
      type: 'action',
      onClick: () => {
        showInfo('EnjunPilem v2.0.0', 'Platform streaming film & serial TV favorit Anda.');
      },
    },
    {
      id: 'logout',
      label: 'Keluar',
      description: 'Keluar dari akun Anda',
      icon: LogOut,
      type: 'action',
      destructive: true,
      onClick: signOut,
    },
  ];

  const handleStatClick = (type: 'watchlist' | 'favorites' | 'watched') => {
    switch (type) {
      case 'watchlist':
        navigate('/watchlist');
        break;
      case 'favorites':
        navigate('/favorites');
        break;
      case 'watched':
        navigate('/history');
        break;
    }
  };

  if (loading) {
    return (
      <PageLayout title="Profil">
        <ProfileSkeleton />
      </PageLayout>
    );
  }

  if (!authUser) {
    return (
      <PageLayout title="Profil">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <User className="w-16 h-16 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Belum Login</h3>
          <p className="text-muted-foreground text-center">
            Silakan login untuk mengakses profil dan fitur lainnya
          </p>
          <Button onClick={() => navigate('/auth')}>
            Login Sekarang
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Profil"
      showBackButton={false}
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <section className="px-4 pt-4">
          <div className="text-center space-y-4">
            {/* Avatar — klik untuk ganti via picker */}
            <AvatarPicker
              userId={authUser.id}
              currentAvatarUrl={profile?.avatar_url}
              trigger={
                <button
                  type="button"
                  className="relative inline-block group"
                  aria-label="Ubah avatar"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-primary/30 group-hover:border-primary transition-colors">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={getUserDisplayName()}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary text-white text-2xl font-bold">
                        {getUserInitials()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-lg bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </div>
                </button>
              }
            />

            {/* User Info */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold">{getUserDisplayName()}</h2>
              <p className="text-muted-foreground text-sm">{authUser.email}</p>
              <p className="text-muted-foreground text-xs">
                Bergabung {new Date(authUser.created_at).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleStatClick('watchlist')}
              className="text-center p-4 rounded-xl bg-card/50 hover:bg-card transition-colors"
            >
              <div className="text-2xl font-bold text-primary mb-1">
                {userStats.watchlistCount}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Heart className="w-3 h-3" />
                Watchlist
              </div>
            </button>

            <button
              onClick={() => handleStatClick('favorites')}
              className="text-center p-4 rounded-xl bg-card/50 hover:bg-card transition-colors"
            >
              <div className="text-2xl font-bold text-yellow-500 mb-1">
                {userStats.favoritesCount}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Star className="w-3 h-3" />
                Favorit
              </div>
            </button>

            <button
              onClick={() => handleStatClick('watched')}
              className="text-center p-4 rounded-xl bg-card/50 hover:bg-card transition-colors"
            >
              <div className="text-2xl font-bold text-green-500 mb-1">
                {userStats.watchedCount}
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Ditonton
              </div>
            </button>
          </div>
        </section>

        {/* Settings */}
        <section className="px-4">
          <h3 className="text-lg font-semibold mb-4">Pengaturan</h3>
          <div className="space-y-2">
            {settingItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl bg-card/30 hover:bg-card/50 transition-colors",
                    item.type !== 'toggle' && "cursor-pointer"
                  )}
                  onClick={item.type === 'navigation' || item.type === 'action' ? item.onClick : undefined}
                >
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    item.destructive 
                      ? "bg-destructive/20 text-destructive" 
                      : "bg-primary/20 text-primary"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "font-medium text-sm",
                        item.destructive && "text-destructive"
                      )}>
                        {item.label}
                      </h4>
                      {item.badge && (
                        <Badge variant="secondary" className="text-2xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {item.type === 'toggle' ? (
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onToggle}
                      />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* App Info */}
        <section className="px-4 pb-8">
          <div className="text-center space-y-2 py-6 border-t border-border/50">
            <div className="text-sm font-medium">EnjunPilem</div>
            <div className="text-xs text-muted-foreground">
              Versi 2.0.0 • Build 2024.01
            </div>
            <div className="text-xs text-muted-foreground">
              Made with ❤️ for movie lovers
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};
