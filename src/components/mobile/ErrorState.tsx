'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Wifi, Server, Lock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
  };
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
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
      <div className="mb-4 text-destructive">
        {icon}
      </div>
    )}
    
    <h3 className="text-lg font-semibold mb-2 text-destructive">
      {title}
    </h3>
    
    {description && (
      <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
    )}
    
    {action && (
      <Button 
        onClick={action.onClick}
        disabled={action.loading}
        className="px-6"
        variant="outline"
      >
        {action.loading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Memuat...
          </>
        ) : (
          action.label
        )}
      </Button>
    )}
  </div>
);

// Predefined error states
export const NetworkError: React.FC<{ 
  onRetry?: () => void;
  isRetrying?: boolean;
}> = ({ onRetry, isRetrying }) => (
  <ErrorState
    icon={<Wifi className="w-12 h-12" />}
    title="Koneksi Bermasalah"
    description="Tidak dapat terhubung ke server. Periksa koneksi internet kamu dan coba lagi."
    action={onRetry ? {
      label: "Coba Lagi",
      onClick: onRetry,
      loading: isRetrying
    } : undefined}
  />
);

export const ServerError: React.FC<{ 
  onRetry?: () => void;
  isRetrying?: boolean;
}> = ({ onRetry, isRetrying }) => (
  <ErrorState
    icon={<Server className="w-12 h-12" />}
    title="Server Error"
    description="Terjadi kesalahan pada server. Tim kami sedang memperbaikinya."
    action={onRetry ? {
      label: "Coba Lagi",
      onClick: onRetry,
      loading: isRetrying
    } : undefined}
  />
);

export const LoadError: React.FC<{ 
  onRetry?: () => void;
  isRetrying?: boolean;
  resource?: string;
}> = ({ onRetry, isRetrying, resource = "data" }) => (
  <ErrorState
    icon={<AlertTriangle className="w-12 h-12" />}
    title="Gagal Memuat"
    description={`Tidak dapat memuat ${resource}. Silakan coba lagi.`}
    action={onRetry ? {
      label: "Muat Ulang",
      onClick: onRetry,
      loading: isRetrying
    } : undefined}
  />
);

export const SearchError: React.FC<{ 
  onRetry?: () => void;
  isRetrying?: boolean;
  query?: string;
}> = ({ onRetry, isRetrying, query }) => (
  <ErrorState
    icon={<AlertTriangle className="w-12 h-12" />}
    title="Pencarian Gagal"
    description={query 
      ? `Tidak dapat mencari "${query}". Coba lagi atau gunakan kata kunci lain.`
      : "Terjadi kesalahan saat mencari. Silakan coba lagi."
    }
    action={onRetry ? {
      label: "Coba Lagi",
      onClick: onRetry,
      loading: isRetrying
    } : undefined}
  />
);

export const AuthError: React.FC<{ 
  onLogin?: () => void;
}> = ({ onLogin }) => (
  <ErrorState
    icon={<Lock className="w-12 h-12 text-muted-foreground/60 mb-2" />}
    title="Perlu Login"
    description="Kamu perlu login untuk mengakses fitur ini."
    action={onLogin ? {
      label: "Login Sekarang",
      onClick: onLogin
    } : undefined}
  />
);

export const NotFoundError: React.FC<{ 
  onGoHome?: () => void;
  resource?: string;
}> = ({ onGoHome, resource = "halaman" }) => (
  <ErrorState
    icon={<Search className="w-12 h-12 text-muted-foreground/60 mb-2" />}
    title="Tidak Ditemukan"
    description={`${resource} yang kamu cari tidak ditemukan atau sudah tidak tersedia.`}
    action={onGoHome ? {
      label: "Kembali ke Beranda",
      onClick: onGoHome
    } : undefined}
  />
);

export const RateLimitError: React.FC<{ 
  onRetry?: () => void;
  retryAfter?: number;
}> = ({ onRetry, retryAfter }) => (
  <ErrorState
    icon={<AlertTriangle className="w-12 h-12" />}
    title="Terlalu Banyak Permintaan"
    description={
      retryAfter 
        ? `Kamu melakukan terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`
        : "Kamu melakukan terlalu banyak permintaan. Tunggu sebentar dan coba lagi."
    }
    action={onRetry ? {
      label: "Coba Lagi",
      onClick: onRetry
    } : undefined}
  />
);

// Error boundary fallback
export const ErrorBoundaryFallback: React.FC<{
  error?: Error;
  onReset?: () => void;
}> = ({ error, onReset }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <ErrorState
      icon={<AlertTriangle className="w-16 h-16" />}
      title="Oops! Terjadi Kesalahan"
      description={
        process.env.NODE_ENV === 'development' && error
          ? error.message
          : "Terjadi kesalahan yang tidak terduga. Tim kami akan segera memperbaikinya."
      }
      action={onReset ? {
        label: "Muat Ulang Aplikasi",
        onClick: onReset
      } : undefined}
    />
  </div>
);

