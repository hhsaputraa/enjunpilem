-- Add unique constraint on profiles.username (case-insensitive)
-- Allow NULL so newly signed-up Google users can pick username during onboarding
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_ci 
  ON public.profiles (LOWER(username)) 
  WHERE username IS NOT NULL;

-- Update handle_new_user trigger:
-- - For Google OAuth signups: leave username NULL so we redirect to /onboarding
-- - For email/password signups (legacy): keep auto-generating from email/metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  is_oauth boolean;
  candidate_username text;
BEGIN
  -- Detect OAuth signup (Google etc.) — provider info is in raw_app_meta_data
  is_oauth := COALESCE(NEW.raw_app_meta_data->>'provider', 'email') <> 'email';

  IF is_oauth THEN
    -- Google users: no username yet, force onboarding
    candidate_username := NULL;
  ELSE
    -- Legacy email/password: keep existing behavior
    candidate_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  END IF;

  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, candidate_username)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Make sure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();