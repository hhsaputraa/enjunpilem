import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, User, X } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Guard: must be authenticated, must NOT already have username
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;

      if (profile?.username) {
        // Already onboarded
        navigate("/");
        return;
      }
      setUser(session.user);
    })();
    return () => { active = false; };
  }, [navigate]);

  const validation = useMemo(() => {
    if (!username) return { ok: false, msg: "" };
    if (!USERNAME_REGEX.test(username)) {
      return { ok: false, msg: "3-20 karakter, huruf/angka/garis bawah saja" };
    }
    return { ok: true, msg: "" };
  }, [username]);

  // Debounced availability check
  useEffect(() => {
    if (!validation.ok) {
      setAvailable(null);
      return;
    }
    setChecking(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", username)
        .maybeSingle();
      if (error && error.code !== "PGRST116") {
        setAvailable(null);
      } else {
        setAvailable(!data);
      }
      setChecking(false);
    }, 400);
    return () => clearTimeout(t);
  }, [username, validation.ok]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validation.ok || !available) return;

    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Gagal menyimpan username",
        description: error.message.includes("duplicate")
          ? "Username sudah dipakai orang lain"
          : error.message,
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    toast({ title: "Selamat datang!", description: `Halo, @${username}` });
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-background/95">
      <Card className="w-full max-w-md border-border/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600" />
        <CardHeader>
          <CardTitle className="text-2xl">Pilih Username</CardTitle>
          <CardDescription>
            Selamat datang, {user.email}! Pilih username unik untuk melengkapi profil Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  className="pl-10 pr-10"
                  placeholder="contoh: john_doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.trim())}
                  autoFocus
                  required
                />
                <div className="absolute right-3 top-3">
                  {checking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!checking && available === true && <Check className="h-4 w-4 text-green-500" />}
                  {!checking && available === false && <X className="h-4 w-4 text-destructive" />}
                </div>
              </div>
              {validation.msg && (
                <p className="text-xs text-destructive">{validation.msg}</p>
              )}
              {!checking && validation.ok && available === false && (
                <p className="text-xs text-destructive">Username sudah dipakai</p>
              )}
              {!checking && validation.ok && available === true && (
                <p className="text-xs text-green-500">Username tersedia ✓</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              disabled={submitting || !validation.ok || !available || checking}
            >
              {submitting ? "Menyimpan..." : "Lanjutkan"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
