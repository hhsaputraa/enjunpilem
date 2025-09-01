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
  const { signIn, signUp, resetPassword, loading } = useMobileAuth();
  
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
            /* Login/Register Tabs */
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Masuk</TabsTrigger>
                <TabsTrigger value="register">Daftar</TabsTrigger>
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
