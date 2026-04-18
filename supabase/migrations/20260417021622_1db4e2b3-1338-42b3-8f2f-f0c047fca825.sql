ALTER TABLE public.collection_items ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Backfill existing rows: order by added_at within each collection
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY collection_id ORDER BY added_at ASC) - 1 AS rn
  FROM public.collection_items
)
UPDATE public.collection_items ci
SET sort_order = ordered.rn
FROM ordered
WHERE ci.id = ordered.id;

CREATE INDEX IF NOT EXISTS idx_collection_items_collection_sort
  ON public.collection_items (collection_id, sort_order);

-- Allow users to update sort_order on items in their own collections
CREATE POLICY "Users can update items in their collections"
ON public.collection_items
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.collections
  WHERE collections.id = collection_items.collection_id
    AND collections.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.collections
  WHERE collections.id = collection_items.collection_id
    AND collections.user_id = auth.uid()
));