-- Create watch_history table if it does not exist
CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    media_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title TEXT NOT NULL,
    poster_path TEXT,
    backdrop_path TEXT,
    rating NUMERIC,
    release_year TEXT,
    progress_percent INTEGER DEFAULT 0,
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- TV series progress fields (optional)
    season_number INTEGER,
    episode_number INTEGER,
    episode_name TEXT,
    
    UNIQUE(user_id, media_id, media_type)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist
DROP POLICY IF EXISTS "Users can view their own watch history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can insert their own watch history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can update their own watch history" ON public.watch_history;
DROP POLICY IF EXISTS "Users can delete their own watch history" ON public.watch_history;

-- Create RLS policies
CREATE POLICY "Users can view their own watch history"
ON public.watch_history FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history"
ON public.watch_history FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history"
ON public.watch_history FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watch history"
ON public.watch_history FOR DELETE TO authenticated
USING (auth.uid() = user_id);
