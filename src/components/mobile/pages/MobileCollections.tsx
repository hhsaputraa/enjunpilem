import React, { useState, useMemo } from 'react';
import { PageLayout } from '../MobileLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMobileAuth } from '@/hooks/useMobileAuth';
import { CollectionDetails } from '@/components/CollectionDetails';
import { getImageUrl } from '@/services/tmdb';
import { Plus, Globe, Lock, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToastHelpers } from '../Toast';
import { GridSkeleton } from '../Skeletons';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export const MobileCollections: React.FC = () => {
  const { user } = useMobileAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastHelpers();
  
  const [selectedCollection, setSelectedCollection] = useState<{ id: string; name: string; description: string | null } | null>(null);
  
  // Drawer state for creating new collection
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionShared, setNewCollectionShared] = useState(false);

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('collections')
        .select(`
          id,
          name,
          description,
          is_shared,
          collection_items (
            id,
            media_id,
            media_type,
            title,
            name,
            poster_path
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createCollection = useMutation({
    mutationFn: async ({ name, description, is_shared }: { name: string; description: string; is_shared: boolean }) => {
      if (!user) throw new Error('Anda harus login');
      
      const { data, error } = await supabase
        .from('collections')
        .insert({ 
          name,
          description: description || null,
          is_shared,
          user_id: user.id 
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['shared-collections'] });
      showSuccess("Koleksi Dibuat!");
      setNewCollectionName('');
      setNewCollectionDescription('');
      setNewCollectionShared(false);
      setIsCreateDrawerOpen(false);
    },
    onError: (error: any) => {
      showError("Gagal membuat", error.message);
    },
  });

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      createCollection.mutate({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        is_shared: newCollectionShared,
      });
    }
  };

  // If a collection is selected, render its details inline
  if (selectedCollection) {
    return (
      <PageLayout title={selectedCollection.name}>
        <div className="flex-1 overflow-y-auto pb-24">
          <CollectionDetails
            collectionId={selectedCollection.id}
            collectionName={selectedCollection.name}
            description={selectedCollection.description}
            onBack={() => setSelectedCollection(null)}
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Koleksi" headerActions={
      <Drawer open={isCreateDrawerOpen} onOpenChange={setIsCreateDrawerOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="text-teal-400 hover:bg-white/10 hover:text-teal-300">
            <Plus className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-zinc-950 border-white/10 text-white">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">Koleksi Baru</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleCreateCollection} className="space-y-4 px-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-teal-400">Nama</label>
              <Input
                placeholder="Contoh: Film Sci-Fi Terbaik"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="bg-white/5 border-white/10 h-14 rounded-xl focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-teal-400">Deskripsi</label>
              <Textarea
                placeholder="Isi koleksi ini tentang apa?"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                className="bg-white/5 border-white/10 rounded-xl focus-visible:ring-teal-500 min-h-[90px] resize-none"
                maxLength={500}
              />
            </div>
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                {newCollectionShared ? (
                  <Globe className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold text-white">
                    {newCollectionShared ? 'Publik' : 'Pribadi'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {newCollectionShared
                      ? 'Fitur Shared Films bisa melihat koleksimu.'
                      : 'Hanya kamu yang bisa melihat koleksinya.'}
                  </p>
                </div>
              </div>
              <Switch
                checked={newCollectionShared}
                onCheckedChange={setNewCollectionShared}
                className="data-[state=checked]:bg-teal-500"
              />
            </div>
            <DrawerFooter className="px-0 pb-6 pt-4">
              <Button type="submit" className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl" disabled={!newCollectionName.trim() || createCollection.isPending}>
                {createCollection.isPending ? "Menyimpan..." : "Buat Koleksi"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    }>
      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4 pt-4">

        {isLoading ? (
           <div className="space-y-4">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
             ))}
           </div>
        ) : collections?.length === 0 ? (
          <div className="flex col-span-full flex-col items-center justify-center p-12 text-center h-[50vh]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <Plus className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Belum ada koleksi</h3>
            <p className="text-sm text-zinc-400 max-w-[250px]">
              Buat koleksi pertamamu dengan menekan tombol plus (+) di pojok atas.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {collections?.map((collection) => (
              <div
                key={collection.id}
                onClick={() => setSelectedCollection({ id: collection.id, name: collection.name, description: collection.description })}
                className="flex items-center gap-4 bg-zinc-900/40 border border-white/5 rounded-2xl p-3 cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 relative">
                  {collection.collection_items?.[0]?.poster_path ? (
                    <img 
                      src={getImageUrl(collection.collection_items[0].poster_path, 'w185')}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                  {/* Item count badge overlap */}
                  <div className="absolute -bottom-1 -right-1 bg-teal-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                    {collection.collection_items?.length || 0}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-white truncate">{collection.name}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                    {collection.description || 'Koleksi Film tanpa deskripsi.'}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <span
                       className={cn(
                         "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                         collection.is_shared
                           ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                           : "bg-white/5 text-white/50 border-white/10"
                       )}
                     >
                       {collection.is_shared ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                       {collection.is_shared ? 'Publik' : 'Pribadi'}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};
