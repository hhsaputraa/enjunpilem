'use client';

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { useMobileAuth, useGuestGuard } from '@/hooks/useMobileAuth';
import { cn } from '@/lib/utils';

export const MobileAuth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, signUp, resetPassword, loading } = useMobileAuth();
  
  // Redirect if already authenticated
  useGuestGuard();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    emailOrUsername: '',
    password: '',
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  // Reset password form state
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.emailOrUsername || !loginForm.password) {
      return;
    }

    const result = await signIn(loginForm.emailOrUsername, loginForm.password);
    
    if (result.success) {
      // Redirect to intended page or home
      const redirectTo = location.state?.redirectTo || '/';
      navigate(redirectTo);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.email || !registerForm.username || !registerForm.password) {
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }

    const result = await signUp(registerForm.email, registerForm.password, registerForm.username);
    
    if (result.success) {
      setActiveTab('login');
      setRegisterForm({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) return;

    const result = await resetPassword(resetEmail);
    
    if (result.success) {
      setShowResetForm(false);
      setResetEmail('');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-purple-500/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 pt-safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              EnjunPilem
            </span>
          </div>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">
              {showResetForm ? 'Reset Password' : 'Selamat Datang'}
            </h1>
            <p className="text-muted-foreground">
              {showResetForm 
                ? 'Masukkan email untuk reset password'
                : 'Masuk atau daftar untuk melanjutkan'
              }
            </p>
          </div>

          {/* Reset Password Form */}
          {showResetForm ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Masukkan email Anda"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={loading || !resetEmail}
                >
                  {loading ? 'Mengirim...' : 'Kirim Reset Password'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowResetForm(false)}
                  className="w-full"
                >
                  Kembali ke Login
                </Button>
              </div>
            </form>
          ) : (
            /* Google + legacy login */
            <div className="space-y-6">
              {/* Primary: Google */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base"
                onClick={() => signInWithGoogle()}
                disabled={loading}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Lanjutkan dengan Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">atau login user lama</span>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="login">Masuk Email/Password</TabsTrigger>
                </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email atau Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="text"
                        placeholder="Email atau username"
                        value={loginForm.emailOrUsername}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, emailOrUsername: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1 h-8 w-8"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full h-12"
                      disabled={loading || !loginForm.emailOrUsername || !loginForm.password}
                    >
                      {loading ? 'Masuk...' : 'Masuk'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowResetForm(true)}
                      className="w-full text-sm"
                    >
                      Lupa Password?
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1 h-8 w-8"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Konfirmasi Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Konfirmasi password"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-1 top-1 h-8 w-8"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12"
                    disabled={
                      loading || 
                      !registerForm.email || 
                      !registerForm.username || 
                      !registerForm.password ||
                      !registerForm.confirmPassword ||
                      registerForm.password !== registerForm.confirmPassword
                    }
                  >
                    {loading ? 'Mendaftar...' : 'Daftar'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* Footer */}
          <div className="text-center space-y-2 pt-6">
            <p className="text-xs text-muted-foreground">
              Dengan melanjutkan, Anda menyetujui
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <button className="text-primary hover:underline">
                Syarat & Ketentuan
              </button>
              <button className="text-primary hover:underline">
                Kebijakan Privasi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
