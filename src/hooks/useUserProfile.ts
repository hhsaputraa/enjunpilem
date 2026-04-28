/**
 * useUserProfile — Fetch profile (username + avatar_url) untuk satu user_id.
 * Digunakan oleh Navbar, MobileProfile, dan komponen lain yang butuh data
 * profil user yang sedang login.
 *
 * Untuk multi-user (mis. shared films), pakai query manual di komponen tsb
 * dengan query key `shared-collection-profiles` agar konsisten dengan
 * invalidation di AvatarPicker.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export const useUserProfile = (userId: string | undefined | null) => {
  return useQuery<UserProfileRow | null>({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', userId)
        .maybeSingle();
      if (error) throw error;
      return data as UserProfileRow | null;
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
};
