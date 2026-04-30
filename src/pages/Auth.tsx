"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Fingerprint, Binary, ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { LogoImage } from "@/components/LogoImage"

const Auth = () => {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [signinEmailInput, setSigninEmailInput] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showLegacy, setShowLegacy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const redirectTo = location.state?.redirectTo || "/"

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) navigate(redirectTo)
    }
    checkSession()
  }, [navigate, redirectTo])

  const handleGoogleIdTokenSignIn = async (credential: string) => {
    try {
      setGoogleLoading(true)
      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credential,
      })
      if (error) throw error
      navigate(redirectTo)
    } catch (error: any) {
      toast({ title: "Failed to sign in with Google", description: error.message, variant: "destructive" })
      setGoogleLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (!signinEmailInput.includes("@")) throw new Error("Please enter a valid email")

      const { error } = await supabase.auth.signInWithPassword({
        email: signinEmailInput,
        password,
      })
      if (error) throw error
      navigate(redirectTo)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-[#020817]">
      {/* Background Cinematic Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-700/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-sky-500/10 blur-[150px] pointer-events-none" />

      <Link
        to="/"
        className="mb-8 z-10 flex items-center gap-2 group"
      >
        <LogoImage size={112} className="h-28 w-28" />
      </Link>

      <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
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
                    handleGoogleIdTokenSignIn(credentialResponse.credential)
                  }
                }}
                onError={() => {
                  toast({ title: "Error", description: "Google Login failed", variant: "destructive" })
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

          {/* Legacy email/password sign-in (grandfathered) */}
          {showLegacy && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <form onSubmit={handleSignIn} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="signinEmail" className="text-slate-300">Passkey</Label>
                  <div className="relative">
                    <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signinEmail"
                      type="email"
                      className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                      placeholder="enjunpilem"
                      value={signinEmailInput}
                      onChange={(e) => setSigninEmailInput(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-slate-300">Unique Code</Label>
                  <div className="relative">
                    <Binary className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10 bg-black/50 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                      placeholder="Z1B^)oUJWuh)_bsdedy45E"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? "Authorizing..." : "Authorize"}
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
  )
}

export default Auth

