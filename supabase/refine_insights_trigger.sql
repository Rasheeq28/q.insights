-- 1. CLEANUP (Remove the old staging table mechanism)
DROP TRIGGER IF EXISTS on_user_signup_sync_insights ON public.users;
DROP FUNCTION IF EXISTS public.sync_user_insights();
DROP TABLE IF EXISTS public.signup_insights CASCADE;

-- 2. CREATE OR UPDATE THE SYNC FUNCTION
-- This function runs whenever a new user is created in auth.users
-- and automatically pulls metadata into the public.users profile.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, user_type, experience_level, usage_frequency)
  VALUES (
    new.id, 
    new.email, 
    (new.raw_user_meta_data->>'user_type'),
    (new.raw_user_meta_data->>'experience_level'),
    (new.raw_user_meta_data->>'usage_frequency')
  )
  ON CONFLICT (id) DO UPDATE SET
    user_type = EXCLUDED.user_type,
    experience_level = EXCLUDED.experience_level,
    usage_frequency = EXCLUDED.usage_frequency;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENSURE THE TRIGGER IS ACTIVE
-- This trigger fires whenever a new record is added to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
