import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Wraps the app to enforce onboarding:
 * If user is authenticated but profile.username is NULL (e.g. new Google sign-up),
 * redirect them to /onboarding before they can use the app.
 *
 * Public/guest pages (/, /auth, /onboarding, /shared-films, /search, /watch/...) are unaffected for guests.
 * Only logged-in users without a username are forced to /onboarding.
 */
const PUBLIC_PATHS = ["/auth", "/onboarding"];

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const check = async (userId: string | undefined) => {
      if (!userId) {
        if (active) setChecked(true);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;

      if (!data?.username && !PUBLIC_PATHS.includes(location.pathname)) {
        navigate("/onboarding", { replace: true });
      }
      setChecked(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      check(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setChecked(false);
      check(session?.user?.id);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  return <>{children}</>;
};
