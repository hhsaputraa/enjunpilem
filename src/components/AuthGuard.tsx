import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Wraps the app to enforce onboarding:
 * If user is authenticated but profile.username is NULL (e.g. new Google sign-up),
 * redirect them to /onboarding before they can use the app.
 *
 * Public/guest pages (/, /auth, /onboarding, /shared-films, /search, /watch/...) are unaffected for guests.
 * Only logged-in users without a username are forced to /onboarding.
 *
 * Performance note: children are always rendered immediately — the onboarding
 * redirect happens in the background after mount, so there is no loading gate
 * that could block LCP.
 */
const PUBLIC_PATHS = ["/auth", "/onboarding"];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const check = async (userId: string | undefined) => {
      if (!userId) return;
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;

      if (!data?.username && !PUBLIC_PATHS.includes(location.pathname)) {
        navigate("/onboarding", { replace: true });
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      check(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  // Always render children immediately — no loading gate.
  return <>{children}</>;
};
