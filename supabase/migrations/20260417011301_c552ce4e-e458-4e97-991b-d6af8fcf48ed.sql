
-- 1. Fix PUBLIC_USER_DATA: Remove "Allow public read" policy on profiles
DROP POLICY IF EXISTS "Allow public read" ON public.profiles;

-- 2. Fix EXPOSED_SENSITIVE_DATA: Remove anonymous read on activity_logs
DROP POLICY IF EXISTS "Allow anonymous read access" ON public.activity_logs;

-- 3. Fix SUPA_auth_users_exposed + user_profiles_email + SUPA_security_definer_view:
-- Drop the user_profiles view that exposes auth.users emails publicly
DROP VIEW IF EXISTS public.user_profiles;

-- Replace with a SECURITY DEFINER function that resolves username -> email
-- internally without ever returning the email to the client. It returns whether
-- the username exists, so the client can know to call signInWithPassword.
-- For the actual sign-in, the client must use the email directly. To avoid
-- email enumeration, we instead expose an RPC that performs the lookup
-- and returns nothing sensitive. Since signInWithPassword requires email on
-- the client side, we provide a function `lookup_email_for_login` that
-- returns the email ONLY when the correct password is later validated by
-- Supabase auth — but that's not possible in one call. The minimal-leak
-- approach: expose `username_to_email` only to authenticated context is
-- impossible (login is pre-auth). So: keep a SECURITY DEFINER RPC that
-- returns the email but rate-limit at app level — OR force users to log in
-- with email. We choose: REMOVE username login support; users must use email.
-- This fully eliminates the enumeration vector.

-- 4. Fix SUPA_function_search_path_mutable on handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  RETURN new;
END;
$function$;
