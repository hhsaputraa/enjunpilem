
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CollectionPreview } from './CollectionPreview';

interface CollectionItem {
  id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path?: string;
}

interface CollectionCardProps {
  id: string;
  name: string;
  items: CollectionItem[];
  userId: string;
  onSelect: (id: string, name: string) => void;
}

export const CollectionCard = ({ id, name, items, userId, onSelect }: CollectionCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteCollection = useMutation({
    mutationFn: async (collectionId: string) => {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({ title: "Collection deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting collection",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{name}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteCollection.mutate(id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <CollectionPreview items={items} />

      <p className="text-sm text-muted-foreground mb-4">
        {items?.length || 0} items
      </p>
      
      <Button
        variant="secondary"
        className="w-full"
        onClick={() => onSelect(id, name)}
      >
        View Collection
      </Button>
    </div>
  );
};
