
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPicker } from '@/components/AvatarPicker';
import { Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  favorites_count: number;
  watchlist_count: number;
  collections_count: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: "Profile updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4" aria-label="Loading profile">
          <div className="skeleton h-12 w-48 rounded-lg"></div>
          <div className="skeleton h-4 w-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view your profile</h2>
          <Button onClick={() => navigate('/auth')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        {isLoading ? (
          <div className="flex flex-col gap-4" aria-label="Loading profile details">
            <div className="skeleton h-12 rounded mb-0"></div>
            <div className="skeleton h-12 rounded"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Avatar Picker */}
            <div className="flex flex-col items-center gap-3">
              <AvatarPicker
                userId={user.id}
                currentAvatarUrl={profile?.avatar_url}
                trigger={
                  <button
                    type="button"
                    className="relative group"
                    aria-label="Ubah avatar"
                  >
                    <Avatar className="h-24 w-24 border-2 border-primary/30 group-hover:border-primary transition-colors">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-2xl">
                        {(profile?.username || user.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md group-hover:scale-110 transition-transform">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </button>
                }
              />
              <p className="text-xs text-muted-foreground">Klik avatar untuk mengganti</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                  <Button 
                    onClick={() => updateProfileMutation.mutate(username)}
                    disabled={updateProfileMutation.isPending}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(profile?.username || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <Input
                    id="username"
                    value={profile?.username || ''}
                    disabled
                    className="bg-muted"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="ml-2"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-card border">
                  <p className="text-sm text-muted-foreground">Favorites</p>
                  <p className="text-2xl font-bold">{profile?.favorites_count || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border">
                  <p className="text-sm text-muted-foreground">Watchlist</p>
                  <p className="text-2xl font-bold">{profile?.watchlist_count || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border">
                  <p className="text-sm text-muted-foreground">Collections</p>
                  <p className="text-2xl font-bold">{profile?.collections_count || 0}</p>
                </div>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
