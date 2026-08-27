import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, Bookmark, Heart, Sparkles, WifiOff, Wrench, Rocket } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div className={cn(
    "flex flex-col items-center justify-center text-center py-12 px-6",
    className
  )}>
    {icon && (
      <div className="mb-4 text-muted-foreground flex items-center justify-center">
        {icon}
      </div>
    )}
    
    <h3 className="text-lg font-semibold mb-2">
      {title}
    </h3>
    
    {description && (
      <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
    )}
    
    {action && (
      <Button onClick={action.onClick} className="px-6">
        {action.label}
      </Button>
    )}
  </div>
);

// Predefined empty states
export const NoSearchResults: React.FC<{ 
  query: string;
  onClear?: () => void;
}> = ({ query, onClear }) => (
  <EmptyState
    icon={<Search className="w-12 h-12 text-muted-foreground/60" />}
    title="Tidak Ada Hasil"
    description={`Tidak ditemukan hasil untuk "${query}". Coba kata kunci lain atau periksa ejaan.`}
    action={onClear ? {
      label: "Hapus Pencarian",
      onClick: onClear
    } : undefined}
  />
);

export const EmptyWatchlist: React.FC<{ 
  onExplore?: () => void;
}> = ({ onExplore }) => (
  <EmptyState
    icon={<Bookmark className="w-12 h-12 text-muted-foreground/60" />}
    title="Watchlist Kosong"
    description="Belum ada film atau serial TV di watchlist kamu. Mulai jelajahi dan tambahkan yang menarik!"
    action={onExplore ? {
      label: "Jelajahi Sekarang",
      onClick: onExplore
    } : undefined}
  />
);

export const EmptyFavorites: React.FC<{ 
  onExplore?: () => void;
}> = ({ onExplore }) => (
  <EmptyState
    icon={<Heart className="w-12 h-12 text-muted-foreground/60" />}
    title="Belum Ada Favorit"
    description="Tandai film dan serial TV favorit kamu untuk akses cepat di sini."
    action={onExplore ? {
      label: "Cari Favorit",
      onClick: onExplore
    } : undefined}
  />
);

export const NoRecommendations: React.FC<{ 
  onExplore?: () => void;
}> = ({ onExplore }) => (
  <EmptyState
    icon={<Sparkles className="w-12 h-12 text-muted-foreground/60" />}
    title="Belum Ada Rekomendasi"
    description="Tonton beberapa film atau serial TV dulu untuk mendapatkan rekomendasi personal."
    action={onExplore ? {
      label: "Mulai Menonton",
      onClick: onExplore
    } : undefined}
  />
);

export const OfflineState: React.FC<{ 
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <EmptyState
    icon={<WifiOff className="w-12 h-12 text-muted-foreground/60" />}
    title="Tidak Ada Koneksi"
    description="Periksa koneksi internet kamu dan coba lagi."
    action={onRetry ? {
      label: "Coba Lagi",
      onClick: onRetry
    } : undefined}
  />
);

export const MaintenanceState: React.FC = () => (
  <EmptyState
    icon={<Wrench className="w-12 h-12 text-muted-foreground/60" />}
    title="Sedang Maintenance"
    description="Kami sedang melakukan pemeliharaan sistem. Silakan coba lagi nanti."
  />
);

export const ComingSoon: React.FC<{ 
  feature?: string;
}> = ({ feature = "Fitur ini" }) => (
  <EmptyState
    icon={<Rocket className="w-12 h-12 text-muted-foreground/60" />}
    title="Segera Hadir"
    description={`${feature} akan segera tersedia. Nantikan update selanjutnya!`}
  />
);
