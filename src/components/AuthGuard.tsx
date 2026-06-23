import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PUBLIC_PATHS = ["/auth", "/onboarding"];

interface ProfileRow {
  username: string | null;
}

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const checkedRef = useRef(false);

  navigateRef.current = navigate;

  useEffect(() => {
    const navigate = navigateRef.current;

    const checkProfile = async (userId: string | undefined) => {
      if (!userId || checkedRef.current) return;

      try {
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", userId)
          .maybeSingle<ProfileRow>();

        const pathname = window.location.pathname;
        const needsRedirect = !data?.username && !PUBLIC_PATHS.includes(pathname);

        if (needsRedirect) {
          navigate("/onboarding", { replace: true });
        }

        checkedRef.current = true;
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        checkedRef.current = false;
        checkProfile(session?.user?.id);
      }
    );

    checkProfile();

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
};
