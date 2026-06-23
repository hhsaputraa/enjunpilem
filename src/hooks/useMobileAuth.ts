/**
 * useMobileAuth — Hook untuk aksi autentikasi (signIn, signOut, dll).
 * Membaca state user/loading dari AuthContext global (BUKAN membuat listener sendiri).
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToastHelpers } from '@/components/mobile/Toast';
import { useAuth } from '@/contexts/AuthContext';

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

export const useMobileAuth = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastHelpers();

  const signInWithGoogleIdToken = async (idToken: string) => {
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
      showSuccess('Berhasil masuk!', 'Selamat datang kembali');
      return { success: true };
    } catch (error) {
      const err = error as Error;
      showError('Gagal menyelesaikan otentikasi Google', err.message);
      return { success: false, error: err.message };
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      if (!emailOrUsername.includes('@')) {
        throw new Error('Masukkan alamat email yang valid');
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });
      if (error) throw error;
      showSuccess('Berhasil masuk!', 'Selamat datang kembali');
      return { success: true };
    } catch (error) {
      const err = error as Error;
      showError('Gagal masuk', err.message);
      return { success: false, error: err.message };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      if (!email.includes('@')) {
        throw new Error('Masukkan alamat email yang valid');
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;
      showSuccess('Akun berhasil dibuat!', 'Silakan cek email untuk verifikasi akun');
      return { success: true };
    } catch (error) {
      const err = error as Error;
      showError('Gagal membuat akun', err.message);
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      showSuccess('Berhasil keluar', 'Sampai jumpa lagi!');
      navigate('/');
      return { success: true };
    } catch (error) {
      const err = error as Error;
      showError('Gagal keluar', err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      showSuccess('Email reset password terkirim', 'Silakan cek email untuk reset password');
      return { success: true };
    } catch (error) {
      const err = error as Error;
      showError('Gagal reset password', err.message);
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const { error } = await supabase.auth.updateUser({ data: updates });
      if (error) throw error;
      showSuccess('Profil berhasil diperbarui');
      return { success: true };
    } catch (error) {
      const err = error as Error;
      showError('Gagal memperbarui profil', err.message);
      return { success: false, error: err.message };
    }
  };

  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    const meta = (user as unknown as { user_metadata?: { username?: string; full_name?: string } })?.user_metadata;
    return meta?.username || meta?.full_name || user.email.split('@')[0];
  };

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
    signInWithGoogleIdToken,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    getUserInitials,
    getUserDisplayName,
  };
};

// Hook for protected routes
export const useAuthGuard = (redirectTo: string = '/auth') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectTo, {
        state: { redirectTo: window.location.pathname },
      });
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading, isAuthenticated: !!user };
};

// Hook for guest-only routes (like auth page)
export const useGuestGuard = (redirectTo: string = '/') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading, isGuest: !user };
};
