import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToastHelpers } from '@/components/mobile/Toast';

export interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

export const useMobileAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastHelpers();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user as User || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user as User || null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          showSuccess('Berhasil masuk!', 'Selamat datang kembali');
        } else if (event === 'SIGNED_OUT') {
          showSuccess('Berhasil keluar', 'Sampai jumpa lagi!');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [showSuccess]);

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      setLoading(true);

      // Check if input is email or username
      const isEmail = emailOrUsername.includes('@');
      let signinEmail = emailOrUsername;

      if (!isEmail) {
        // Find email based on username from user_profiles view
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile || !profile.email) throw new Error('Username tidak ditemukan');

        signinEmail = profile.email;
      }

      // Login using the email
      const { error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      showError('Gagal masuk', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setLoading(true);

      // Check if email is valid
      if (!email.includes('@')) {
        throw new Error('Masukkan alamat email yang valid');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      showSuccess(
        'Akun berhasil dibuat!',
        'Silakan cek email untuk verifikasi akun'
      );

      return { success: true };
    } catch (error: any) {
      showError('Gagal membuat akun', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      navigate('/');
      return { success: true };
    } catch (error: any) {
      showError('Gagal keluar', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      showSuccess(
        'Email reset password terkirim',
        'Silakan cek email untuk reset password'
      );

      return { success: true };
    } catch (error: any) {
      showError('Gagal reset password', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) throw error;

      showSuccess('Profil berhasil diperbarui');
      return { success: true };
    } catch (error: any) {
      showError('Gagal memperbarui profil', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'Guest';
    return user.username || user.email.split('@')[0];
  };

  return {
    user,
    loading,
    isAuthenticated,
    signIn,
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
  const { user, loading } = useMobileAuth();
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
  const { user, loading } = useMobileAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading, isGuest: !user };
};
