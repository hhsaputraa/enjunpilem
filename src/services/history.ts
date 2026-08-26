import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

export type WatchHistoryRow = Database['public']['Tables']['watch_history']['Row'];

export const getWatchHistory = async (): Promise<WatchHistoryRow[]> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return [];

  const { data, error } = await supabase
    .from('watch_history')
    .select('*')
    .eq('user_id', session.session.user.id)
    .order('last_watched_at', { ascending: false });

  if (error) {
    console.error('Error fetching watch history:', error);
    return [];
  }
  return data || [];
};

export const addToWatchHistory = async (media: {
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  rating?: number | null;
  release_year?: string | null;
  season_number?: number | null;
  episode_number?: number | null;
  episode_name?: string | null;
}): Promise<WatchHistoryRow | null> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return null;

  const userId = session.session.user.id;

  const { data, error } = await supabase
    .from('watch_history')
    .upsert({
      user_id: userId,
      media_id: media.media_id,
      media_type: media.media_type,
      title: media.title,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      rating: media.rating,
      release_year: media.release_year,
      season_number: media.season_number,
      episode_number: media.episode_number,
      episode_name: media.episode_name,
      last_watched_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,media_id,media_type'
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to watch history:', error);
    return null;
  }
  return data;
};

export const deleteFromWatchHistory = async (id: string): Promise<boolean> => {
  const { data: session } = await supabase.auth.getSession();
  if (!session?.session?.user) return false;

  const { error } = await supabase
    .from('watch_history')
    .delete()
    .eq('id', id)
    .eq('user_id', session.session.user.id);

  if (error) {
    console.error('Error deleting from watch history:', error);
    return false;
  }
  return true;
};
