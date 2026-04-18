-- 1. Add description column to collections
ALTER TABLE public.collections
ADD COLUMN IF NOT EXISTS description text;

-- 2. Allow PUBLIC (anon + authenticated) to read shared collections
CREATE POLICY "Anyone can view shared collections"
ON public.collections
FOR SELECT
TO anon, authenticated
USING (is_shared = true);

-- 3. Allow PUBLIC to read items of shared collections
CREATE POLICY "Anyone can view items of shared collections"
ON public.collection_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.collections
    WHERE collections.id = collection_items.collection_id
      AND collections.is_shared = true
  )
);

-- 4. Allow PUBLIC to read profiles (so we can show owner username on shared collections page)
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);