import React, { useState } from 'react';
import { PageLayout } from '../MobileLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMobileAuth } from '@/hooks/useMobileAuth';
import { MobileCollectionDetails } from './MobileCollectionDetails';
import { getImageUrl } from '@/services/tmdb';
import { Plus, Globe, Lock, FolderHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToastHelpers } from '../Toast';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface MobileCollectionsProps {
  isNested?: boolean;
  isCreateDrawerOpen?: boolean;
  setIsCreateDrawerOpen?: (open: boolean) => void;
  onCollectionSelect?: (collection: { id: string; name: string; description: string | null } | null) => void;
}

export const MobileCollections: React.FC<MobileCollectionsProps> = ({
  isNested = false,
  isCreateDrawerOpen = false,
  setIsCreateDrawerOpen,
  onCollectionSelect,
}) => {
  const { user } = useMobileAuth();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastHelpers();
  
  const [localSelectedCollection, setLocalSelectedCollection] = useState<{ id: string; name: string; description: string | null } | null>(null);
  
  // Drawer state for non-nested mode
  const [localIsCreateDrawerOpen, setLocalIsCreateDrawerOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [newCollectionShared, setNewCollectionShared] = useState(false);

  const openDrawer = isNested ? isCreateDrawerOpen : localIsCreateDrawerOpen;
  const setOpenDrawer = isNested ? setIsCreateDrawerOpen : setLocalIsCreateDrawerOpen;

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
      if (setOpenDrawer) setOpenDrawer(false);
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

  const handleSelectCollection = (collection: { id: string; name: string; description: string | null }) => {
    if (isNested && onCollectionSelect) {
      onCollectionSelect(collection);
    } else {
      setLocalSelectedCollection(collection);
    }
  };

  const handleBack = () => {
    if (isNested && onCollectionSelect) {
      onCollectionSelect(null);
    } else {
      setLocalSelectedCollection(null);
    }
  };

  const activeSelected = isNested ? null : localSelectedCollection;

  // If in non-nested mode and collection is selected, render details inline
  if (!isNested && activeSelected) {
    return (
      <PageLayout title={activeSelected.name}>
        <div className="flex-1 overflow-y-auto pb-24">
          <MobileCollectionDetails
            collectionId={activeSelected.id}
            collectionName={activeSelected.name}
            description={activeSelected.description}
            onBack={handleBack}
          />
        </div>
      </PageLayout>
    );
  }

  const listContent = (
    <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4 pt-4">
      {isLoading ? (
         <div className="space-y-4">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="h-28 rounded-2xl bg-card/40 border border-border/40 animate-pulse" />
           ))}
         </div>
      ) : collections?.length === 0 ? (
        <div className="flex col-span-full flex-col items-center justify-center p-12 text-center h-[50vh]">
          <div className="w-16 h-16 rounded-full bg-card/40 flex items-center justify-center mb-4 border border-border/50">
            <FolderHeart className="w-8 h-8 text-primary/40 animate-float" />
          </div>
          <h3 className="font-bold text-lg mb-2">Belum ada koleksi</h3>
          <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
            Buat koleksi pertamamu dengan menekan tombol tambah (+) di pojok atas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {collections?.map((collection) => {
            const items = collection.collection_items || [];
            
            return (
              <div
                key={collection.id}
                onClick={() => handleSelectCollection({ id: collection.id, name: collection.name, description: collection.description })}
                className="flex items-center gap-4 bg-card/40 border border-border/40 hover:bg-card/60 rounded-2xl p-3 cursor-pointer active:scale-[0.98] transition-all duration-300"
              >
                {/* Stacked Poster Collage Cover */}
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0 relative border border-border/30 shadow-inner">
                  {items.length > 0 ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      {items.slice(0, 3).map((item, index) => {
                        const posterUrl = getImageUrl(item.poster_path || '', 'w185');
                        return (
                          <img 
                            key={item.id}
                            src={posterUrl}
                            className={cn(
                              "absolute w-[80%] h-[90%] object-cover rounded-lg shadow-md border border-black/10 transition-all duration-300",
                              index === 0 && "z-10 translate-y-0 scale-100",
                              index === 1 && "z-0 -translate-x-2.5 -translate-y-1 rotate-[-6deg] opacity-70 scale-95",
                              index === 2 && "z-0 translate-x-2.5 -translate-y-1 rotate-[6deg] opacity-40 scale-90"
                            )}
                            alt=""
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <Plus className="w-5 h-5 text-muted-foreground/40" />
                  )}
                  {/* Item count badge overlap */}
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-md border border-black/35 shadow-sm scale-90">
                    {items.length}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base text-foreground truncate">{collection.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {collection.description || 'Koleksi Film tanpa deskripsi.'}
                  </p>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <span
                       className={cn(
                         "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                         collection.is_shared
                           ? "bg-primary/10 text-primary border-primary/20"
                           : "bg-muted text-muted-foreground border-border/50"
                       )}
                     >
                       {collection.is_shared ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                       {collection.is_shared ? 'Publik' : 'Pribadi'}
                     </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reusable Drawer for creation */}
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        {!isNested && (
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full h-9 w-9">
              <Plus className="h-6 w-6" />
            </Button>
          </DrawerTrigger>
        )}
        <DrawerContent className="bg-background/95 backdrop-blur-xl border-border/50 text-foreground">
          <DrawerHeader className="border-b border-border/30">
            <DrawerTitle className="text-lg font-bold text-center">Koleksi Baru</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleCreateCollection} className="space-y-4 px-4 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Nama Koleksi</label>
              <Input
                placeholder="Contoh: Film Sci-Fi Terbaik"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                className="bg-card/50 border-border/50 h-12 rounded-xl focus:ring-primary text-sm font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Deskripsi</label>
              <Textarea
                placeholder="Isi koleksi ini tentang apa?"
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                className="bg-card/50 border-border/50 rounded-xl focus-visible:ring-primary min-h-[90px] resize-none text-sm leading-relaxed"
                maxLength={500}
              />
            </div>
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-card/30 border border-border/40">
              <div className="flex items-start gap-3">
                {newCollectionShared ? (
                  <Globe className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {newCollectionShared ? 'Publik' : 'Pribadi'}
                  </p>
                  <p className="text-2xs text-muted-foreground mt-0.5 leading-relaxed">
                    {newCollectionShared
                      ? 'Fitur Shared Films bisa melihat koleksimu.'
                      : 'Hanya kamu yang bisa melihat koleksinya.'}
                  </p>
                </div>
              </div>
              <Switch
                checked={newCollectionShared}
                onCheckedChange={setNewCollectionShared}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <DrawerFooter className="px-0 pb-2 pt-4">
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20" disabled={!newCollectionName.trim() || createCollection.isPending}>
                {createCollection.isPending ? "Menyimpan..." : "Buat Koleksi"}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );

  if (isNested) {
    return listContent;
  }

  return (
    <PageLayout title="Koleksi">
      {listContent}
    </PageLayout>
  );
};
