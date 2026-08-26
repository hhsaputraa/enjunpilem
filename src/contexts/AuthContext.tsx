/* eslint-disable react-refresh/only-export-components */
/**
 * AuthContext — Satu-satunya sumber kebenaran status autentikasi di seluruh aplikasi.
 * Hanya ada SATU Supabase listener yang dipasang di sini, menghindari multiple listeners
 * yang bisa menyebabkan race condition atau memory leak.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil session awal
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user as AuthUser ?? null);
      setLoading(false);
    });

    // Satu listener global untuk semua perubahan auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user as AuthUser ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook utama untuk mengakses auth state.
 * Gunakan ini sebagai pengganti useMobileAuth() untuk membaca user/loading state.
 */
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
};
