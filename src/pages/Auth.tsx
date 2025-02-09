
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COOLDOWN_PERIOD = 300000; // 5 minutes in milliseconds

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [lastAttempt, setLastAttempt] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we're still in cooldown period
    const now = Date.now();
    if (now - lastAttempt < COOLDOWN_PERIOD) {
      const remainingMinutes = Math.ceil((COOLDOWN_PERIOD - (now - lastAttempt)) / 60000);
      toast({
        title: "Rate Limit",
        description: `Too many attempts. Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} before trying again.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setLastAttempt(now);
      
      // Check if email is valid
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      // Handle specific Supabase error cases
      if (error) {
        // Parse the error message if it's a JSON string
        let errorMessage = error.message;
        try {
          const errorBody = JSON.parse(error.message);
          if (errorBody.message) {
            errorMessage = errorBody.message;
          }
        } catch {
          // If parsing fails, use the original error message
        }

        // Handle rate limit errors specifically
        if (
          error.message.includes('rate limit') || 
          error.message.includes('over_email_send_rate_limit') ||
          error.status === 429
        ) {
          throw new Error('Email rate limit exceeded. Please wait 5 minutes before trying again.');
        }
        
        throw new Error(errorMessage);
      }
      
      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
  
      // Check if input is email or username
      const isEmail = emailOrUsername.includes('@');
      let signinEmail = emailOrUsername;
  
      if (!isEmail) {
        // Find email based on username from user_profiles view
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .maybeSingle();
  
        console.log("Profile result:", profile, profileError); // Debugging
  
        if (profileError) throw profileError;
        if (!profile || !profile.email) throw new Error('Username not found');
  
        signinEmail = profile.email;
      }
  
      const { error } = await supabase.auth.signInWithPassword({
        email: signinEmail,
        password,
      });
  
      if (error) throw error;
  
      navigate('/');
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to EnjunPilem</CardTitle>
          <CardDescription>Sign in to track your movies and shows</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Email or Username"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
