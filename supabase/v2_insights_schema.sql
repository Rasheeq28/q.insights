-- Step 1: Add insight columns to existing public.users table
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS user_type text,
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS usage_frequency text;

-- Step 2: Create a staging table for signup insights (pre-confirmation)
CREATE TABLE IF NOT EXISTS public.signup_insights (
    email text PRIMARY KEY,
    user_type text,
    experience_level text,
    usage_frequency text,
    created_at timestamp with time zone DEFAULT now()
);

-- Step 3: Create feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    friction boolean,
    friction_text text,
    missing_feature text,
    email text,
    created_at timestamp with time zone DEFAULT now()
);

-- Step 4: Enable RLS on new tables
ALTER TABLE public.signup_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Allow public insertion into signup_insights (needed during email confirmation wait)
CREATE POLICY "Allow public insert into signup_insights" 
ON public.signup_insights FOR INSERT 
WITH CHECK (true);

-- Allow public update of signup_insights (needed for upsert)
CREATE POLICY "Allow public update of signup_insights"
ON public.signup_insights FOR UPDATE
USING (true);

-- Allow public insertion into user_feedback
CREATE POLICY "Allow public insert into user_feedback" 
ON public.user_feedback FOR INSERT 
WITH CHECK (true);

-- Step 5: (Optional but Recommended) Trigger to auto-move data into users table
-- Run this in your Supabase SQL Editor to automate the sync
CREATE OR REPLACE FUNCTION public.sync_user_insights()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users 
    SET 
        user_type = s.user_type,
        experience_level = s.experience_level,
        usage_frequency = s.usage_frequency
    FROM public.signup_insights s
    WHERE public.users.email = s.email
    AND public.users.id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger should fire after a new user is created in public.users
-- Assuming you have an existing trigger that populates public.users from auth.users
-- If not, you might need to adjust when this runs.
DROP TRIGGER IF EXISTS on_user_signup_sync_insights ON public.users;
CREATE TRIGGER on_user_signup_sync_insights
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_insights();
