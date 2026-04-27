'use client';

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Fingerprint, Binary, ChevronDown, ChevronUp } from 'lucide-react';
import { useMobileAuth, useGuestGuard } from '@/hooks/useMobileAuth';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

export const MobileAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogleIdToken, loading } = useMobileAuth();
  
  // Redirect if already authenticated
  useGuestGuard();

  const [showLegacy, setShowLegacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    emailOrUsername: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.emailOrUsername || !loginForm.password) return;

    const result = await signIn(loginForm.emailOrUsername, loginForm.password);
    if (result.success) {
      const redirectTo = location.state?.redirectTo || '/';
      const stateToForward = location.state?.showAddSheet ? { showAddSheet: true } : {};
      navigate(redirectTo, { state: stateToForward });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#020817]">
      {/* Background Cinematic Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[100vw] h-[100vw] rounded-full bg-cyan-600/20 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[100vw] h-[100vw] rounded-full bg-blue-700/20 blur-[90px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[600px] max-h-[600px] rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

      <div
        onClick={() => navigate('/')}
        className="mb-8 z-10 flex items-center gap-2 group cursor-pointer"
      >
        <img src="/image.png" alt="EnjunPilem Logo" className="h-24 w-24" />
      </div>

      <Card className="w-full max-w-sm border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600" />

        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl text-center text-white font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-center text-slate-300 text-sm">
            Sign in or Login with Google account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Primary: Google Sign In */}
          <div className="w-full flex justify-center">
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    signInWithGoogleIdToken(credentialResponse.credential).then(res => {
                      if (res.success) {
                        const redirectTo = location.state?.redirectTo || '/';
                        const stateToForward = location.state?.showAddSheet ? { showAddSheet: true } : {};
                        navigate(redirectTo, { state: stateToForward });
                      }
                    });
                  }
                }}
                onError={() => {
                  console.error('Layanan Google Login gagal');
                }}
                theme="filled_black"
                shape="pill"
                text="continue_with"
              />
            </GoogleOAuthProvider>
          </div>

          <div className="pt-2">
            <Button 
              variant="ghost" 
              onClick={() => setShowLegacy(!showLegacy)}
              className="w-full text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors h-8"
            >
              <span className="flex items-center gap-2">
                {showLegacy ? "Hide" : "Show"}
                {showLegacy ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </span>
            </Button>
          </div>

          {showLegacy && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-slate-300">Scan</Label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-email"
                      type="email"
                      className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                      placeholder="enjunpilem"
                      value={loginForm.emailOrUsername}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, emailOrUsername: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-slate-300">Unique Code</Label>
                  <div className="relative">
                    <Binary className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="pl-10 pr-10 bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                      placeholder="••••••••••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 group"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 
                        <EyeOff className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" /> : 
                        <Eye className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                      }
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-colors"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 z-10 text-center text-sm">
        <Link to="/" className="text-slate-400 hover:text-cyan-400 transition-colors px-4 py-2 rounded-full hover:bg-white/5">
          ← Return to home
        </Link>
      </div>
    </div>
  );
};
