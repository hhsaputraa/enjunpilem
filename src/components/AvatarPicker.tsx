/**
 * AvatarPicker — Dialog untuk memilih avatar dari katalog yang sudah disediakan
 * di Supabase Storage bucket `enjunpilem-avatar`. User tidak bisa upload custom.
 *
 * Setelah dipilih, `profiles.avatar_url` di-update dengan URL publik avatar tersebut.
 * Cache react-query untuk profile (di `useUserProfile`, navbar, shared films, dll)
 * di-invalidate agar perubahan langsung terlihat di seluruh app.
 */
import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AVATAR_OPTIONS } from '@/lib/avatars';
import { cn } from '@/lib/utils';

interface AvatarPickerProps {
  userId: string;
  currentAvatarUrl?: string | null;
  trigger: React.ReactNode;
}

export const AvatarPicker = ({ userId, currentAvatarUrl, trigger }: AvatarPickerProps) => {
  const [open, setOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateAvatar = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);
      if (error) throw error;
      return avatarUrl;
    },
    onSuccess: () => {
      // Invalidate semua query yang berhubungan dengan profile/avatar
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['shared-collection-profiles'] });
      toast({ title: 'Avatar berhasil diperbarui' });
      setOpen(false);
      setPendingUrl(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal memperbarui avatar',
        description: error.message,
        variant: 'destructive',
      });
      setPendingUrl(null);
    },
  });

  const handlePick = (url: string) => {
    setPendingUrl(url);
    updateAvatar.mutate(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Avatar</DialogTitle>
          <DialogDescription>
            Pilih salah satu avatar di bawah ini untuk profil kamu.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 py-2">
          {AVATAR_OPTIONS.map(({ file, url }) => {
            const isSelected = currentAvatarUrl === url;
            const isPending = pendingUrl === url && updateAvatar.isPending;
            return (
              <button
                key={file}
                type="button"
                disabled={updateAvatar.isPending}
                onClick={() => handlePick(url)}
                className={cn(
                  'relative aspect-square rounded-2xl overflow-hidden border-2 transition-all',
                  'bg-muted hover:scale-105 active:scale-95',
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent hover:border-primary/50',
                  updateAvatar.isPending && 'opacity-60 cursor-not-allowed'
                )}
              >
                <img
                  src={url}
                  alt={file}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {isSelected && !isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                    <div className="bg-primary rounded-full p-1">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
                {isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
