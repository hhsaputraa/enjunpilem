import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MovieCard } from '@/components/MovieCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trash2, Grid, List, GripVertical, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getImageUrl } from '@/services/tmdb';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';

interface CollectionDetailsProps {
  collectionId: string;
  collectionName: string;
  onBack: () => void;
}

interface CollectionItem {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  collection_id: string;
  sort_order: number;
  title: string | null;
  name: string | null;
  poster_path: string | null;
  overview: string | null;
  vote_average: number | null;
  release_date: string | null;
  first_air_date: string | null;
}

type ViewMode = 'grid' | 'list';

// ---------------- Sortable Grid Item ----------------
const SortableGridItem = ({
  item,
  onDelete,
}: {
  item: CollectionItem;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="relative">
        <MovieCard
          id={item.media_id}
          title={item.title || item.name || ''}
          posterPath={item.poster_path || ''}
          overview={item.overview || ''}
          mediaType={item.media_type}
          voteAverage={item.vote_average || 0}
          releaseDate={item.release_date || item.first_air_date || undefined}
        />
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 p-1.5 rounded-md bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10 hover:bg-background"
          onClick={(e) => e.preventDefault()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hover:bg-destructive/90 h-8 w-8"
          onClick={(e) => {
            e.preventDefault();
            onDelete(item.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// ---------------- Sortable List Item ----------------
const SortableListItem = ({
  item,
  onDelete,
}: {
  item: CollectionItem;
  onDelete: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto' as const,
  };

  const title = item.title || item.name || 'Untitled';
  const date = item.release_date || item.first_air_date || '';
  const year = date ? new Date(date).getFullYear() : '';
  const detailPath = `/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.media_id}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="p-2 rounded-md hover:bg-accent cursor-grab active:cursor-grabbing flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <Link to={detailPath} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
          {item.poster_path ? (
            <img
              src={getImageUrl(item.poster_path, 'w200')}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              No Image
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{title}</h3>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {year && <span>{year}</span>}
            <span className="uppercase text-xs px-1.5 py-0.5 rounded bg-muted">
              {item.media_type}
            </span>
            {item.vote_average ? (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {item.vote_average.toFixed(1)}
              </span>
            ) : null}
          </div>
          {item.overview && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
              {item.overview}
            </p>
          )}
        </div>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
        onClick={() => onDelete(item.id)}
        aria-label="Remove from collection"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// ---------------- Main Component ----------------
export const CollectionDetails = ({
  collectionId,
  collectionName,
  onBack,
}: CollectionDetailsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [localItems, setLocalItems] = useState<CollectionItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: items, isLoading } = useQuery({
    queryKey: ['collection-items', collectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .eq('collection_id', collectionId)
        .order('sort_order', { ascending: true })
        .order('added_at', { ascending: true });

      if (error) throw error;
      return (data || []) as CollectionItem[];
    },
  });

  // Sync server data to local state
  useEffect(() => {
    if (items) setLocalItems(items);
  }, [items]);

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('collection_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-items', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: 'Removed from collection' });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each item's sort_order
      const updates = orderedIds.map((id, index) =>
        supabase.from('collection_items').update({ sort_order: index }).eq('id', id)
      );
      const results = await Promise.all(updates);
      const firstError = results.find((r) => r.error);
      if (firstError?.error) throw firstError.error;
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to save order',
        description: error.message,
        variant: 'destructive',
      });
      // Revert on error
      if (items) setLocalItems(items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-items', collectionId] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localItems.findIndex((i) => i.id === active.id);
    const newIndex = localItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(newOrder); // optimistic
    reorderMutation.mutate(newOrder.map((i) => i.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold">{collectionName}</h2>
          {localItems.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({localItems.length} {localItems.length === 1 ? 'item' : 'items'})
            </span>
          )}
        </div>

        {localItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {localItems.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Tip: drag the <GripVertical className="inline h-3 w-3" /> handle to reorder.
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : localItems.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No items in this collection yet
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localItems.map((i) => i.id)}
            strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {localItems.map((item) => (
                  <SortableGridItem
                    key={item.id}
                    item={item}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {localItems.map((item) => (
                  <SortableListItem
                    key={item.id}
                    item={item}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};
