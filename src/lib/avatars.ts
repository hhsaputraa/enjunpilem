/**
 * Katalog avatar yang sudah disediakan admin di Supabase Storage bucket
 * `enjunpilem-avatar`. User hanya bisa MEMILIH dari daftar ini, tidak upload custom.
 *
 * Bucket sudah PUBLIC, jadi URL bisa dibuat langsung tanpa signed URL.
 */
import { supabase } from '@/integrations/supabase/client';

export const AVATAR_BUCKET = 'enjunpilem-avatar';

// Nama file persis seperti di bucket (case-sensitive, termasuk spasi & tanda kurung).
export const AVATAR_FILES: string[] = [
  'avataaars.png',
  'avataaars (1).png',
  'avataaars (2).png',
  'avataaars (3).png',
  'avataaars (4).png',
  'avataaars (5).png',
  'avataaars (6).png',
  'avataaars (7).png',
];

/**
 * Build URL publik untuk satu file avatar di bucket.
 * Hasil: https://<project>.supabase.co/storage/v1/object/public/enjunpilem-avatar/<file>
 */
export const getAvatarUrl = (fileName: string): string => {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
};

/** List lengkap dengan URL — siap di-render di picker. */
export const AVATAR_OPTIONS = AVATAR_FILES.map((file) => ({
  file,
  url: getAvatarUrl(file),
}));

/**
 * Fallback DiceBear untuk user yang belum memilih avatar.
 * Tetap dipakai supaya UI lama (shared films, dll) punya gambar deterministik.
 */
export const getFallbackAvatarUrl = (seed: string | null | undefined): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || 'guest')}`;
